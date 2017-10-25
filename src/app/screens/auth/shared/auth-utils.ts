import { AlertOptions } from 'ionic-angular'

import { AuthException, AuthExceptionType } from '../../../core/data/auth/auth-exception';

export namespace AuthUtils {
  export type AuthCredentials = {
    username: string;
    password: string;
    pin?: number[];
  };
  export function fingerprintSetupAlertOptions(setupFingerprintHandler: any, setPreferenceHandler: any): AlertOptions {
    return {
      title: 'Fingerprint Login',
      message: 'Do you want to use Touch ID for future logins?',
      buttons: [
        { text: 'No', handler: setPreferenceHandler }, 
        { text: 'Yes', handler: setupFingerprintHandler }
      ]
    };
  }
  /**
   * Helper for error handling
   * @todo Remove some error types when not in Dev
   * @private
   * @param {*} err 
   * 
   * @memberof LoginComponent
   */
  export function handleErrorOptions(err: any): AlertOptions {
    if (err instanceof AuthException) {
      switch (err.type){
        case AuthExceptionType.BadRequest:
        case AuthExceptionType.IncorrectCredentials:
          var title = 'Incorrect credentials';
          var message = 'Please check your username and password again';
          break;
        //-- REMOVE BELOW POST DEV --//
        case AuthExceptionType.CsrfTokenMismatch:
          console.warn('AuthException CSRF Tokens mismatched');
          var title = '(Dev) Token mismatch';
          var message = 'AuthException CSRF Tokens mismatched';
          break;
        case AuthExceptionType.BadResponse:
          var title = '(Dev) Bad Response';
          var message = 'Potentially there are cookies we cannot read';
          break;
        //-- REMOVE ABOVE POST DEV --//
        case AuthExceptionType.Generic:              
        default:
          console.warn('AuthException Generic mismatched');
          var title = 'Error';
          var message = 'Generic Exception. Not quite sure what went wrong...';
          break; 
      }
      return { title, message, buttons: ['OK'] };
    }
    else {
      console.warn(err);
      return {
        title: 'Error',
        subTitle: err,
        buttons: ['OK']
      };
    }
  }
}