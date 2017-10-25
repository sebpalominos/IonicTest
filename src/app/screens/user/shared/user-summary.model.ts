import { UserAnnualSummary, UserMonthlySummary, NotificationSummary } from './user-type';
import { UserSummaryResponse } from '../../../core/data/user/user-response';

export interface UserSummaryShape {
  notificationSummary: NotificationSummary;
  annualSummary: UserAnnualSummary;
  monthlySummaries: UserMonthlySummary[];
  // goalSummaries: History[];
}
export class UserSummary implements UserSummaryShape {
  /** Create Category object array from ICategory array */
  static createSummaryFromResponse(resp: UserSummaryResponse): UserSummary {
    return new UserSummary(resp.summary);
  }
  constructor(...props: any[]){
    Object.assign(this, ...props);
  }
  notificationSummary: NotificationSummary;
  annualSummary: UserAnnualSummary;
  monthlySummaries: UserMonthlySummary[];
}