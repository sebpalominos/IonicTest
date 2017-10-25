import { PropertyResponse, PropertySearchResultResponse, ResponseBuildingTypeValue } from '../../../core/data/property/property-response';
import { PropertyMapper } from '../../../core/data/property/property-mapper';
import { PropertyType, PropertySaleType } from './property-data-maps';
import { LocalityShape, AddressShape } from '../../misc/shapes/geography';
import { Currency } from '../../../core/data/shared/constant-types';

/** Property (residential dwelling) shape */
export interface PropertyShape {
  id: number;
  address: AddressShape;
  features: PropertyFeaturesShape;
  currentValue: number;    // from RPData estimate
  currentHighValue?: number;
  currentLowValue?: number;
  currentValueDate?: Date;
  userDefinedValue?: number;      // Something that the user would input
  historicalValues?: PropertyAvmShape[];
  saleType?: number;         // Enum 
  salePrice?: number;        // If it's for sale, how much
  description?: string;  
  images?: string[];
  thumbnailImages?: string[];
  detailImages?: string[];
  validUntil?: Date;
}
/** Property features shape, for features that won't change over time */
export interface PropertyFeaturesShape {
  buildingType: PropertyType;
  bed: number;
  bath: number;
  car: number;
  landSize?: number;      // in sq metres
  floorSize?: number;    // in sq metres
  yearBuilt?: number;
}
export interface PropertyAvmShape {
  estimate: number;
  highEstimate: number;
  lowEstimate: number;
  valuationDate: Date;
}
/** Used for submitting properties in Affordability */
export interface PropertyAssociationPayload {
  source: string;
  externalId: number;
  address: string;
  description: string;
  salePrice?: Currency;
  userValuedPrice?: Currency;
  currencyCode: string;
}
/** Instruct the property to keep response */
interface KeepsPropertyResponse {
  _propertyResponse: PropertyResponse;
  _propertyAssociationPayload: PropertyAssociationPayload;     // Used for real estate goal property association
}
/** A concrete version of the Property shape */
export class Property implements PropertyShape, KeepsPropertyResponse {
  id: number;
  address: AddressShape;
  features: PropertyFeaturesShape;
  currentValue: number;
  currentHighValue?: number;
  currentLowValue?: number;
  currentValueDate?: Date;
  userDefinedValue?: number;      // Something that the user would input
  historicalValues?: PropertyAvmShape[];  description?: string;
  saleType?: PropertySaleType;
  salePrice?: number;        // If it's for sale, how much
  images?: string[];
  thumbnailImages?: string[];
  detailImages?: string[];
  validUntil?: Date;
  _propertyResponse: PropertyResponse;
  _propertyAssociationPayload: PropertyAssociationPayload;
  constructor(...shapes: Partial<PropertyShape & KeepsPropertyResponse>[]) {
    Object.assign(this, ...shapes);
  }
  displayName(): string {
    return (this.address && this.address.full) || '(No address given)';
  }
  coverImage(forInlineCss = false): string {
    let determineImage = () => {
      if (this.detailImages && this.detailImages.length > 0){
        return this.detailImages[0];
      }
      if (this.images && this.images.length > 0){
        return this.images[0];
      }
      if (this.thumbnailImages && this.thumbnailImages.length > 0){
        return this.thumbnailImages[0];
      }
      return 'assets/img/placeholder/realeastate-not-available.jpg';
    };
    return forInlineCss ? `url('${determineImage()}')` : determineImage();
  }
  /** Create list of property results from response */
  static createListFromResponse(respList: PropertySearchResultResponse): Property[] {
    return respList.items.map(propertyResponse => this.createFromResponse(propertyResponse));
  }
  /** Return a single property from a response */
  static createFromResponse(resp: PropertyResponse, id?: number): Property {
    if (!resp.address) {
      return undefined;  // Short circuit reject if address is empty
    }
    if (resp.avms) {
      var avmList = resp.avms.map(avmResp => (<PropertyAvmShape>{
        estimate: avmResp.estimate.amount,
        highEstimate: avmResp.highEstimate.amount,
        lowEstimate: avmResp.lowEstimate.amount,
        valuationDate: new Date(avmResp.valuationDate)
      }));
      var mostCurrentAvm = resp.avms.slice().sort((a, b) => +a.valuationDate - +b.valuationDate).pop(); 
    }
    let defaultValidUntil: Date = new Date(Date.now() + 24*60*60*1000);
    let propertyData: PropertyShape = {
      id: id,
      address: {
        full: resp.address && resp.address.singleLine,
        number: String(resp.address.startNumber),
        street: `${resp.address.street.name} ${resp.address.street.extension}`,
        numberStreet: resp.address.street.nameAndNumber,
        townSuburb: resp.address.street.locality.name,
        state: resp.address.street.locality.postcode.state,
        postcode: resp.address.street.locality.postcode.name,
      },
      features: {
        buildingType: PropertyMapper.mapBuildingTypeResponse(resp.buildingType),
        bed: resp.attributes.bedrooms,
        bath: resp.attributes.bathrooms,
        car: resp.attributes.carSpaces,
        landSize: resp.attributes.landArea,
        floorSize: resp.features && Number(resp.features['Building Area']),
      },
      currentValue: mostCurrentAvm && mostCurrentAvm.estimate.amount,
      currentHighValue: mostCurrentAvm && mostCurrentAvm.highEstimate.amount,
      currentLowValue: mostCurrentAvm && mostCurrentAvm.lowEstimate.amount,
      currentValueDate: mostCurrentAvm && new Date(mostCurrentAvm.valuationDate),
      historicalValues: avmList,
      salePrice: resp.salePrice && resp.salePrice.amount,
      saleType: 0,
      description: resp.description, 
      validUntil: resp.validUntil ? new Date(resp.validUntil) : defaultValidUntil,
      images: resp.mediumImages || resp.thumbnailImages || undefined
    };
    return new Property(propertyData, { 
      thumbnailImages: resp.thumbnailImages,
      detailImages: resp.mediumImages
    }, { 
      _propertyResponse: resp,
      _propertyAssociationPayload: {
        externalId: id,
        salePrice: resp.salePrice,
        // userValuedPrice: <Currency> { amount: resp.salePrice.amount, currencyCode: 'AUD' },
        source: resp.source,
        address: resp.singleLineAddress,
        currencyCode: (resp.salePrice && resp.salePrice.currencyCode) || resp.currencyCode,
        description: resp.description
      }
    });
  }

}