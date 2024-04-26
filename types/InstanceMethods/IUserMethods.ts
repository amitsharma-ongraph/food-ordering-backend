export interface IUserMethods {
  isValidPassword(password: string): boolean;
  isGoogleId(): boolean;
}
