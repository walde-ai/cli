import { Command } from 'commander';
import { createWsConnectCommand, WsConnectDependencies } from './ws';

export type WsCommandGroupDependencies = {
  connect: WsConnectDependencies;
};

/**
 * Creates the ws command group
 */
export function createWsCommandGroup(deps: WsCommandGroupDependencies): Command {
  const wsCommand = new Command('ws');
  wsCommand.description('WebSocket commands');

  wsCommand.addCommand(createWsConnectCommand(deps.connect));

  return wsCommand;
}
