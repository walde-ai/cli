import { AuthProvider } from '@/cli/domain/ports/out/auth-provider';
import { IAuthPresenter, AuthErrorCode } from '@/cli/domain/ports/presenters/i-auth-presenter';
import { CredentialsRepo } from '@/cli/domain/ports/in/credentials-repo';
import { Credentials } from '@/cli/domain/entities/credentials';

/**
 * Login interactor for user authentication
 */
export class Login {
  constructor(
    private readonly authProvider: AuthProvider,
    private readonly presenter: IAuthPresenter,
    private readonly credentialsRepo: CredentialsRepo
  ) {}

  /**
   * Execute login with optional username
   */
  public async execute(username?: string): Promise<Credentials> {
    const user = username || await this.presenter.requestUser();
    const password = await this.presenter.requestPassword();

    this.presenter.start();

    try {
      return await new Promise<Credentials>((resolve, reject) => {
        this.authProvider.authenticate(user, password, {
          onSuccess: async (credentials: Credentials) => {
            try {
              await this.credentialsRepo.save(credentials);
              this.presenter.succeed();
              resolve(credentials);
            } catch (error) {
              this.presenter.fail(AuthErrorCode.GENERIC_ERROR);
              reject(error);
            }
          },
          onFailure: (error: Error) => {
            const errorCode = this.mapErrorToCode(error);
            this.presenter.fail(errorCode, error);
            reject(error);
          },
          onNewPasswordRequired: async (setNewPassword: (newPassword: string) => void) => {
            try {
              // Stop the current spinner before prompting for new password
              this.presenter.stop();
              
              const newPassword = await this.presenter.requestNewPassword();
              
              // Restart spinner for password setting
              this.presenter.start();
              
              // Call setNewPassword - this will trigger the completeNewPasswordChallenge
              // The success/failure will be handled by the onSuccess/onFailure callbacks
              // that are already set up in the completeNewPasswordChallenge
              setNewPassword(newPassword);
            } catch (error) {
              this.presenter.fail(AuthErrorCode.GENERIC_ERROR);
              reject(error);
            }
          }
        });
      });
    } catch (error) {
      // Error already handled by presenter in onFailure callback
      throw error;
    }
  }

  /**
   * Map authentication error to appropriate error code
   */
  private mapErrorToCode(error: Error): AuthErrorCode {
    const errorCode = (error as any).code;
    
    switch (errorCode) {
      case 'NotAuthorizedException':
        return AuthErrorCode.INVALID_USER_OR_PASSWORD;
      case 'UserNotConfirmedException':
        return AuthErrorCode.NOT_CONFIRMED;
      default:
        return AuthErrorCode.GENERIC_ERROR;
    }
  }
}
