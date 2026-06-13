import { Command } from 'commander';

/**
 * Module-level variable to store the current stage from command options
 */
let currentStage: string | undefined;

/**
 * Get the current stage value
 */
export function getCurrentStage(): string | undefined {
  return currentStage;
}

/**
 * Decorator that adds common options to a command and its subcommands
 */
export function withCommonOptions(command: Command): Command {
  return command
    .option('--stage <stage>', 'Configuration stage to use')
    .hook('preAction', (thisCommand) => {
      const stage = getStageFromCommand(thisCommand);
      if (stage !== undefined) {
        currentStage = stage;
      }
    });
}

/**
 * Helper function to get the stage option from a command or its parents
 */
export function getStageFromCommand(command: Command): string | undefined {
  const opts = command.opts();
  if (opts.stage !== undefined) {
    return opts.stage;
  }
  
  let parent = command.parent;
  while (parent) {
    const parentOpts = parent.opts();
    if (parentOpts.stage !== undefined) {
      return parentOpts.stage;
    }
    parent = parent.parent;
  }
  
  return undefined;
}
