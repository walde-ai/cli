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
import { WsCommandGroupDependencies } from '@/cli/infra/commands/ws/index';
import { PushCommandGroupDependencies } from '@/cli/infra/commands/push/index';
import { ProjectCommandGroupDependencies } from '@/cli/infra/commands/project/index';
import { BriefCommandGroupDependencies } from '@/cli/infra/commands/brief/index';
import { ApiCommandGroupDependencies } from '@/cli/infra/commands/api/index';
import { DevCommandGroupDependencies } from '@/cli/infra/commands/dev/index';
import { CloudCommandGroupDependencies } from '@/cli/infra/commands/cloud/index';
import { ICredentialsRepoFactory } from '@/cli/domain/ports/in/i-credentials-repo-factory';
import { ConfigLoaderFactory } from '@/cli/infra/factories/index';
import { PresenterFactory } from '@/cli/infra/presenters/presenter-factory';
import { JWTCredentialParser } from '@/cli/infra/adapters/out/jwt-credential-parser';
import { ApiProjectRepository } from '@/cli/infra/adapters/api-project-repository';
import { NodeProcessSpawner, SdkWorkspaceRootResolver } from '@/cli/infra/adapters/out';
/**
 * Production dependency factory that creates dependencies using production services
 */
export class ProductionDependencyFactory implements DependencyFactory {
  constructor(private readonly credentialsRepoFactory: ICredentialsRepoFactory) {}

  private createCredentialsRepo() {
    return this.credentialsRepoFactory.create();
  }

  private createProjectRepository(): ApiProjectRepository {
    return new ApiProjectRepository(
      this.createCredentialsRepo(),
      ConfigLoaderFactory.Create()
    );
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
        projectRepository: this.createProjectRepository(),
      },
    };
  }

  createUiCommandGroupDependencies(): UiCommandGroupDependencies {
    return {
      push: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createUiPresenter(),
        projectRepository: this.createProjectRepository(),
      },
    };
  }

  createAssetCommandGroupDependencies(): AssetCommandGroupDependencies {
    return {
      push: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createAssetPresenter(),
        projectRepository: this.createProjectRepository(),
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
        projectRepository: this.createProjectRepository(),
      },
    };
  }

  createWsCommandGroupDependencies(): WsCommandGroupDependencies {
    return {
      connect: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
      },
    };
  }

  createPushCommandGroupDependencies(): PushCommandGroupDependencies {
    return {
      push: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        projectRepository: this.createProjectRepository(),
      },
    };
  }

  createProjectCommandGroupDependencies(): ProjectCommandGroupDependencies {
    return {
      list: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createProjectPresenter(),
      },
      create: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createProjectPresenter(),
      },
      delete: {
        credentialsProvider: this.createCredentialsRepo(),
        configLoader: ConfigLoaderFactory.Create(),
        presenter: PresenterFactory.createProjectPresenter(),
      },
    };
  }

  createBriefCommandGroupDependencies(): BriefCommandGroupDependencies {
    const deps = {
      credentialsProvider: this.createCredentialsRepo(),
      configLoader: ConfigLoaderFactory.Create(),
      presenter: PresenterFactory.createBriefPresenter(),
    };

    return {
      create: deps,
      list: deps,
      show: deps,
      events: deps,
      setSections: deps,
      implement: deps,
      markImplemented: deps,
      fail: deps,
      archive: deps,
      comment: {
        add: deps,
      },
      event: {
        append: deps,
      },
    };
  }

  createApiCommandGroupDependencies(): ApiCommandGroupDependencies {
    return {
      create: {},
    };
  }

  createDevCommandGroupDependencies(): DevCommandGroupDependencies {
    return {
      start: {
        workspaceRootResolver: new SdkWorkspaceRootResolver(),
        processSpawner: new NodeProcessSpawner(),
      },
    };
  }

  createCloudCommandGroupDependencies(): CloudCommandGroupDependencies {
    return {
      api: {
        push: {
          credentialsProvider: this.createCredentialsRepo(),
          configLoader: ConfigLoaderFactory.Create(),
          projectRepository: this.createProjectRepository(),
        },
      },
    };
  }
}
