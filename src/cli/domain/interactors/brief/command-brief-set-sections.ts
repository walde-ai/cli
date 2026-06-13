import { MakeWaldeAdmin, CredentialsProvider } from '@walde.ai/sdk';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { promises as fs } from 'fs';
import { UserError } from '@/cli/domain/exceptions';
import { sectionDisplayLabel } from '@/cli/domain/utils/section-display';

type WaldeAdmin = ReturnType<typeof MakeWaldeAdmin>;

export interface SetSectionsOptions {
  briefId: string;
  intent?: string;
  namingConventions?: string;
  contracts?: string;
  architecture?: string;
  approach?: string;
  appendix?: string;
  designDecisions?: string;
  intentFile?: string;
  namingConventionsFile?: string;
  contractsFile?: string;
  architectureFile?: string;
  approachFile?: string;
  appendixFile?: string;
  designDecisionsFile?: string;
  author?: string;
}

/**
 * BriefState type, duplicated in the CLI layer for UX filtering only.
 * The API remains the authoritative enforcement point for section locking.
 */
type BriefState =
  | 'DRAFT'
  | 'INTENT_DEFINED'
  | 'TECH_SPEC_DEFINED'
  | 'IMPLEMENTING'
  | 'IMPLEMENTED'
  | 'FAILED'
  | 'ARCHIVED';

const ALL_SECTIONS: string[] = [
  'intent',
  'namingConventions',
  'contracts',
  'architecture',
  'approach',
  'appendix',
  'designDecisions',
];

const LOCKED_SECTIONS: Record<BriefState, ReadonlyArray<string>> = {
  DRAFT: [],
  INTENT_DEFINED: ['intent'],
  TECH_SPEC_DEFINED: ['intent', 'namingConventions', 'contracts', 'architecture', 'approach'],
  IMPLEMENTING: ALL_SECTIONS,
  IMPLEMENTED: ALL_SECTIONS,
  FAILED: ALL_SECTIONS,
  ARCHIVED: ALL_SECTIONS,
};

/**
 * Return the section keys that may be modified for a given Brief state.
 *
 * This helper exists in the CLI layer purely for UX filtering so the user
 * never selects a section the API would immediately reject. The API
 * enforces the same rules independently and remains the authoritative gate.
 */
export function getModifiableSections(state: BriefState): string[] {
  const locked = new Set(LOCKED_SECTIONS[state]);
  return ALL_SECTIONS.filter((key) => !locked.has(key));
}

export class CommandBriefSetSections {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IBriefPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: SetSectionsOptions): Promise<void> {
    const sections: Record<string, string> = {};

    if (options.intent) sections.intent = options.intent;
    if (options.namingConventions) sections.namingConventions = options.namingConventions;
    if (options.contracts) sections.contracts = options.contracts;
    if (options.architecture) sections.architecture = options.architecture;
    if (options.approach) sections.approach = options.approach;
    if (options.appendix) sections.appendix = options.appendix;
    if (options.designDecisions) sections.designDecisions = options.designDecisions;

    if (options.intentFile) sections.intent = await fs.readFile(options.intentFile, 'utf-8');
    if (options.namingConventionsFile) sections.namingConventions = await fs.readFile(options.namingConventionsFile, 'utf-8');
    if (options.contractsFile) sections.contracts = await fs.readFile(options.contractsFile, 'utf-8');
    if (options.architectureFile) sections.architecture = await fs.readFile(options.architectureFile, 'utf-8');
    if (options.approachFile) sections.approach = await fs.readFile(options.approachFile, 'utf-8');
    if (options.appendixFile) sections.appendix = await fs.readFile(options.appendixFile, 'utf-8');
    if (options.designDecisionsFile) sections.designDecisions = await fs.readFile(options.designDecisionsFile, 'utf-8');

    const author = options.author || 'user';

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory
    });

    if (Object.keys(sections).length === 0) {
      await this.runInteractive(walde, options.briefId, author);
      return;
    }

    this.presenter.startOperation('Updating brief sections...');

    try {
      const result = await walde
        .brief({ id: options.briefId })
        .setSections(sections, { author })
        .resolve();
      
      this.presenter.stopOperation();

      if (result.isErr()) {
        this.presenter.showError(result.unwrapErr());
        return;
      }

      const brief = result.unwrap();
      this.presenter.presentBriefUpdated(brief);
    } catch (error: any) {
      this.presenter.stopOperation();
      this.presenter.showError(error.message || String(error));
    }
  }

  private async runInteractive(walde: WaldeAdmin, briefId: string, author: string): Promise<void> {
    this.presenter.startOperation('Fetching brief...');
    let briefState: BriefState;
    try {
      const result = await walde.brief({ id: briefId }).resolve();
      this.presenter.stopOperation();
      if (result.isErr()) {
        this.presenter.showError(result.unwrapErr());
        return;
      }
      briefState = result.unwrap().state as BriefState;
    } catch (error: any) {
      this.presenter.stopOperation();
      this.presenter.showError(error.message || String(error));
      return;
    }

    const modifiable = getModifiableSections(briefState);
    if (modifiable.length === 0) {
      this.presenter.showError(`Brief is in state ${briefState}; no sections can be modified.`);
      return;
    }

    const sections: Record<string, string> = {};
    let keepGoing = true;
    while (keepGoing) {
      const selectedKey = await this.presenter.requestSectionSelection(modifiable);
      const mode = await this.presenter.requestSectionInputMode();
      let content: string;
      if (mode === 'file') {
        const filePath = await this.presenter.requestSectionFilePath();
        content = await fs.readFile(filePath, 'utf-8');
      } else {
        content = await this.presenter.requestSectionContent(sectionDisplayLabel(selectedKey));
      }
      sections[selectedKey] = content;
      keepGoing = await this.presenter.requestContinue();
    }

    if (Object.keys(sections).length === 0) {
      throw new UserError('At least one section must be provided');
    }

    this.presenter.startOperation('Updating brief sections...');
    try {
      const result = await walde
        .brief({ id: briefId })
        .setSections(sections, { author })
        .resolve();
      this.presenter.stopOperation();
      if (result.isErr()) {
        this.presenter.showError(result.unwrapErr());
        return;
      }
      const updated = result.unwrap();
      this.presenter.presentBriefUpdated(updated);
    } catch (error: any) {
      this.presenter.stopOperation();
      this.presenter.showError(error.message || String(error));
    }
  }
}
