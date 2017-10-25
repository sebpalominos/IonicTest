import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';

import { UserProfile, UserProfileShape } from '../../../screens/user/shared/user-profile.model';
import { UserProfileResponse, UserSummaryResponse } from '../../data/user/user-response';

@Injectable()
export class UserService {}