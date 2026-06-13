import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { CommandBriefSetSections } from '@/cli/domain/interactors/brief/command-brief-set-sections';

export type BriefSetSectionsDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IBriefPresenter;
};

export function createBriefSetSectionsCommand(deps: BriefSetSectionsDependencies): Command {
  const command = new Command('set-sections');

  command
    .description('Set sections in a brief')
    .argument('<briefId>', 'Brief ID')
    .option('--intent <content>', 'Intent section content')
    .option('--naming-conventions <content>', 'Naming Conventions section content')
    .option('--contracts <content>', 'Contracts section content')
    .option('--architecture <content>', 'Architecture section content')
    .option('--approach <content>', 'Approach section content')
    .option('--appendix <content>', 'Appendix section content')
    .option('--design-decisions <content>', 'Design Decisions section content')
    .option('--intent-file <path>', 'Intent section content from file')
    .option('--naming-conventions-file <path>', 'Naming Conventions section content from file')
    .option('--contracts-file <path>', 'Contracts section content from file')
    .option('--architecture-file <path>', 'Architecture section content from file')
    .option('--approach-file <path>', 'Approach section content from file')
    .option('--appendix-file <path>', 'Appendix section content from file')
    .option('--design-decisions-file <path>', 'Design Decisions section content from file')
    .option('--author <name>', 'Author name (defaults to "user")')
    .action(async (briefId, options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandBriefSetSections(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({
          briefId,
          intent: options.intent,
          namingConventions: options.namingConventions,
          contracts: options.contracts,
          architecture: options.architecture,
          approach: options.approach,
          appendix: options.appendix,
          designDecisions: options.designDecisions,
          intentFile: options.intentFile,
          namingConventionsFile: options.namingConventionsFile,
          contractsFile: options.contractsFile,
          architectureFile: options.architectureFile,
          approachFile: options.approachFile,
          appendixFile: options.appendixFile,
          designDecisionsFile: options.designDecisionsFile,
          author: options.author,
        });
      });
    });

  return command;
}
