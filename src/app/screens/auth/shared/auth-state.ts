export enum AuthState {
  Unknown = 0,
  NotAuthenticated,
  ImmortalToken,
  Credential
}
export enum AuthModalType {
  Default,
  Credentials,
  ImmortalToken,
  ChangePassword,
  ForgotPassword,
  PinEntry
}
export enum PinEntryType {
  NotApplicable = 0,
  WithCredentials,
  Reentry
}
export enum TouchIdErrorCodes {
  FingerprintScanFailedMoreThanThreeTimes = -1,
  UserCancelled = -2,
  UserOptedForPassword = -3,
  SystemCancelled = -4,
  TouchIdNotAvailable = -6,
  TouchIdLockedOut = -8,
  UserCancelledAlt = -128,
}