import { CredentialInputFieldResponse } from '../../../core/data/institution/institution-response';
import { Institution } from './institution.model';

export namespace OnboardingUtils {
  export interface CredentialInputFieldShape {
    label: string;
    placeholder: string;
    inputName: string;     // html element name
    inputType?: string;
    inputSize?: number;
    value?: string;
    valueMask?: string;
    required?: boolean;
    credentialInputFieldResponse?: CredentialInputFieldResponse;
  }
  export interface DeepLinkParams {
    isSkippable: boolean;
    isReconnectInstitution: boolean;
    // externalProviderId?: number;
    institutionId?: number;
    institutionSlug?: string;
  }
  export interface ProvideCredentialsParams {
    // externalProviderId: number;
    institution?: Institution;
    institutionId?: number;
    institutionSlug?: string;
  }
}
