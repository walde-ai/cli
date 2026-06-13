import { promises as fs } from 'fs';

import { MakeWaldeAdmin, CredentialsProvider } from '@walde.ai/sdk';

import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

export interface EventAppendOptions {
  briefId: string;
  type?: 'edit' | 'commentAdd';
  title?: string;
  state?: string;
  sections?: Record<string, string>;
  content?: string;
  file?: string;
  author?: string;
}

export class CommandBriefEventAppend {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IBriefPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: EventAppendOptions): Promise<void> {
    const author = options.author || 'user';

    let type: 'edit' | 'commentAdd';
    let payload: Record<string, unknown>;

    if (options.file) {
      const raw = await fs.readFile(options.file, 'utf-8');
      const parsed = JSON.parse(raw);
      type = parsed.type;
      payload = parsed.payload ?? {};
    } else {
      type = options.type ?? 'edit';
      if (type === 'commentAdd') {
        if (!options.content) {
          this.presenter.showError('--content is required for commentAdd events');
          return;
        }
        payload = { content: options.content };
      } else {
        const editPayload: Record<string, unknown> = {};
        if (options.title !== undefined) editPayload.title = options.title;
        if (options.state !== undefined) editPayload.state = options.state;
        if (options.sections && Object.keys(options.sections).length > 0) {
          editPayload.sections = options.sections;
        }
        if (Object.keys(editPayload).length === 0) {
          this.presenter.showError('At least one of --title, --state, or --section is required for edit events');
          return;
        }
        payload = editPayload;
      }
    }

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory,
    });

    this.presenter.startOperation('Appending event...');

    try {
      const result = await walde
        .brief({ id: options.briefId })
        .appendEvent({ type, payload, author: { name: author } })
        .resolve();

      this.presenter.stopOperation();

      if (result.isErr()) {
        this.presenter.showError(result.unwrapErr());
        return;
      }

      this.presenter.presentBriefUpdated(result.unwrap());
    } catch (error: any) {
      this.presenter.stopOperation();
      this.presenter.showError(error.message || String(error));
    }
  }
}
