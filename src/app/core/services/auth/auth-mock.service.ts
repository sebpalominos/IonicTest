import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { InsightsHttpService } from '../insights-http/insights-http.service';

@Injectable()
export class AuthMockService {
  constructor(
    protected storage: Storage,
  ) {}
  /** Perform new login request to identity endpoint */
  login(username: string, password: string) : Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(true);

      // if reject(), increment this.sessionInvalidAttempts
      // After X number of invalid attempts, wipe the locally stored data

    });
  }
  /** Perform forgot password to identity endpoint */
  forgotPassword() : Promise<boolean> {
    return Promise.resolve(true);
  }
  /** Change password */
  changePassword(existingPassword: string, newPassword: string) : Promise<boolean>{
    return Promise.resolve(true);
  }
  /** Request deletion of access token */
  logout() : Promise<boolean> {
    // BUT IN FACT ACTUALLY DOES NOTHING!!
    return Promise.resolve(true);
  }
 

}