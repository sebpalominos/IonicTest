import { Institution, InstitutionShape } from '../../../screens/onboarding/shared/institution.model';

export type RefreshStatus = 'UNKNOWN_ERROR' | 'REENTER_CREDENTIALS' | 'EXTERNAL_PROVIDER_COMM_ERROR' | 'INSTITUTION_LOCKED_ACCOUNT' | 'INSTITUTION_ACTION_REQUIRED' | 'INSTITUTION_PASSWORD_RESET_REQUIRED' | 'INSTITUTION_LOGGED_IN_ELSEWHERE' | 'SUCCESS';
export type AffectedInstitution = {
  institution?: InstitutionShape;
  slug?: string;
  providerId?: number;    // For use in POST /external-accounts/connect/{externalProviderId} 
  providerSlug?: string;    // For use when matching up GET /external-accounts/providers
  lastRefreshStatus: RefreshStatus;
};