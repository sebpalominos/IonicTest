//
// NOTE: Moved over to "institution-connection-response.ts"
//
//

/**
 * Response for step 1 i.e. when site is selected. See: 
 * https://opicagroup.atlassian.net/wiki/pages/viewpage.action?pageId=1384312#id-/external-accounts-site-selected
 */
export interface ConnectionSiteSelectedResponse {
  manualUploadAvailable: boolean;
  externalAccountProviderId: number;
}

/**
 * Response for step 2 i.e. when insto credentials are sent across. See:
 * https://opicagroup.atlassian.net/wiki/pages/viewpage.action?pageId=1384312#id-/external-accounts-connect-post
 */
export interface ConnectionEstablishedResponse {
  id: string;   // UUID
}