import { CommandWorkspaceInit } from '@/cli/domain/interactors/command-workspace-init';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { PresenterFactory } from '@/cli/infra/presenters/presenter-factory';

/**
 * Factory for creating CommandWorkspaceInit with dependencies
 */
export class CommandWorkspaceInitFactory {
  public static Create(
    credentialsProvider: CredentialsProvider,
    configLoader: ILoadConfig
  ): CommandWorkspaceInit {
    const presenter = PresenterFactory.createWorkspacePresenter();
    
    return new CommandWorkspaceInit(
      credentialsProvider,
      presenter,
      configLoader
    );
  }
}
