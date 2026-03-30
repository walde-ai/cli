import { MakeWalde } from '@walde.ai/sdk';
import { IFrontendManifestPresenter } from '@/cli/domain/ports/presenters/i-frontend-manifest-presenter';

/**
 * Command to list frontend manifest contents
 */
export class CommandFrontendManifestList {
  constructor(
    private readonly presenter: IFrontendManifestPresenter
  ) {}

  /**
   * Execute the command
   */
  async execute(url: string): Promise<void> {
    try {
      this.presenter.showLoadingManifest();

      const walde = MakeWalde({ url });
      const manifestResult = await walde.manifest().resolve();

      if (manifestResult.isErr()) {
        this.presenter.showManifestError(manifestResult.unwrapErr());
        return;
      }

      const manifest = manifestResult.unwrap();
      this.presenter.showManifest(manifest);

    } catch (error: any) {
      this.presenter.showManifestError(error);
    }
  }
}
