import { FrontendContent } from '@walde.ai/sdk';

/**
 * Interface for frontend content presentation
 */
export interface IFrontendContentPresenter {
  /**
   * Show loading state for content
   */
  showLoadingContent(): void;

  /**
   * Show content with appropriate formatting
   */
  showContent(content: FrontendContent): void;

  /**
   * Show content error
   */
  showContentError(error: any): void;
}
