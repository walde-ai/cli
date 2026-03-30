import { DependencyFactory } from './dependency-factory';
import { SiteCommandGroupDependencies } from '@/cli/infra/commands/site/index';
import { ContentCommandGroupDependencies } from '@/cli/infra/commands/content/index';
import { UiCommandGroupDependencies } from '@/cli/infra/commands/ui/index';
import { AssetCommandGroupDependencies } from '@/cli/infra/commands/asset/index';
import { LoginCommandGroupDependencies } from '@/cli/infra/commands/login/index';
import { CredentialsCommandGroupDependencies } from '@/cli/infra/commands/credentials/index';
import { InitCommandGroupDependencies } from '@/cli/infra/commands/init/index';
import { FrontendCommandGroupDependencies } from '@/cli/infra/commands/frontend/index';
import { CurlCommandGroupDependencies } from '@/cli/infra/commands/curl/index';
import { CacheCommandGroupDependencies } from '@/cli/infra/commands/cache/index';
import { ICredentialsRepoFactory } from '@/cli/domain/ports/in/i-credentials-repo-factory';
import { ConfigLoaderFactory } from '@/cli/infra/factories/index';
import { PresenterFactory } from '@/cli/infra/presenters/presenter-factory';
import { JWTCredentialParser } from '@/cli/infra/adapters/out/jwt-credential-parser';
/**
 * Production dependency factory that creates dependencies using production services
 */
export class ProductionDependencyFactory implements DependencyFactory {
  constructor(private readonly credentialsRepoFactory: ICredentialsRepoFactory) {}

  private createCredentialsRepo() {
    return this.credentialsRepoFactory.create();
  }
  createSiteCommandGroupDependencies(): SiteCommandGroupDependencies {
    return {
      list: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createSitePresenter(),
      },
      create: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createSitePresenter(),
      },
      associateCertificates: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createSitePresenter(),
      },
      addCustomDomain: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createSitePresenter(),
      },
      delete: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createSitePresenter(),
      },
    };
  }

  createContentCommandGroupDependencies(): ContentCommandGroupDependencies {
    return {
      list: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createContentPresenter(),
      },
      push: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createContentPresenter(),
      },
    };
  }

  createUiCommandGroupDependencies(): UiCommandGroupDependencies {
    return {
      push: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createUiPresenter(),
      },
    };
  }

  createAssetCommandGroupDependencies(): AssetCommandGroupDependencies {
    return {
      push: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createAssetPresenter(),
      },
    };
  }

  createLoginCommandGroupDependencies(): LoginCommandGroupDependencies {
    return {
      login: {
        configLoaderFactory: ConfigLoaderFactory,
        presenter: PresenterFactory.createAuthPresenter(),
        credentialsRepoFactory: this.credentialsRepoFactory,
      },
    };
  }

  createCredentialsCommandGroupDependencies(): CredentialsCommandGroupDependencies {
    return {
      get: {
        credentialsProvider: this.createCredentialsRepo(),
        credentialParser: new JWTCredentialParser(),
        presenter: PresenterFactory.createCredentialsPresenter(),
      },
      refresh: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createCredentialsPresenter(),
      },
      getToken: {
        credentialsProvider: this.createCredentialsRepo(),
      },
    };
  }

  createInitCommandGroupDependencies(): InitCommandGroupDependencies {
    return {
      init: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
      },
    };
  }

  createFrontendCommandGroupDependencies(): FrontendCommandGroupDependencies {
    return {
      content: {
        presenter: PresenterFactory.createFrontendContentPresenter(),
      },
      manifest: {
        list: {
          presenter: PresenterFactory.createFrontendManifestPresenter(),
        },
      },
    };
  }

  createCurlCommandGroupDependencies(): CurlCommandGroupDependencies {
    return {
      curl: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
      },
    };
  }

  createCacheCommandGroupDependencies(): CacheCommandGroupDependencies {
    return {
      invalidate: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createCachePresenter(),
      },
    };
  }
}
