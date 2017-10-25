import { UserProfilePreferenceResponse } from './user-response';

/**
 * Includes preferences such as language, country, currency, age. 
 * 
 */
export interface UserProfilePreference extends UserProfilePreferenceResponse {};

/**
 * A user profile object that can be stored in local storage
 * and used to call the customer by their name, etc. 
 */ 
export interface LocalProfile {
  username: string;
  preferredName: string;
  email: string;
  status: string;
  motto: string;
}

/**
 * Otherwise known as UserDTO, the UserAccountDetails contains info
 * about the server-side user entity incl name, email, etc
 */
export interface UserDetails {
  username: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  email?: string;
  licensingAction?: string;
};