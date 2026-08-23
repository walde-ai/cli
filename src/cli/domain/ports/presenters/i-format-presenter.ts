/**
 * One row of the `walde format list` table.
 */
export interface FormatListItem {
  id: string;
  name: string;
  fieldCount: number;
  updatedAt: string;
}

/**
 * Prompt context shared by the definition prompts: `currentName` /
 * `currentDefault` prefill the answer for the edit flow (an empty answer
 * keeps a prefillable current value), and `notice` restates the rule the
 * previous answer violated so the interactive flow can re-prompt.
 */
export interface FormatPromptContext {
  currentName?: string;
  currentDefault?: string;
  notice?: string;
}

/**
 * Presenter contract for the format management commands.
 *
 * Used by `walde format list`, `walde format create`, `walde format edit`,
 * and `walde format delete`. All rendering and prompting lives here so the
 * interactors stay free of terminal concerns.
 */
export interface IFormatPresenter {
  // progress around each API call
  startFormatOperation(message: string): void;
  stopFormatOperation(): void;

  // list
  presentFormats(formats: FormatListItem[]): void;

  // interactive definition assembly
  requestFormatName(context: FormatPromptContext): Promise<string>;
  requestFieldType(context: { currentType?: string }): Promise<string>;
  requestFieldName(context: FormatPromptContext): Promise<string>;
  requestFieldDescription(context: { currentDescription?: string }): Promise<string>;
  requestFieldDefault(context: FormatPromptContext & { type: string }): Promise<string>;
  requestAddAnotherField(): Promise<boolean>;
  requestEditAnotherField(fieldName: string): Promise<boolean>;

  // delete
  requestDeleteConfirmation(formatId: string): Promise<boolean>;

  // success lines
  presentFormatCreated(name: string, formatId: string): void;
  presentFormatEdited(name: string, formatId: string): void;
  presentFormatDeleted(formatId: string): void;
  presentDeletionCancelled(): void;

  // shared output
  showNotice(message: string): void;
  showError(message: string): void;
}
