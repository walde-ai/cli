import { Site } from '@walde.ai/sdk';
import { CertificateAssociationsResult } from '@walde.ai/sdk';

export interface ISitePresenter {
  requestSiteName(): Promise<string>;
  requestSiteSelection(sites: Site[]): Promise<string>;
  presentDisambiguationNotice(count: number, name: string): void;
  startLoading(message: string): void;
  stopLoading(): void;
  presentSites(sites: Site[]): void;
  presentSiteCreated(site: Site): void;
  presentCertificateAssociations(result: CertificateAssociationsResult): void;
  presentCertificateAssociationSuccess(): void;
  presentCertificateAssociationPartial(site: Site): void;
  presentCustomDomainAdded(site: Site, domain: string): void;
  presentError(message: string): void;
  presentProvisioningFailed(): void;
  requestDeleteConfirmation(siteId: string): Promise<boolean>;
  presentSiteDeleted(): void;
  presentDeletionFailed(): void;
  presentDeletionCancelled(): void;
}
