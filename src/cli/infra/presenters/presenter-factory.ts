import { IAuthPresenter } from '@/cli/domain/ports/presenters/i-auth-presenter';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';
import { IContentPresenter } from '@/cli/domain/ports/presenters/i-content-presenter';
import { IUiPresenter } from '@/cli/domain/ports/presenters/i-ui-presenter';
import { IAssetPresenter } from '@/cli/domain/ports/presenters/i-asset-presenter';
import { ICachePresenter } from '@/cli/domain/ports/presenters/i-cache-presenter';
import { IWorkspacePresenter } from '@/cli/domain/ports/presenters/i-workspace-presenter';
import { IProjectPresenter } from '@/cli/domain/ports/presenters/i-project-presenter';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { ICredentialsPresenterV1 } from '@/cli/domain/ports/presenters/i-credentials-presenter-v1';
import { IFrontendManifestPresenter } from '@/cli/domain/ports/presenters/i-frontend-manifest-presenter';
import { IFrontendContentPresenter } from '@/cli/domain/ports/presenters/i-frontend-content-presenter';
import { AuthPresenterV1 } from './auth-presenter-v1';
import { SitePresenterV1 } from './site-presenter-v1';
import { ContentPresenterV1 } from './content-presenter-v1';
import { UiPresenterV1 } from './ui-presenter-v1';
import { AssetPresenterV1 } from './asset-presenter-v1';
import { CachePresenterV1 } from './cache-presenter-v1';
import { WorkspacePresenterV1 } from './workspace-presenter-v1';
import { ProjectPresenterV1 } from './project-presenter-v1';
import { BriefPresenterV1 } from './brief-presenter-v1';
import { CredentialsPresenterV1 } from './credentials-presenter-v1';
import { FrontendManifestPresenterV1 } from './frontend-manifest-presenter-v1';
import { FrontendContentPresenterV1 } from './frontend-content-presenter-v1';
import { DefaultSpinnerComponent } from './components/default-spinner-component';
import { DefaultPromptComponent } from './components/default-prompt-component';
import { DefaultProgressComponent } from './components/default-progress-component';
import { DefaultPresenterConfig } from './default-presenter-config';

/**
 * Factory for creating presenters
 */
export class PresenterFactory {
  /**
   * Create authentication presenter
   */
  public static createAuthPresenter(): IAuthPresenter {
    const spinner = new DefaultSpinnerComponent();
    const prompt = new DefaultPromptComponent();
    const config = DefaultPresenterConfig;
    
    return new AuthPresenterV1(spinner, prompt, config);
  }

  /**
   * Create site presenter
   */
  public static createSitePresenter(): ISitePresenter {
    const spinner = new DefaultSpinnerComponent();
    const prompt = new DefaultPromptComponent();
    const config = DefaultPresenterConfig;
    
    return new SitePresenterV1(spinner, prompt, config);
  }

  /**
   * Create content presenter
   */
  public static createContentPresenter(): IContentPresenter {
    const spinner = new DefaultSpinnerComponent();
    const progress = new DefaultProgressComponent();
    const config = DefaultPresenterConfig;
    
    return new ContentPresenterV1(spinner, progress, config);
  }

  /**
   * Create UI presenter
   */
  public static createUiPresenter(): IUiPresenter {
    const spinner = new DefaultSpinnerComponent();
    const progress = new DefaultProgressComponent();
    const config = DefaultPresenterConfig;
    
    return new UiPresenterV1(spinner, progress, config);
  }

  /**
   * Create asset presenter
   */
  public static createAssetPresenter(): IAssetPresenter {
    const spinner = new DefaultSpinnerComponent();
    const progress = new DefaultProgressComponent();
    const config = DefaultPresenterConfig;

    return new AssetPresenterV1(spinner, progress, config);
  }

  /**
   * Create cache presenter
   */
  public static createCachePresenter(): ICachePresenter {
    const spinner = new DefaultSpinnerComponent();
    const config = DefaultPresenterConfig;

    return new CachePresenterV1(spinner, config);
  }

  /**
   * Create workspace presenter
   */
  public static createWorkspacePresenter(): IWorkspacePresenter {
    const prompt = new DefaultPromptComponent();
    const config = DefaultPresenterConfig;

    return new WorkspacePresenterV1(prompt, config);
  }

  /**
   * Create project presenter
   */
  public static createProjectPresenter(): IProjectPresenter {
    const spinner = new DefaultSpinnerComponent();
    const prompt = new DefaultPromptComponent();
    const config = DefaultPresenterConfig;

    return new ProjectPresenterV1(spinner, prompt, config);
  }

  /**
   * Create brief presenter
   */
  public static createBriefPresenter(): IBriefPresenter {
    const spinner = new DefaultSpinnerComponent();
    const prompt = new DefaultPromptComponent();
    const config = DefaultPresenterConfig;

    return new BriefPresenterV1(spinner, prompt, config);
  }

  /**
   * Create credentials presenter
   */
  public static createCredentialsPresenter(): ICredentialsPresenterV1 {
    const spinner = new DefaultSpinnerComponent();
    
    return new CredentialsPresenterV1(spinner);
  }

  /**
   * Create frontend manifest presenter
   */
  public static createFrontendManifestPresenter(): IFrontendManifestPresenter {
    const spinner = new DefaultSpinnerComponent();
    const config = DefaultPresenterConfig;
    
    return new FrontendManifestPresenterV1(spinner, config);
  }

  /**
   * Create frontend content presenter
   */
  public static createFrontendContentPresenter(): IFrontendContentPresenter {
    const spinner = new DefaultSpinnerComponent();
    const config = DefaultPresenterConfig;
    
    return new FrontendContentPresenterV1(spinner, config);
  }
}
