export enum AuthExceptionType {
  BadRequest,
  BadResponse,
  IncorrectCredentials,
  TooManyAttempts,
  CsrfTokenMismatch,
  CsrfTokenMissing,
  AuthTokenMissing,
  NoFingerprintProtectedData,
  Generic 
}

export class AuthException {
  type: AuthExceptionType;
  message: string;
  constructor(type: AuthExceptionType, message: string = undefined) {
    this.type = type;
    this.message = message;
  }
}