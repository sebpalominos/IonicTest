import { InstitutionSelectionResponse, ProviderSummaryResponse } from '../../../core/data/institution/institution-response';
import { InstitutionIdMap } from './institution-data-maps';

// Also stuff taken from the Proviso JSON extract
export interface InstitutionShape {
  id: number;     // OPICA internal ID
  name: string;     // eg. Westpac Banking Corporation
  commonName?: string;    // eg. Westpac, CommBank
  slug: string;     // eg. nab, or st_george, or stg ?
  supplementarySlug?: string;
  logoClass?: string;  
  logoUrl?: string;  
  factSheetUrl?: string;
  dataProvider?: any;       // State metadata returned by the endpoint but not needed by PFM app
  primaryColor?: string;
}

export class Institution implements InstitutionShape {
  id: number;
  name: string;
  commonName?: string;
  slug: string;
  supplementarySlug?: string;
  logoUrl?: string;
  factSheetUrl?: string;
  primaryColor?: string;
  constructor(...shapes: Partial<InstitutionShape>[]){
    Object.assign(this, ...shapes);
  }
  displayName(){
    return this.commonName || this.name;
  }
  getLogoUrl(forInlineCss: boolean = false){
    let logoUrl = this.logoUrl || '../assets/img/res/opica.png';
    return forInlineCss ? `url('${logoUrl}')` : logoUrl;
  }
  /** Convert Institution[] into InstitutionResponse[] */
  convertToPayload(): InstitutionSelectionResponse {
    return <InstitutionSelectionResponse> {
      siteId: this.id,
      mfaType: null,      // TBA What to do with this??
      defaultDisplayName: this.commonName,
      defaultOrganizationName: this.name,
      countryCode: "AU",      // Todo: Fix hardcode
      connectorProvider: "proviso",   // Todo: Fix this hardcode
      providerExternalId: this.supplementarySlug,
      providerInternalSlug: this.slug
    };
  }
  /** Convert InstitutionResponse[] into Institution[] */
  static createFromResponse(resp: InstitutionSelectionResponse, institutionIdMap?: InstitutionIdMap[]): Institution {
    let map = institutionIdMap ? institutionIdMap.find(iim => iim.slug === resp.providerInternalSlug) || {} : {};
    return new Institution(<InstitutionShape>{
      // id: resp.siteId,     // Doesn't work yet
      id: map['id'] || undefined,
      slug: resp.providerInternalSlug,
      supplementarySlug: resp.providerExternalId,
      name: resp.defaultOrganizationName,
      commonName: resp.defaultDisplayName,
      logoUrl: `assets/img/res/insto/${resp.providerInternalSlug}.png`,      // Make it whatever the slug shoulda been 
    });
  }
  static createFromSummaryResponse(resp: ProviderSummaryResponse) {
    return new Institution(<InstitutionShape>{
      id: resp.id,
      name: resp.longName,
      commonName: resp.name,
      slug: resp.slug,
      logoUrl: `assets/img/res/insto/${resp.slug}.png`
    });
  }
}