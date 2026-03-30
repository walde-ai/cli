import { Site } from '@walde.ai/sdk';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';

export interface ResolveSiteIdentifierParams {
  name?: string;
  id?: string;
  sites: Site[];
}

/**
 * Resolves a site identifier from --name, --id, or interactive selection
 */
export class ResolveSiteIdentifier {
  constructor(
    private readonly presenter: ISitePresenter
  ) {}

  public async execute(params: ResolveSiteIdentifierParams): Promise<string> {
    if (params.id) {
      return params.id;
    }

    if (params.name) {
      return this.resolveByName(params.name, params.sites);
    }

    return this.presenter.requestSiteSelection(params.sites);
  }

  private async resolveByName(name: string, sites: Site[]): Promise<string> {
    const matches = sites.filter(s => s.name === name);

    if (matches.length === 1) {
      return matches[0].id;
    }

    if (matches.length > 1) {
      this.presenter.presentDisambiguationNotice(matches.length, name);
      return this.presenter.requestSiteSelection(matches);
    }

    throw new Error(`No site found with name "${name}".`);
  }
}
