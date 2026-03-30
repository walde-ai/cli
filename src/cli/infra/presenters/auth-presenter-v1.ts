import { IAuthPresenter, AuthErrorCode } from '@/cli/domain/ports/presenters/i-auth-presenter';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { IPromptComponent } from '@/cli/domain/ports/presenters/components/i-prompt-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { CliTheme } from './cli-theme';

/**
 * Authentication presenter V1 implementation
 */
export class AuthPresenterV1 implements IAuthPresenter {
  constructor(
    private readonly spinner: ISpinnerComponent,
    private readonly prompt: IPromptComponent,
    private readonly config: PresenterConfig
  ) {}

  /**
   * Request username from user
   */
  public async requestUser(): Promise<string> {
    return this.prompt.text('Username:');
  }

  /**
   * Request password from user
   */
  public async requestPassword(): Promise<string> {
    return this.prompt.password('Password:');
  }

  /**
   * Request new password from user
   */
  public async requestNewPassword(): Promise<string> {
    return this.prompt.password('New password:');
  }

  /**
   * Start authentication process
   */
  public start(): void {
    this.spinner.start('Authenticating...');
  }

  /**
   * Stop authentication process
   */
  public stop(): void {
    this.spinner.stop();
  }

  /**
   * Indicate successful authentication
   */
  public succeed(): void {
    this.spinner.stop();
    console.log(CliTheme.accent('Authentication successful'));
  }

  /**
   * Indicate failed authentication with error code
   */
  public fail(code: AuthErrorCode, error?: Error): void {
    this.spinner.stop();
    
    let message: string;
    
    if (code === AuthErrorCode.INVALID_USER_OR_PASSWORD) {
      message = 'Invalid username or password';
    } else if (code === AuthErrorCode.NOT_CONFIRMED) {
      message = 'User account not confirmed';
    } else {
      message = error?.message || 'Authentication failed';
    }
    
    console.error(CliTheme.error(message));
  }
}
