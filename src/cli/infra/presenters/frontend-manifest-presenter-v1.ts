import Table from 'cli-table3';
import { IFrontendManifestPresenter } from '@/cli/domain/ports/presenters/i-frontend-manifest-presenter';
import { Manifest } from '@walde.ai/sdk';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { CliTheme } from './cli-theme';

/**
 * Frontend manifest presenter implementation
 */
export class FrontendManifestPresenterV1 implements IFrontendManifestPresenter {
  constructor(
    private readonly spinnerComponent: ISpinnerComponent,
    private readonly config: PresenterConfig
  ) {}

  /**
   * Show loading state for manifest
   */
  showLoadingManifest(): void {
    this.spinnerComponent.start('Loading manifest...');
  }

  /**
   * Show manifest contents in tabular format
   */
  showManifest(manifest: Manifest): void {
    this.spinnerComponent.stop();

    if (manifest.contents.length === 0) {
      console.log(CliTheme.soft('No content found in manifest.'));
      return;
    }

    console.log(`\n${CliTheme.accent.bold('Manifest Contents:')}`);
    
    const table = new Table({
      head: ['', CliTheme.accent('ID'), CliTheme.accent('Key'), CliTheme.accent('Name'), CliTheme.accent('Locales')],
      style: {
        head: [],
        border: [],
        'padding-left': 0,
        'padding-right': 2
      },
      chars: {
        'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
        'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
        'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
        'right': '', 'right-mid': '', 'middle': ' '
      }
    });

    let rowNumber = 1;
    manifest.contents.forEach(content => {
      table.push([
        CliTheme.soft(String(rowNumber++)),
        CliTheme.body(content.id),
        CliTheme.body(content.key),
        CliTheme.body(content.name),
        CliTheme.body(content.locales.join(', '))
      ]);
    });

    console.log(table.toString());
    console.log(CliTheme.soft(`\nTotal: ${manifest.contents.length} content item${manifest.contents.length === 1 ? '' : 's'}`));
  }

  /**
   * Show manifest error
   */
  showManifestError(error: any): void {
    this.spinnerComponent.stop();
    console.error(CliTheme.error(`✗ Error: ${error.message}`));
    process.exit(1);
  }
}
