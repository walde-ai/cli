import { createInterface } from 'readline';
import { randomUUID } from 'crypto';

import { CredentialsProvider, MakeWaldeAdmin, WSClientSession } from '@walde.ai/sdk';
import { WSProtocolV20260411 } from '@walde.ai/ws-protocol';
import { IWSOperationListener, IWSSession, ProtocolV20260411Operations, ChatSendData } from '@walde.ai/ws-protocol';

import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { SystemError } from '@/cli/domain/exceptions';

class PrintMessageListener implements IWSOperationListener<ChatSendData, ProtocolV20260411Operations> {
  async handle(params: { session: IWSSession<ProtocolV20260411Operations>; data: ChatSendData }): Promise<void> {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(`< ${params.data.message}`);
  }
}

/**
 * Command interactor for WebSocket connect operation
 */
export class CommandWsConnect {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly configLoader: ILoadConfig,
  ) {}

  async execute(): Promise<void> {
    const config = await this.configLoader.execute();

    const admin = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      wsEndpoint: config.settings.wsEndpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
    });

    const result = await admin.ws().raw().resolve();

    if (result.isErr()) {
      throw new SystemError(`WebSocket connection failed: ${result.error}`);
    }

    const ws = result.value;
    console.log('Connected (press Ctrl+C to exit)');

    const protocol = new WSProtocolV20260411({ listeners: { 'chat.send': new PrintMessageListener() }, mode: 'client' });
    const session = new WSClientSession({ client: ws, protocol });
    const chatId = randomUUID();

    const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });
    rl.prompt();

    ws.onMessage(async (data: string) => {
      try {
        await protocol.handleMessage(data, session);
        rl.prompt(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Failed to handle WebSocket message:', message);
        rl.prompt(true);
      }
    });

    ws.onClose((code: number, reason: string) => {
      rl.close();
      console.log(`Disconnected (${code}): ${reason}`);
      process.exit(0);
    });

    ws.onError((error: Error) => {
      console.error('error:', error.message);
    });

    rl.on('line', async (input: string) => {
      const trimmed = input.trim();
      if (trimmed) {
        await session.send('chat.send', { chatId, message: trimmed });
      }
      rl.prompt();
    });

    rl.on('close', () => {
      session.close();
      process.exit(0);
    });

    await new Promise<void>(() => {});
  }
}
