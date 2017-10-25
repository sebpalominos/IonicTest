import { PropertyShape } from '../../../screens/property-centre/shared/property.model';
import { PropertySearchSummary } from '../../../screens/property-centre/shared/property-search.model';
import { Currency } from '../shared/constant-types';

// Building & location types. These should map directly to the API response.
export type ResponseBuildingTypeValue = 'UNIT' | 'FLATS' | 'COMMERCIAL' | 'HOUSE' | 'LAND' | 'BUSINESS' | 'OTHER' | 'COMMUNITY' | 'FARM' | 'STORAGE_UNIT';
export type ResponseLocationTypeValue = 'address' | 'street' | 'locality' | 'postcode';

/**
 * Simple results response for display on a suggestions list
 * Note: Corresponds to the `suggest` endpoint
 * @export
 * @interface PropertySearchSuggestionResponse
 */
export interface PropertySearchSuggestionsResponse {
  suggestions: Array<{
    isBodyCorporate: boolean;
    isUnit: boolean;
    localityId: number;
    locationType: ResponseLocationTypeValue;
    postcodeId: number;
    propertyId: number;
    streetId: number;
    suggestion: string;
  }>;
}

/**
 * Detailed results response for display on a results page. 
 * Note: Corresponds to the `suggest-detailed` endpoint
 * @export
 * @interface PropertySearchResultResponse
 */
export type PropertySearchResultResponse = {
  items: PropertyResponse[];
};

/**
 * Detailed result for a specific property. 
 * Note: Corresponds to the `get-detailed` endpoint
 * @export
 * @interface PropertyResponse
 */
export interface PropertyResponse {
  // currentValue: number;
  salePrice: Currency;
  avms: Array<{
    estimate: Currency;
    highEstimate: Currency;
    lowEstimate: Currency;
    score: number;
    source: string;
    valuationDate: number;
  }>;
  currencyCode: string;     // TBA should this be removed
  description: string;      // Todo: Give us a list of reference descriptions
  singleLineAddress: string;
  validUntil: string;
  buildingType: ResponseBuildingTypeValue;
  thumbnailImages: string[];
  mediumImages: string[];
  address: {
    councilArea: string;      // "Adelaide",
    singleLine: string;       // "1 Aardvark Street Adelaide SA 5000",
    startNumber: number;      // 1,
    street: {
      extension: string;    // "STREET",
      id: number;         //16,
      locality: {
        id: number;       // 22677,
        name: string;     // "ADELAIDE",
        postcode: {
          id: number;    // 1407129,  // Note: CoreLogic obviously has its own IDs for postcodes
          name: string;    //  "5000",
          singleLine: string;    // "5000 SA",
          state: string;      // "SA"
        },
        singleLine: string;     // "Adelaide SA 5000"
      },
      name: string;           // "AARDVARK",
      nameAndNumber: string;   // "1 AARDVARK STREET ",
      singleLine: string;       //"Aardvark Street Adelaide SA 5000"
    }
  },
  features: {
    Condition: string;    //  "Not Available",
    'Air Conditioned': string;     //  "TRUE",
    'Lockup Garages': string;     // "1"
    'Development Zone': string;   // "High Density Residential";
    'Building Area': string;    //  "148",
    'M2 Total In Floor Area': string;   // "148",
    'Materials in Floor': string;     // "PORCELAIN FLOOR",
    'Kitchen Features': string;     // "STAINLESS STEEL APPLIANCES",
    'Climate Control Features': string;   // "0",
    'Other Special Features': string;   // "0",
    'Air Condition Features': string;   //  "AIRCONDITIONING"
  },
  attributes: {
    bathrooms: number;      //  2,
    bedrooms: number;     // 3,
    carSpaces: number;    // 2,
    isCalculatedLandArea: boolean;    // true,
    landArea: number;   // 0,
    lockUpGarages: number;    // 1
  },
  source: string;     // "CoreLogic",
  externalId: number;   // 16,
  mortgages: any;    // null,     // Not sure what format this is in...?
  id: any;      // null;      // ditto
};

export interface PropertySearchSummaryResponse{
  propertySummaryList: PropertySearchSummary[];
  page: PageResponseShape;
}

export interface PageResponseShape {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Temporary: Pending confirmation on 'final' output of `get-locality-summary`
export interface LocalitySummaryResponse {
  propertySummaryList: PropertySummaryResponse[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  }
};

export interface PropertyOtmShape {
  agency: string;
  agent: string;
  date: string;
  isActiveCampaign: boolean;
  method: string
  priceDescription: string
}

/**
 * Contains a property summary for a locality. 
 * @export
 * @interface PropertySummaryResponse
 */
export interface PropertySummaryResponse {
  propertySummary: {
    address: {
      singleLineAddress: string;    // "1/3-5 Beach Parade Surfers Paradise QLD 4217";
    },
    attributes: {
      bathrooms: number;    //  2,
      bedrooms: number;     //  2,
      carSpaces: number;    // 2,
      isCalculatedLandArea: boolean;    // true,
      landArea: number;     // 0,
      lockUpGarages: number;    // 2
    },
    coordinate: {
      latitude: number;   // -28.01824725,
      longitude: number;  // 153.43063636
    },
    id: number;   // 15934537,
    locationIdentifiers: {
      localityId: number;   // 30634,
      postCodeId: number;   // 1306799,
      streetId: number;   // 2512556
    },
    otmForSaleDetail?:{
      agency: string;
      agent: string;
      date: string;
      isActiveCampaign: boolean;
      method: string;
      priceDescription: string;
    },
    propertyPhoto: {
      largePhotoUrl: string;  // "https://static.rpdata.com/rpdaAU/photo/listsale/768x512/16/10/23/27733374/27733374_1.JPG",
      mediumPhotoUrl: string; // "https://static.rpdata.com/rpdaAU/photo/listsale/470x313/16/10/23/27733374/27733374_1.JPG",
      scanDate: string;   // "2016-10-23",      // Note: Convert this to datetime
      thumbnailPhotoUrl: string;    //  "https://static.rpdata.com/rpdaAU/photo/listsale/120x80/16/10/23/27733374/27733374_1.JPG"
    },
    propertyStatus: {
      otmForRent: boolean;    // false,
      otmForSale: boolean;    // true,
      recentSale: boolean;    // false
    },
    propertySubType: string;    // "Unit",    // This is supposed to be a description 'nice name'
    propertyType: ResponseBuildingTypeValue;     // "UNIT"
  }
}

// Error or warning responses
export interface PropertySearchMessageResponse {
  messages: Array<{
    code: number;
    message: string;
    type: 'VALIDATION'|string;
  }>
}