import { Manifest } from '@walde.ai/sdk';

/**
 * Interface for frontend manifest presentation
 */
export interface IFrontendManifestPresenter {
  /**
   * Show loading state for manifest
   */
  showLoadingManifest(): void;

  /**
   * Show manifest contents in tabular format
   */
  showManifest(manifest: Manifest): void;

  /**
   * Show manifest error
   */
  showManifestError(error: any): void;
}
