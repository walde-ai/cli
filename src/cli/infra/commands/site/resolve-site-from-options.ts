import { MakeWaldeAdmin, CredentialsProvider, FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';
import { ResolveSiteIdentifier } from '@/cli/domain/interactors/resolve-site-identifier';

export interface SiteResolutionParams {
  name?: string;
  id?: string;
}

export interface SiteResolutionDependencies {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: ISitePresenter;
}

/**
 * Resolves a site ID from --name, --id, or interactive selection.
 */
export async function resolveSiteFromOptions(deps: SiteResolutionDependencies, params: SiteResolutionParams): Promise<string> {
  const config = await deps.configLoader.execute();
  const walde = MakeWaldeAdmin({
    credentialsProvider: deps.credentialsProvider,
    endpoint: config.settings.endpoint,
    clientId: config.settings.clientId,
    region: config.settings.region,
    s3ClientFactory: config.s3ClientFactory
  });

  const sitesResult = await walde.sites().list().resolve();
  if (sitesResult.isErr()) {
    throw new Error(`Failed to load sites: ${sitesResult.unwrapErr()}`);
  }

  const resolver = new ResolveSiteIdentifier(deps.presenter);
  return resolver.execute({
    name: params.name,
    id: params.id,
    sites: sitesResult.unwrap()
  });
}
