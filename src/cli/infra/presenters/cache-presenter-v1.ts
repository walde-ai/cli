import { ICachePresenter } from '@/cli/domain/ports/presenters/i-cache-presenter';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { CliTheme } from './cli-theme';

/**
 * Cache presenter implementation using component composition.
 */
export class CachePresenterV1 implements ICachePresenter {
  constructor(
    private readonly spinner: ISpinnerComponent,
    private readonly config: PresenterConfig
  ) {}

  public startLoading(message: string): void {
    this.spinner.start(message);
  }

  public stopLoading(): void {
    this.spinner.stop();
  }

  public showInvalidated(invalidationId: string): void {
    console.log(CliTheme.accent(`✓ Cache invalidated (ID: ${invalidationId})`));
  }

  public showError(message: string): void {
    console.error(CliTheme.error(`✗ ${message}`));
  }

  public showWarning(message: string): void {
    console.log(CliTheme.soft(`! ${message}`));
  }
}
