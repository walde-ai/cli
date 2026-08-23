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

export interface FormatCreateOptions {
  projectId?: string;
  name?: string;
  fields?: string[];
}

/**
 * Command interactor for `walde format create`.
 *
 * Interactive by default with a fully-flagged non-interactive mode: whenever
 * `--name` and at least one `--field` are both supplied no prompt is shown;
 * whenever either is missing the interactive flow fills the gaps, prompting
 * only for what the flags did not provide.
 */
export class CommandFormatCreate {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IFormatPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  public async execute(options: FormatCreateOptions): Promise<void> {
    const projectId = await new ResolveFormatProject(new FileWorkspaceConfigRepo()).resolve(options.projectId);

    const flagFields = (options.fields ?? []).map((spec) => new ParseFieldSpec().parse(spec));
    let formatName: string;
    let fields: FieldSpec[];

    if (options.name !== undefined && flagFields.length > 0) {
      formatName = options.name;
      fields = flagFields;
    } else {
      if (!this.canPrompt()) {
        this.reportMissingFlags(options.name, flagFields.length);
      }
      formatName = options.name !== undefined
        ? options.name
        : await this.promptFormatName(undefined);
      fields = flagFields.length > 0 ? flagFields : await this.promptFieldLoop([]);
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

    this.presenter.startFormatOperation(`Creating format ${formatName}...`);

    try {
      const result = await walde
        .formats({ projectId })
        .create({ name: formatName, fields: fields as FieldDefinition[] })
        .resolve();

      this.presenter.stopFormatOperation();

      if (result.isErr()) {
        this.presenter.showError(String(result.unwrapErr()));
        return;
      }

      const created = result.unwrap();
      this.presenter.presentFormatCreated(created.name, created.id);
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

  private async promptFormatName(currentName: string | undefined): Promise<string> {
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

  private async promptFieldLoop(existing: FieldSpec[]): Promise<FieldSpec[]> {
    const fields = [...existing];
    while (true) {
      fields.push(await this.promptField(fields.map((field) => field.name)));
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
    }
  }

  private async promptField(existingNames: string[], current?: FieldDefinition): Promise<FieldSpec> {
    let nameNotice: string | undefined = undefined;
    let name = '';
    while (true) {
      const answer = await this.presenter.requestFieldName({ currentName: current?.name, notice: nameNotice });
      const violation = fieldNameViolation(answer) ?? this.duplicateNameViolation(answer, existingNames);
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

  private duplicateNameViolation(name: string, existingNames: string[]): string | null {
    if (existingNames.includes(name)) {
      return `Duplicate field name '${name}' in format definition`;
    }
    return null;
  }
}
