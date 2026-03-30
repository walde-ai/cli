import { MakeWalde } from '@walde.ai/sdk';
import { IFrontendContentPresenter } from '@/cli/domain/ports/presenters/i-frontend-content-presenter';

export interface ContentGetOptions {
  url: string;
  id?: string;
  name?: string;
  key?: string;
  locale: string;
}

/**
 * Command to get frontend content
 */
export class CommandFrontendContentGet {
  constructor(
    private readonly presenter: IFrontendContentPresenter
  ) {}

  /**
   * Execute the command
   */
  async execute(options: ContentGetOptions): Promise<void> {
    try {
      if (!options.id && !options.name && !options.key) {
        this.presenter.showContentError(new Error('Must specify --id, --name, or --key'));
        return;
      }

      this.presenter.showLoadingContent();

      const walde = MakeWalde({ url: options.url });
      const contentsFuture = walde.contents();
      let contentFuture;

      if (options.id) {
        contentFuture = contentsFuture.id(options.id);
      } else if (options.name) {
        contentFuture = contentsFuture.name(options.name);
      } else if (options.key) {
        contentFuture = contentsFuture.key(options.key);
      }

      const contentResult = await contentFuture!.locale(options.locale).resolve();

      if (contentResult.isErr()) {
        this.presenter.showContentError(contentResult.unwrapErr());
        return;
      }

      const content = contentResult.unwrap();
      this.presenter.showContent(content);

    } catch (error: any) {
      this.presenter.showContentError(error);
    }
  }
}
