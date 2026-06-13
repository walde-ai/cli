import { Command } from 'commander';

import { CredentialsProvider } from '@walde.ai/sdk';

import { Runtime } from '@/cli/infra/runtime';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { CommandBriefEventAppend } from '@/cli/domain/interactors/brief/command-brief-event-append';

export type BriefEventAppendDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IBriefPresenter;
};

export function createBriefEventAppendCommand(deps: BriefEventAppendDependencies): Command {
  const command = new Command('append');

  command
    .description('Append a raw event to a brief (advanced)')
    .argument('<briefId>', 'Brief ID')
    .option('--type <type>', 'Event type: "edit" or "commentAdd"', 'edit')
    .option('--title <title>', 'Title for an edit event')
    .option('--state <state>', 'State for an edit event')
    .option('--section <key=value...>', 'Section assignment in `key=value` form (repeatable)')
    .option('--content <text>', 'Content for a commentAdd event')
    .option('--file <path>', 'Read the full event JSON (must include type and payload) from a file')
    .option('--author <name>', 'Author name (defaults to "user")')
    .action(async (briefId: string, options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const sections: Record<string, string> = {};
        if (Array.isArray(options.section)) {
          for (const entry of options.section as string[]) {
            const idx = entry.indexOf('=');
            if (idx <= 0) {
              throw new Error(`Invalid --section value "${entry}"; expected "key=value"`);
            }
            sections[entry.slice(0, idx)] = entry.slice(idx + 1);
          }
        }

        const interactor = new CommandBriefEventAppend(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );

        await interactor.execute({
          briefId,
          type: options.type as 'edit' | 'commentAdd' | undefined,
          title: options.title,
          state: options.state,
          sections,
          content: options.content,
          file: options.file,
          author: options.author,
        });
      });
    });

  return command;
}
