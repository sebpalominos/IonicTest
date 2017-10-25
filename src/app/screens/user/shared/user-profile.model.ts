import { UserProfileResponse } from '../../../core/data/user/user-response';

export interface UserProfileShape {
  id: number;
  name: string;
  givenName?: string;
  surname?: string;
  avatarUrl: string;
  email?: string;
  mobile?: string;
  dateJoined?: Date;
}

export class UserProfile implements UserProfileShape {
  /** Create Category object array from ICategory array */
  static createProfileFromResponse(resp: UserProfileResponse): UserProfile {
    return new UserProfile();      // TBA!!!
  }
  constructor(...props: any[]){
    Object.assign(this, ...props);
  }
  id: number;
  name: string;
  givenName?: string;
  surname?: string;
  avatarUrl: string;
  email?: string;
  mobile?: string;
  dateJoined?: Date;
}