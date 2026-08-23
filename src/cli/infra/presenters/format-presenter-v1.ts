import Table from 'cli-table3';
import { IFormatPresenter, FormatListItem, FormatPromptContext } from '@/cli/domain/ports/presenters/i-format-presenter';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { IPromptComponent } from '@/cli/domain/ports/presenters/components/i-prompt-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { FormatFieldTypeToken, FORMAT_FIELD_TYPE_TOKENS } from '@/cli/domain/interactors/format/parse-field-spec';
import { CliTheme } from './cli-theme';

const FIELD_TYPE_LABELS: Record<FormatFieldTypeToken, string> = {
  string: 'String - single-line text',
  text: 'Text - multiline plain text',
  markdown: 'Markdown - rich text',
  date: 'Date - YYYY-MM-DD calendar date',
  number: 'Number',
  image: 'Image - assets/ URL',
  file: 'File - assets/ URL',
};

const FIELD_TYPE_CHOICES: Array<{ name: string; value: string }> = FORMAT_FIELD_TYPE_TOKENS.map(
  (token) => ({ name: FIELD_TYPE_LABELS[token], value: token })
);

/**
 * Format presenter implementation built on the shared component primitives.
 */
export class FormatPresenterV1 implements IFormatPresenter {
  constructor(
    private readonly spinner: ISpinnerComponent,
    private readonly prompt: IPromptComponent,
    private readonly config: PresenterConfig
  ) {}

  // --- progress ---

  public startFormatOperation(message: string): void {
    this.spinner.start(message);
  }

  public stopFormatOperation(): void {
    this.spinner.stop();
  }

  // --- list ---

  public presentFormats(formats: FormatListItem[]): void {
    if (formats.length === 0) {
      console.log(CliTheme.soft('No formats found.'));
      return;
    }

    const table = new Table({
      head: [CliTheme.accent('ID'), CliTheme.accent('NAME'), CliTheme.accent('FIELDS'), CliTheme.accent('UPDATED')],
      style: { head: [], border: [], 'padding-left': 0, 'padding-right': 2 },
      chars: {
        'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
        'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
        'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
        'right': '', 'right-mid': '', 'middle': ' '
      }
    });

    for (const format of formats) {
      table.push([format.id, format.name, String(format.fieldCount), format.updatedAt]);
    }

    console.log(table.toString());
  }

  // --- interactive definition assembly ---

  public async requestFormatName(context: FormatPromptContext): Promise<string> {
    this.showNoticeFor(context.notice);
    if (context.currentName === undefined) {
      return this.prompt.text('Format name:');
    }
    const answer = await this.prompt.text(`Format name (${context.currentName}):`);
    return answer.trim() === '' ? context.currentName : answer;
  }

  public async requestFieldType(context: { currentType?: string }): Promise<string> {
    const suffix = context.currentType !== undefined ? ` (current: ${context.currentType})` : '';
    return this.prompt.select(`Field type${suffix}:`, FIELD_TYPE_CHOICES);
  }

  public async requestFieldName(context: FormatPromptContext): Promise<string> {
    this.showNoticeFor(context.notice);
    if (context.currentName === undefined) {
      return this.prompt.text('Field name (camelCase):');
    }
    const answer = await this.prompt.text(`Field name (${context.currentName}):`);
    return answer.trim() === '' ? context.currentName : answer;
  }

  public async requestFieldDescription(context: { currentDescription?: string }): Promise<string> {
    const suffix = context.currentDescription !== undefined && context.currentDescription !== ''
      ? ` (${context.currentDescription})`
      : '';
    return this.prompt.text(`Optional description${suffix}:`);
  }

  public async requestFieldDefault(context: FormatPromptContext & { type: string }): Promise<string> {
    this.showNoticeFor(context.notice);
    const suffix = context.currentDefault !== undefined ? ` (current: ${context.currentDefault})` : '';
    return this.prompt.text(`Default value for the ${context.type} field${suffix}:`);
  }

  public async requestAddAnotherField(): Promise<boolean> {
    return this.prompt.confirm('Add another field?', false);
  }

  public async requestEditAnotherField(fieldName: string): Promise<boolean> {
    return this.prompt.confirm(`Edit field '${fieldName}'?`, false);
  }

  // --- delete ---

  public async requestDeleteConfirmation(formatId: string): Promise<boolean> {
    return this.prompt.confirm(
      `Delete format ${formatId}? The format definition will be deleted; existing posts are not deleted.`,
      false
    );
  }

  // --- success lines ---

  public presentFormatCreated(name: string, formatId: string): void {
    console.log();
    console.log(CliTheme.accent(`✓ Format created: ${name} (${formatId})`));
    console.log();
    console.log(CliTheme.soft('Posts of this format are created from the hub or the SDK; walde content push publishes native posts only.'));
  }

  public presentFormatEdited(name: string, formatId: string): void {
    console.log();
    console.log(CliTheme.accent(`✓ Format updated: ${name} (${formatId})`));
  }

  public presentFormatDeleted(formatId: string): void {
    console.log(CliTheme.accent(`✓ Format ${formatId} deleted`));
  }

  public presentDeletionCancelled(): void {
    console.log(CliTheme.soft('Deletion cancelled.'));
  }

  // --- shared output ---

  public showNotice(message: string): void {
    console.log(CliTheme.soft(message));
  }

  public showError(message: string): void {
    console.error(CliTheme.error(`✗ Error: ${message}`));
    process.exitCode = 1;
  }

  private showNoticeFor(notice: string | undefined): void {
    if (notice !== undefined) {
      console.log(CliTheme.error(`✗ ${notice}`));
    }
  }
}
