import { DependencyFactory } from './dependency-factory';
import { DevConfig, LoadConfigDev } from '@/cli/domain/interactors/load-config-dev';
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
import { MockCredentialsProvider } from '@/cli/infra/adapters/mock-credentials-provider';
import { PresenterFactory } from '@/cli/infra/presenters/presenter-factory';
import { ICredentialsRepoFactory } from '@/cli/domain/ports/in/i-credentials-repo-factory';
import { JWTCredentialParser } from '@/cli/infra/adapters/out/jwt-credential-parser';
import { ApiProjectRepository } from '@/cli/infra/adapters/api-project-repository';
import { NodeProcessSpawner, SdkWorkspaceRootResolver } from '@/cli/infra/adapters/out';

export class DevDependencyFactory implements DependencyFactory {
  constructor(
    private readonly devConfig: DevConfig,
    private readonly credentialsRepoFactory: ICredentialsRepoFactory,
  ) {}

  private createCredentialsProvider(): MockCredentialsProvider {
    return new MockCredentialsProvider();
  }

  private createConfigLoader(): LoadConfigDev {
    return new LoadConfigDev(this.devConfig);
  }

  private createCredentialsRepo() {
    return this.credentialsRepoFactory.create();
  }

  private createProjectRepository(): ApiProjectRepository {
    return new ApiProjectRepository(
      this.createCredentialsProvider(),
      this.createConfigLoader()
    );
  }

  createSiteCommandGroupDependencies(): SiteCommandGroupDependencies {
    return {
      list: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createSitePresenter(),
      },
      create: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createSitePresenter(),
      },
      associateCertificates: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createSitePresenter(),
      },
      addCustomDomain: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createSitePresenter(),
      },
      delete: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createSitePresenter(),
      },
    };
  }

  createContentCommandGroupDependencies(): ContentCommandGroupDependencies {
    return {
      list: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createContentPresenter(),
      },
      push: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createContentPresenter(),
        projectRepository: this.createProjectRepository(),
      },
    };
  }

  createUiCommandGroupDependencies(): UiCommandGroupDependencies {
    return {
      push: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createUiPresenter(),
        projectRepository: this.createProjectRepository(),
      },
    };
  }

  createAssetCommandGroupDependencies(): AssetCommandGroupDependencies {
    return {
      push: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createAssetPresenter(),
        projectRepository: this.createProjectRepository(),
      },
    };
  }

  createLoginCommandGroupDependencies(): LoginCommandGroupDependencies {
    const devConfig = this.devConfig;
    
    const MockConfigLoaderFactory = {
      Create: () => new LoadConfigDev(devConfig)
    };
    
    return {
      login: {
        configLoaderFactory: MockConfigLoaderFactory,
        presenter: PresenterFactory.createAuthPresenter(),
        credentialsRepoFactory: this.credentialsRepoFactory,
      },
    };
  }

  createCredentialsCommandGroupDependencies(): CredentialsCommandGroupDependencies {
    return {
      get: {
        credentialsProvider: this.createCredentialsProvider(),
        credentialParser: new JWTCredentialParser(),
        presenter: PresenterFactory.createCredentialsPresenter(),
      },
      refresh: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createCredentialsPresenter(),
      },
      getToken: {
        credentialsProvider: this.createCredentialsProvider(),
      },
    };
  }

  createInitCommandGroupDependencies(): InitCommandGroupDependencies {
    return {
      init: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
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
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
      },
    };
  }

  createCacheCommandGroupDependencies(): CacheCommandGroupDependencies {
    return {
      invalidate: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createCachePresenter(),
        projectRepository: this.createProjectRepository(),
      },
    };
  }

  createWsCommandGroupDependencies(): WsCommandGroupDependencies {
    return {
      connect: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
      },
    };
  }

  createPushCommandGroupDependencies(): PushCommandGroupDependencies {
    return {
      push: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        projectRepository: this.createProjectRepository(),
      },
    };
  }

  createProjectCommandGroupDependencies(): ProjectCommandGroupDependencies {
    return {
      list: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createProjectPresenter(),
      },
      create: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createProjectPresenter(),
      },
      delete: {
        credentialsProvider: this.createCredentialsProvider(),
        configLoader: this.createConfigLoader(),
        presenter: PresenterFactory.createProjectPresenter(),
      },
    };
  }

  createBriefCommandGroupDependencies(): BriefCommandGroupDependencies {
    const deps = {
      credentialsProvider: this.createCredentialsProvider(),
      configLoader: this.createConfigLoader(),
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
      comment: { add: deps },
      event: { append: deps },
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
          credentialsProvider: this.createCredentialsProvider(),
          configLoader: this.createConfigLoader(),
          projectRepository: this.createProjectRepository(),
        },
      },
    };
  }
}
