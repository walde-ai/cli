import { AuthProvider } from '@/cli/domain/ports/out/auth-provider';
import { IAuthPresenter } from '@/cli/domain/ports/presenters/i-auth-presenter';
import { CredentialsRepo } from '@/cli/domain/ports/in/credentials-repo';
import { Login } from './Login';

/**
 * CLI interactor for login command
 */
export class CommandLogin {
  constructor(
    private readonly authProvider: AuthProvider,
    private readonly presenter: IAuthPresenter,
    private readonly credentialsRepo: CredentialsRepo
  ) {}

  /**
   * Execute the login command
   */
  async execute(username?: string): Promise<void> {
    const loginInteractor = new Login(
      this.authProvider,
      this.presenter,
      this.credentialsRepo
    );

    await loginInteractor.execute(username);
  }
}
