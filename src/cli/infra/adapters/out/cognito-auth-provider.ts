import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { AuthProvider, AuthCallbacks } from '@/cli/domain/ports/out/auth-provider';
import { Credentials } from '@/cli/domain/entities/credentials';
import { WaldeAdminConfigData } from '@walde.ai/sdk';

/**
 * AWS Cognito implementation of AuthProvider
 */
export class CognitoAuthProvider implements AuthProvider {
  constructor(private readonly configSettings: WaldeAdminConfigData) {}

  /**
   * Authenticate user with username and password using Cognito
   */
  public async authenticate(username: string, password: string, callbacks: AuthCallbacks): Promise<void> {
    const userPool = new CognitoUserPool({
      UserPoolId: this.configSettings.userPoolId,
      ClientId: this.configSettings.clientId
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool
    });

    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const accessToken = result.getAccessToken().getJwtToken();
        const refreshToken = result.getRefreshToken().getToken();
        const idToken = result.getIdToken().getJwtToken();
        
        const credentials = new Credentials(
          accessToken,    // accessToken
          refreshToken,   // refreshToken  
          idToken         // idToken
        );
        callbacks.onSuccess(credentials);
      },
      onFailure: (err) => {
        callbacks.onFailure(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        callbacks.onNewPasswordRequired((newPassword: string) => {
          cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
            onSuccess: (result) => {
              const accessToken = result.getAccessToken().getJwtToken();
              const refreshToken = result.getRefreshToken().getToken();
              const idToken = result.getIdToken().getJwtToken();
              
              const credentials = new Credentials(
                accessToken,    // accessToken
                refreshToken,   // refreshToken
                idToken         // idToken
              );
              callbacks.onSuccess(credentials);
            },
            onFailure: (err) => {
              callbacks.onFailure(err);
            }
          });
        });
      }
    });
  }
}
