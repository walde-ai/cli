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

/**
 * Factory interface for creating command group dependencies
 * Enables different dependency configurations for production and development modes
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
}
