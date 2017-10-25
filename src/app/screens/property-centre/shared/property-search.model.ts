import { LocalityShape, AddressShape } from '../../misc/shapes/geography';
import { Property, PropertyFeaturesShape } from './property.model';
import { ResponseLocationTypeValue, PropertyOtmShape } from '../../../core/data/property/property-response';
import { PropertySearchSuggestionsResponse, PropertySummaryResponse } from '../../../core/data/property/property-response';
import { PropertyType, PropertySaleType } from './property-data-maps';
import { PropertyMapper } from '../../../core/data/property/property-mapper';

export interface PropertySearchSuggestionShape {
  localityId?: number;
  postcodeId?: number;
  propertyId?: number;
  streetId?: number;
  displayName: string;
  locationType?: ResponseLocationTypeValue;    // address, street, locality, postcode
}
/**
 * A suggestion entry, mixed type, for display as the autocomplete/suggestions list.
 * @export
 * @class PropertySearchSuggestion
 * @implements {PropertySearchSuggestionShape}
 */
export class PropertySearchSuggestion implements PropertySearchSuggestionShape {
  displayName: string;
  locationType?: ResponseLocationTypeValue;
  localityId?: number;
  postcodeId?: number;
  propertyId?: number;
  streetId?: number;
  constructor(...shapes: Partial<PropertySearchSuggestionShape>[]){
    Object.assign(this, ...shapes);
  }
  /** Return a list of property suggestion objects. */
  static createListFromResponse(resp: PropertySearchSuggestionsResponse): PropertySearchSuggestion[] {
    return resp.suggestions.map(sg => {
      return new PropertySearchSuggestion(<PropertySearchSuggestionShape> {
        displayName: sg.suggestion,
        localityId: sg.localityId,
        locationType: sg.locationType,
        postcodeId: sg.postcodeId,
        propertyId: sg.propertyId,
        streetId: sg.streetId        
      });
    });
  }
}

export interface PropertySearchSummaryShape {
  id: number;
  address: AddressShape;
  description: string; 
  currentValue: number;
  features: PropertyFeaturesShape;
  otmForSaleDetail?: PropertyOtmShape;
  otmForRent: boolean;
  otmForSale: boolean; 
  recentSale: boolean; 
  coordinates?: {
    latitude: number; 
    longitude: number;
  };
  imageUrls: {
    date?: Date;
    large?: string;
    medium?: string;
    thumbnail?: string;
  };
}

/**
 * A summary (lite) property object, ideal for displaying on the results page. 
 * @export
 * @class PropertySearchSummary
 * @see PropertySummaryResponse
 */
export class PropertySearchSummary implements PropertySearchSummaryShape {
  id: number;
  address: AddressShape;
  description: string;
  currentValue: number;
  features: PropertyFeaturesShape;
  otmForSaleDetail?: PropertyOtmShape;
  otmForRent: boolean;
  otmForSale: boolean;
  recentSale: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  imageUrls: {
    date?: Date;
    large?: string;
    medium?: string;
    thumbnail?: string;
  };
  constructor(...shapes: Partial<PropertySearchSummaryShape>[]){
    Object.assign(this, ...shapes);
  }
  displayName(): string {
    return (this.address && this.address.full) || '(No address given)';
  }
  thumbnailImage(): string {
    return this.imageUrls.thumbnail || this.imageUrls.medium || this.imageUrls.large || 'assets/img/placeholder/realestate-not-available-thumbnail.jpg';
  }
  coverImage(forInlineCss = false): string {
    let coverImage = this.imageUrls.medium || this.imageUrls.large || this.imageUrls.thumbnail || 'assets/img/placeholder/realestate-not-available.jpg';
    return forInlineCss ? `url('${coverImage}')` : coverImage;
  }
  static createFromResponse(resp: PropertySummaryResponse, otm): PropertySearchSummary {
    let smy = resp.propertySummary;
    
    let propertySummary = {
      id: smy.id,
      address: { full: smy.address.singleLineAddress },
      description: smy.propertySubType,
      currentValue: null,      
      features: {
        bed: smy.attributes.bedrooms,
        bath: smy.attributes.bathrooms,
        car: smy.attributes.carSpaces,
        landSize: smy.attributes.landArea,
        buildingType: PropertyMapper.mapBuildingTypeResponse(smy.propertyType)
      },
      otmForRent: smy.propertyStatus && smy.propertyStatus.otmForRent,
      otmForSale: smy.propertyStatus && smy.propertyStatus.otmForSale,
      recentSale: smy.propertyStatus && smy.propertyStatus.recentSale,
      coordinates: smy.coordinate,
      otmForSaleDetail: null,
      imageUrls: {
        date: smy.propertyPhoto && new Date(smy.propertyPhoto.scanDate),
        large: smy.propertyPhoto && smy.propertyPhoto.largePhotoUrl,
        medium: smy.propertyPhoto && smy.propertyPhoto.mediumPhotoUrl,
        thumbnail: smy.propertyPhoto && smy.propertyPhoto.thumbnailPhotoUrl
      }
    };
    if(otm){
      propertySummary.otmForSaleDetail = {
        agency: smy.otmForSaleDetail.agency,
        agent: smy.otmForSaleDetail.agent,
        date: smy.otmForSaleDetail.date,
        isActiveCampaign: smy.otmForSaleDetail.isActiveCampaign,
        method: smy.otmForSaleDetail.method,
        priceDescription: smy.otmForSaleDetail.priceDescription
      }
    }
    return new PropertySearchSummary(<PropertySearchSummary> propertySummary);
  }
  static createFromProperty(property: Property): PropertySearchSummary {
    let firstImage = imageList => imageList.length && imageList[0];
    return new PropertySearchSummary(<PropertySearchSummaryShape> {
      id: property.id,
      address: property.address,
      description: property.description,
      features: property.features,
      currentValue: property.currentValue,
      imageUrls: {
        medium: (property.detailImages && firstImage(property.detailImages)) || (property.images && firstImage(property.images)),
        thumbnail: (property.detailImages && firstImage(property.thumbnailImages)) || (property.images && firstImage(property.images))
      }
    });
  }
}

export interface PropertySearchMessage {
  type: 'VALIDATION'|'INFORMATION'|string,
  message: string;
};

export enum PropertySearchType {
  Default = 0,    // I guess default is freetext
  Address = 1, 
  LocationPrice = 2,
  LocationFeatures = 3,
  Advanced = 6
};