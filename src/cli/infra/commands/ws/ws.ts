import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';

import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { CommandWsConnect } from '@/cli/domain/interactors/command-ws-connect';
import { Runtime } from '@/cli/infra/runtime';

export type WsConnectDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
};

/**
 * Creates the ws connect command
 */
export function createWsConnectCommand(deps: WsConnectDependencies): Command {
  const command = new Command('connect');

  command
    .description('Connect to the Walde WebSocket API')
    .action(async () => {
      await executeWsConnect(deps);
    });

  return command;
}

async function executeWsConnect(deps: WsConnectDependencies): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const commandWsConnect = new CommandWsConnect(deps.credentialsProvider, deps.configLoader);
    await commandWsConnect.execute();
  });
}
