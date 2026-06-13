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

/**
 * Factory interface for creating command group dependencies
 */
export interface DependencyFactory {
  createSiteCommandGroupDependencies(): SiteCommandGroupDependencies;
  createContentCommandGroupDependencies(): ContentCommandGroupDependencies;
  createUiCommandGroupDependencies(): UiCommandGroupDependencies;
  createAssetCommandGroupDependencies(): AssetCommandGroupDependencies;
  createLoginCommandGroupDependencies(): LoginCommandGroupDependencies;
  createCredentialsCommandGroupDependencies(): CredentialsCommandGroupDependencies;
  createInitCommandGroupDependencies(): InitCommandGroupDependencies;
  createFrontendCommandGroupDependencies(): FrontendCommandGroupDependencies;
  createCurlCommandGroupDependencies(): CurlCommandGroupDependencies;
  createCacheCommandGroupDependencies(): CacheCommandGroupDependencies;
  createWsCommandGroupDependencies(): WsCommandGroupDependencies;
  createPushCommandGroupDependencies(): PushCommandGroupDependencies;
  createProjectCommandGroupDependencies(): ProjectCommandGroupDependencies;
  createBriefCommandGroupDependencies(): BriefCommandGroupDependencies;
  createApiCommandGroupDependencies(): ApiCommandGroupDependencies;
  createDevCommandGroupDependencies(): DevCommandGroupDependencies;
  createCloudCommandGroupDependencies(): CloudCommandGroupDependencies;
}
