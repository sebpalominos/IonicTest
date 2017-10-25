import { RefreshStatus } from './institution-types';

// TYPES
export type ProviderSummaryListResponse = {
  items: ProviderSummaryResponse[];
};
/**
 * An individual (finanical) institution
 * 2017-04-01 Note: in OPICA Core API these are currently called "sites"
 * @export
 * @interface InstitutionResponse
 */
export interface InstitutionSelectionResponse {
  siteId: number;   // Or is this a guid
  mfaType?: string;
  defaultDisplayName?: string;
  defaultOrganizationName: string;
  countryCode: string;
  connectorProvider: string;
  providerExternalId: string;
  providerInternalSlug: string;
  loginInputFields?: CredentialInputFieldResponse[]; 
}
/**
 * A provider summary which is known to the backend.
 * @export
 * @interface ProviderResponse
 */
export interface ProviderSummaryResponse {
  id: number;
  name: string;
  longName: string;
  countryCode: string;
  slug: string;
}
/**
 * Defines a response from connected-sites-summary
 * @export
 * @interface ProviderStatusResponse
 */
export interface ProviderStatusResponse {
  providerName: string;    // The name given by the datasource
  providerInternalSlug: string;
  providerInternalId: string|number;
  lastRefreshStatus: RefreshStatus;
  connector: string;      // This is the datasource e.g. Proviso  
  disabledAccounts: Array<DisabledAccountResponse>;
}
/**
 * Represents data from an account that is user-opted-out i.e. disabled
 * @export
 * @interface DisconnectedAccountResponse
 */
export interface DisabledAccountResponse {
  connectorAccountId: string;
  connectorUserSiteId: number;
  name: string;
  connector: string;
}
/**
 * Defines a field to be rendered on the Connection onboarding page. This
 * probably comes straight from the CoreLogic API
 * @export
 * @interface LoginInputField
 */
export interface CredentialInputFieldResponse {
  displayName?: string;
  name?: string;
  size?: number;
  value?: string;
  valueIdentifier?: string;
  valueMask?: string;
  fieldType?: {
    typeName: string;
  };
  optional?: boolean;
  editable?: boolean;
  isOptional?: boolean;
}