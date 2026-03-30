import Table from 'cli-table3';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { IPromptComponent } from '@/cli/domain/ports/presenters/components/i-prompt-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { Site, SiteState } from '@walde.ai/sdk';
import { CertificateAssociationsResult } from '@walde.ai/sdk';
import { CliTheme } from './cli-theme';

export class SitePresenterV1 implements ISitePresenter {
  constructor(
    private readonly spinner: ISpinnerComponent,
    private readonly prompt: IPromptComponent,
    private readonly config: PresenterConfig
  ) {}

  public async requestSiteName(): Promise<string> {
    return this.prompt.text('Site name (optional):');
  }

  public async requestSiteSelection(sites: Site[]): Promise<string> {
    const choices = sites.map(site => ({
      name: `${site.name} (${site.id})`,
      value: site.id
    }));

    return this.prompt.select('Select a site:', choices);
  }

  public presentDisambiguationNotice(count: number, name: string): void {
    console.log(CliTheme.soft(`Found ${count} sites with name "${name}".`));
  }

  public startLoading(message: string): void {
    this.spinner.start(message);
  }

  public stopLoading(): void {
    this.spinner.stop();
  }

  public presentSites(sites: Site[]): void {
    if (sites.length === 0) {
      console.log(CliTheme.soft('No sites found.'));
      return;
    }

    const table = new Table({
      head: ['', CliTheme.accent('ID'), CliTheme.accent('Name'), CliTheme.accent('Region'), CliTheme.accent('State'), CliTheme.accent('URL'), CliTheme.accent('Custom Domains')],
      style: {
        head: [],
        border: [],
        'padding-left': 0,
        'padding-right': 2
      },
      chars: {
        'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
        'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
        'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
        'right': '', 'right-mid': '', 'middle': ' '
      }
    });

    const lineNumWidth = String(sites.length).length + 2;

    sites.forEach((site, index) => {
      const stateColor = site.state === SiteState.UPDATED ? CliTheme.accent : CliTheme.soft;
      const lineNum = String(index + 1).padStart(lineNumWidth - 1);

      table.push([
        CliTheme.soft(lineNum),
        CliTheme.body(site.id),
        CliTheme.body(site.name),
        CliTheme.body(site.region || CliTheme.soft('—')),
        stateColor(site.state),
        CliTheme.body(site.url || 'Pending'),
        CliTheme.body(this.formatCustomDomainsSummary(site))
      ]);
    });

    console.log(table.toString());
    console.log(CliTheme.soft(`\nTotal: ${sites.length} site${sites.length === 1 ? '' : 's'}`));
  }

  public presentSiteCreated(site: Site): void {
    console.log(CliTheme.accent(`✓ Site created successfully!`));
    console.log();
    console.log(CliTheme.body(`  ID:              ${site.id}`));
    console.log(CliTheme.body(`  Name:            ${site.name}`));
    console.log(CliTheme.body(`  Region:          ${site.region || 'N/A'}`));
    console.log(CliTheme.body(`  URL:             ${site.url || 'Pending'}`));
    console.log(CliTheme.body(`  Custom Domains:  ${this.formatCustomDomainsSummary(site)}`));
  }

  public presentCertificateAssociations(result: CertificateAssociationsResult): void {
    console.log(CliTheme.accent('Certificate associations:'));
    for (const [resourceType, assoc] of Object.entries(result.certificateAssociations)) {
      const status = assoc.associated ? CliTheme.accent('✓ Associated') : CliTheme.soft(`✗ ${assoc.reason}`);
      console.log(CliTheme.body(`  ${resourceType}: ${status}`));
    }
  }

  public presentCertificateAssociationSuccess(): void {
    console.log(CliTheme.accent('✓ All custom domains verified and certificates associated.'));
  }

  public presentCertificateAssociationPartial(site: Site): void {
    const domains = site.customDomains || [];
    for (const cd of domains) {
      const statusColor = cd.status.toString() === 'VERIFIED' ? CliTheme.accent : CliTheme.soft;
      console.log(CliTheme.body(`  ${cd.domain}: ${statusColor(cd.status.toString())}`));
    }
    console.log();
    console.log(CliTheme.soft('  Some domains are still pending. Wait for DNS propagation and retry.'));
  }

  public presentCustomDomainAdded(site: Site, domain: string): void {
    const cd = site.customDomains?.find(d => d.domain === domain);

    console.log(CliTheme.accent('✓ Custom domain added successfully!'));
    console.log();
    console.log(CliTheme.body(`  Domain:  ${domain}`));
    console.log(CliTheme.body(`  Status:  ${cd ? cd.status : 'PROVISIONING'}`));

    if (cd && cd.requiredDnsEntries && cd.requiredDnsEntries.length > 0) {
      console.log();
      console.log(CliTheme.body('  Required DNS entries:'));
      console.log();

      // Header row
      console.log(`     ${CliTheme.accent('Entry')}${' '.repeat(29)}${CliTheme.accent('Type')}    ${CliTheme.accent('Value')}${' '.repeat(30)}${CliTheme.accent('Role')}`);

      cd.requiredDnsEntries.forEach((entry, index) => {
        const lineNum = CliTheme.soft(`${index + 1}`);
        console.log(`  ${lineNum}  ${CliTheme.body(entry.entry.padEnd(34))}${CliTheme.body(entry.type.padEnd(8))}${CliTheme.body(entry.value.padEnd(35))}${CliTheme.body(entry.role)}`);
      });

      console.log();
      console.log(CliTheme.body('  Create these DNS entries in your DNS provider, then run:'));
      console.log(CliTheme.body(`    walde site associate-certificates ${site.id}`));
    }
  }

  public presentError(message: string): void {
    console.error(CliTheme.error(`✗ Error: ${message}`));
    process.exitCode = 1;
  }

  public presentProvisioningFailed(): void {
    console.error(CliTheme.error('✗ Site provisioning failed. Please try again later.'));
    process.exitCode = 1;
  }

  public async requestDeleteConfirmation(siteId: string): Promise<boolean> {
    return this.prompt.confirm(`Are you sure you want to delete site ${siteId}? This cannot be undone.`);
  }

  public presentSiteDeleted(): void {
    console.log(CliTheme.accent('✓ Site deleted'));
  }

  public presentDeletionFailed(): void {
    console.error(CliTheme.error('✗ Failed to delete site'));
    process.exitCode = 1;
  }

  public presentDeletionCancelled(): void {
    console.log(CliTheme.soft('Deletion cancelled.'));
  }

  private formatCustomDomainsSummary(site: Site): string {
    const domains = site.customDomains;
    if (!domains || domains.length === 0) {
      return '(none)';
    }

    const verified = domains.filter(d => d.status.toString() === 'VERIFIED').length;
    const pending = domains.filter(d => d.status.toString() === 'VERIFICATION_PENDING').length;
    const provisioning = domains.filter(d => d.status.toString() === 'PROVISIONING').length;

    const parts: string[] = [];
    if (verified > 0) parts.push(`${verified} verified`);
    if (pending > 0) parts.push(`${pending} pending`);
    if (provisioning > 0) parts.push(`${provisioning} provisioning`);
    return parts.join(', ');
  }
}
