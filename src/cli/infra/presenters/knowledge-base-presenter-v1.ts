import { KnowledgeBaseMatch, KnowledgeBaseFetchResult } from '@walde.ai/sdk';
import { IKnowledgeBasePresenter } from '@/cli/domain/ports/presenters/i-knowledge-base-presenter';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { CliTheme } from './cli-theme';

/**
 * Knowledge Base presenter built on the shared component primitives.
 */
export class KnowledgeBasePresenterV1 implements IKnowledgeBasePresenter {
  constructor(
    private readonly spinner: ISpinnerComponent,
    private readonly config: PresenterConfig
  ) {}

  public startOperation(message: string): void {
    this.spinner.start(message);
  }

  public stopOperation(): void {
    this.spinner.stop();
  }

  public showError(message: string): void {
    console.error(CliTheme.error(`✗ Error: ${message}`));
  }

  public presentMatches(matches: KnowledgeBaseMatch[]): void {
    if (matches.length === 0) {
      console.log(CliTheme.soft('No matches found.'));
      return;
    }

    matches.forEach((match, index) => {
      console.log(CliTheme.accent(`#${index + 1}  score ${match.score}`));
      console.log(CliTheme.soft(`  path: ${match.path}`));
      console.log(
        CliTheme.soft(
          `  object: ${match.objectReference.name} ` +
            `(${match.objectReference.objectId} v${match.objectReference.version}, ` +
            `${match.objectReference.contentType})`
        )
      );
      console.log(`  ${match.passage}`);
      console.log();
    });
  }

  public presentFetchResult(result: KnowledgeBaseFetchResult): void {
    console.log(CliTheme.soft(`contentType: ${result.contentType}`));
    console.log(CliTheme.soft(`encoding: ${result.encoding}`));
    console.log(result.content);
  }
}
