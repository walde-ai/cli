import { MakeWaldeAdmin, CredentialsProvider, FileWorkspaceConfigRepo, FormatDefinition, FieldDefinition } from '@walde.ai/sdk';
import { IFormatPresenter } from '@/cli/domain/ports/presenters/i-format-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { UserError } from '@/cli/domain/exceptions';
import { ResolveFormatProject } from './resolve-format-project';
import {
  FieldSpec,
  FormatFieldTypeToken,
  MAX_FORMAT_FIELD_COUNT,
  ParseFieldSpec,
  assertValidFormatDefinition,
  fieldDefaultTextToValue,
  fieldNameViolation,
  fieldTextDefaultViolation,
  formatNameViolation,
} from './parse-field-spec';

export interface FormatEditOptions {
  projectId?: string;
  name?: string;
  fields?: string[];
}

/**
 * Command interactor for `walde format edit <formatId>`.
 *
 * Edits a format with wholesale-replacement semantics: every field of the
 * resulting list replaces the stored set as one operation. When `--name`
 * and at least one `--field` are both supplied the edit is sent directly
 * from the flags without a pre-fetch; otherwise the current definition is
 * fetched so the interactive prompts are prefilled, with per-field editing
 * in format order before the add-another question.
 */
export class CommandFormatEdit {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IFormatPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  public async execute(formatId: string, options: FormatEditOptions): Promise<void> {
    const projectId = await new ResolveFormatProject(new FileWorkspaceConfigRepo()).resolve(options.projectId);

    const flagFields = (options.fields ?? []).map((spec) => new ParseFieldSpec().parse(spec));
    const fullyFlagged = options.name !== undefined && flagFields.length > 0;

    let formatName: string;
    let fields: FieldSpec[];

    if (fullyFlagged) {
      formatName = options.name as string;
      fields = flagFields;
    } else {
      if (!this.canPrompt()) {
        this.reportMissingFlags(options.name, flagFields.length);
      }
      const current = await this.fetchCurrentDefinition(projectId, formatId);
      if (current === null) {
        return;
      }
      this.presenter.showNotice(
        'Submitting replaces the entire definition: the name and the full field set you enter replace the stored ones as one operation, and fields you do not re-enter are dropped.'
      );
      formatName = options.name !== undefined
        ? options.name
        : await this.promptFormatName(current.name);
      fields = flagFields.length > 0 ? flagFields : await this.promptFieldLoopFrom(current);
    }

    assertValidFormatDefinition(formatName, fields);

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory,
    });

    this.presenter.startFormatOperation(`Updating format ${formatId}...`);

    try {
      const result = await walde
        .formats({ projectId })
        .edit({ formatId, name: formatName, fields: fields as FieldDefinition[] })
        .resolve();

      this.presenter.stopFormatOperation();

      if (result.isErr()) {
        this.presenter.showError(String(result.unwrapErr()));
        return;
      }

      const updated = result.unwrap();
      this.presenter.presentFormatEdited(updated.name, updated.id);
    } catch (error) {
      this.presenter.stopFormatOperation();
      this.presenter.showError(error instanceof Error ? error.message : String(error));
    }
  }

  private canPrompt(): boolean {
    return process.stdin.isTTY === true;
  }

  private reportMissingFlags(name: string | undefined, fieldCount: number): void {
    if (name === undefined) {
      throw new UserError('--name is required when the environment cannot prompt for it');
    }
    if (fieldCount === 0) {
      throw new UserError('at least one --field is required when the environment cannot prompt for it');
    }
    throw new UserError('unexpected missing format input');
  }

  private async fetchCurrentDefinition(projectId: string, formatId: string): Promise<FormatDefinition | null> {
    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory,
    });

    this.presenter.startFormatOperation(`Fetching format ${formatId}...`);

    try {
      const result = await walde.formats({ projectId }).get({ formatId }).resolve();

      this.presenter.stopFormatOperation();

      if (result.isErr()) {
        this.presenter.showError(String(result.unwrapErr()));
        return null;
      }

      return result.unwrap();
    } catch (error) {
      this.presenter.stopFormatOperation();
      this.presenter.showError(error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  private async promptFormatName(currentName: string): Promise<string> {
    let notice: string | undefined = undefined;
    while (true) {
      const answer = await this.presenter.requestFormatName({ currentName, notice });
      const violation = formatNameViolation(answer);
      if (violation === null) {
        return answer;
      }
      notice = violation;
    }
  }

  private async promptFieldLoopFrom(current: FormatDefinition): Promise<FieldSpec[]> {
    const fields: FieldSpec[] = current.fields.map((field) => ({
      name: field.name,
      description: field.description,
      type: field.type,
      defaultValue: field.defaultValue,
    }));

    for (const field of fields) {
      const editField = await this.presenter.requestEditAnotherField(field.name);
      if (editField) {
        const replacement = await this.promptField(
          fields.map((f) => f.name),
          field
        );
        field.name = replacement.name;
        field.description = replacement.description;
        field.type = replacement.type;
        field.defaultValue = replacement.defaultValue;
      }
    }

    while (true) {
      if (fields.length >= MAX_FORMAT_FIELD_COUNT) {
        this.presenter.showNotice(
          `A format can declare at most ${MAX_FORMAT_FIELD_COUNT} fields; stopping field entry.`
        );
        return fields;
      }
      const addAnother = await this.presenter.requestAddAnotherField();
      if (!addAnother) {
        return fields;
      }
      fields.push(await this.promptField(fields.map((f) => f.name)));
    }
  }

  private async promptField(existingNames: string[], current?: FieldDefinition): Promise<FieldSpec> {
    let nameNotice: string | undefined = undefined;
    let name = '';
    while (true) {
      const answer = await this.presenter.requestFieldName({ currentName: current?.name, notice: nameNotice });
      const violation = fieldNameViolation(answer) ?? this.duplicateNameViolation(answer, existingNames, current?.name);
      if (violation === null) {
        name = answer;
        break;
      }
      nameNotice = violation;
    }

    const type = await this.presenter.requestFieldType({ currentType: current?.type }) as FormatFieldTypeToken;

    const description = await this.presenter.requestFieldDescription({ currentDescription: current?.description });

    let defaultNotice: string | undefined = undefined;
    let defaultValue: string | number = '';
    while (true) {
      const answer = await this.presenter.requestFieldDefault({
        type,
        currentDefault: current !== undefined ? String(current.defaultValue) : undefined,
        notice: defaultNotice,
      });
      const violation = fieldTextDefaultViolation(type, answer);
      if (violation === null) {
        defaultValue = fieldDefaultTextToValue(type, answer);
        break;
      }
      defaultNotice = violation;
    }

    return { name, description, type, defaultValue };
  }

  private duplicateNameViolation(name: string, existingNames: string[], currentName?: string): string | null {
    if (currentName !== undefined && name === currentName) {
      return null;
    }
    if (existingNames.includes(name)) {
      return `Duplicate field name '${name}' in format definition`;
    }
    return null;
  }
}
