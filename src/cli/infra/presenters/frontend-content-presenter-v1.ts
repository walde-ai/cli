import { IFrontendContentPresenter } from '@/cli/domain/ports/presenters/i-frontend-content-presenter';
import { FrontendContent } from '@walde.ai/sdk';
import { MarkdownPart } from '@walde.ai/sdk';
import { KeyValuePart } from '@walde.ai/sdk';
import { StringPart } from '@walde.ai/sdk';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { CliTheme } from './cli-theme';

/**
 * Frontend content presenter implementation
 */
export class FrontendContentPresenterV1 implements IFrontendContentPresenter {
  private spinner?: any;

  constructor(
    private readonly spinnerComponent: ISpinnerComponent,
    private readonly config: PresenterConfig
  ) {}

  /**
   * Show loading state for content
   */
  showLoadingContent(): void {
    this.spinner = this.spinnerComponent.start('Loading content...');
  }

  /**
   * Show content with appropriate formatting
   */
  showContent(content: FrontendContent): void {
    if (this.spinner) {
      this.spinnerComponent.succeed(this.spinner, 'Content loaded successfully');
    }

    console.log(`\n${CliTheme.accent.bold('Content:')} ${CliTheme.body(content.name)}`);
    console.log(`   Key: ${content.key}`);
    console.log(`   Format: ${content.format.name} (${content.format.id})`);
    console.log(`   Parts: ${Object.keys(content.parts).length} items\n`);

    Object.entries(content.parts).forEach(([partName, part]) => {
      console.log(`${CliTheme.accent.bold(partName + ':')}`);
      this.presentPart(part);
      console.log('');
    });
  }

  /**
   * Present individual content part based on type
   */
  private presentPart(part: any): void {
    if (part.data === 'markdown') {
      this.presentMarkdown(part.formatPart);
    } else if (part.data === 'keyvalue') {
      this.presentKeyValue(part.formatPart);
    } else if (typeof part.formatPart === 'string') {
      this.presentString(part.formatPart);
    } else {
      console.log('   Raw:', JSON.stringify(part, null, 2));
    }
  }

  /**
   * Present markdown content
   */
  private presentMarkdown(content: string): void {
    console.log('   Type: Markdown');
    console.log('   Content:');
    console.log(content.split('\n').map(line => `   ${line}`).join('\n'));
  }

  /**
   * Present key-value content
   */
  private presentKeyValue(content: any): void {
    console.log('   Type: Key-Value');
    if (typeof content === 'object') {
      Object.entries(content).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    } else {
      console.log(`   Value: ${content}`);
    }
  }

  /**
   * Present string content
   */
  private presentString(content: string): void {
    console.log('   Type: String');
    console.log(`   Value: ${content}`);
  }

  /**
   * Show content error
   */
  showContentError(error: any): void {
    if (this.spinner) {
      this.spinnerComponent.fail(this.spinner, 'Failed to load content');
    }

    console.error(CliTheme.error(`✗ Error: ${error.message}`));
    process.exit(1);
  }
}
