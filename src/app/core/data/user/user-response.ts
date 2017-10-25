import { UserProfileShape } from '../../../screens/user/shared/user-profile.model';
import { UserSummaryShape } from '../../../screens/user/shared/user-summary.model';

// export type UserProfileResponse = {
//   profile: UserProfileShape;
//   preferences?: any;          // TBA
// };

export type UserSummaryResponse = {
  summary: UserSummaryShape; 
};

export interface UserProfilePreferenceResponse {
  type: string;
  value: string;
  status: 'INPUT_BY_USER' | 'DEFAULTED';
  description: string;
  explainer: string;
  label: string;
  editable: boolean;
  dataType: string;
  validations: any;
}
export type UserProfileResponse = {
  settings: UserProfilePreferenceResponse[];
};