import { Command } from 'commander';

/**
 * Module-level variable to store the current stage from command options
 * This is set by the preAction hook and read by factories/interactors
 */
let currentStage: string | undefined;

/**
 * Get the current stage value
 * @returns The current stage or undefined if not set
 */
export function getCurrentStage(): string | undefined {
  return currentStage;
}

/**
 * Apply workspace stage as a fallback when no CLI --stage was provided.
 * CLI --stage always takes precedence.
 */
export function applyWorkspaceStage(workspaceStage: string | undefined): void {
  if (currentStage === undefined && workspaceStage !== undefined) {
    currentStage = workspaceStage;
  }
}

/**
 * Decorator that adds common options to a command and its subcommands
 * This includes:
 * - --stage option: Configuration stage to use (alpha, beta, gamma, prod)
 * 
 * @param command - The command to decorate with common options
 * @returns The decorated command
 */
export function withCommonOptions(command: Command): Command {
  return command
    .option('--stage <stage>', 'Configuration stage to use')
    .hook('preAction', (thisCommand) => {
      // Get stage from command options (checking parent hierarchy)
      const stage = getStageFromCommand(thisCommand);
      if (stage !== undefined) {
        currentStage = stage;
      }
    });
}

/**
 * Helper function to get the stage option from a command or its parents
 * Traverses up the command hierarchy to find the stage option
 * 
 * @param command - The command to get the stage from
 * @returns The stage value or undefined if not set
 */
export function getStageFromCommand(command: Command): string | undefined {
  // Check current command
  const opts = command.opts();
  if (opts.stage !== undefined) {
    return opts.stage;
  }
  
  // Check parent commands
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
