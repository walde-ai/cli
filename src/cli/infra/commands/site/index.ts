import { Command } from 'commander';
import { createListCommand, SiteListDependencies } from './list';
import { createCreateCommand, SiteCreateDependencies } from './create';
import { createAssociateCertificatesCommand, SiteAssociateCertificatesDependencies } from './associate-certificates';
import { createAddCustomDomainCommand, SiteAddCustomDomainDependencies } from './add-custom-domain';
import { createDeleteCommand, SiteDeleteDependencies } from './delete';
import { withCommonOptions } from '../common-options';

export type SiteCommandGroupDependencies = {
  list: SiteListDependencies;
  create: SiteCreateDependencies;
  associateCertificates: SiteAssociateCertificatesDependencies;
  addCustomDomain: SiteAddCustomDomainDependencies;
  delete: SiteDeleteDependencies;
};

/**
 * Creates the site command group
 */
export function createSiteCommand(deps: SiteCommandGroupDependencies): Command {
  const command = new Command('site');
  
  command
    .alias('sites')
    .description('Manage sites');

  command.addCommand(withCommonOptions(createListCommand(deps.list)));
  command.addCommand(withCommonOptions(createCreateCommand(deps.create)));
  command.addCommand(withCommonOptions(createAssociateCertificatesCommand(deps.associateCertificates)));
  command.addCommand(withCommonOptions(createAddCustomDomainCommand(deps.addCustomDomain)));
  command.addCommand(withCommonOptions(createDeleteCommand(deps.delete)));

  return command;
}

/**
 * Creates the site command group
 */
export function createSiteCommandGroup(deps: SiteCommandGroupDependencies): Command {
  return createSiteCommand(deps);
}
