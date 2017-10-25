import { Property } from './property.model';
import { PropertySearchSummary } from './property-search.model';
import { LocalityShape, AddressShape } from '../../misc/shapes/geography';

export enum PropertyType {
  Unit, 
  Commercial,
  House,
  Land,
  Community,
  Other,
  Farm,
  StorageUnit
}

export enum PropertySaleType {
  NotForSale,
  ForSale,
  UnderContract,
}

export type PropertyFavourite = {
  propertyId: number;
  displayName: string;
  thumbnailUrl: string;
  isFavourite: boolean;
  date: Date;
};

export type FavouriteItemInfo = {
  favourite: PropertyFavourite;
  property: Property;
  summary: PropertySearchSummary;
};

// *** For reference ***
const PROPERTY_TYPE_VALUES: any = {
  'H': 'house',
  'A': 'apartment',
  'T': 'townhouse',
  'L': 'land', 
  'V': 'villa',
  'G': 'acreage',
  'B': 'block of units'
};
export enum PropertyTypeDeprecated {
  H, A, T, L, V, G, B,
  House = H,
  Apartment = A,
  Townhouse = T,
  Land = L,
  Villa = V,
  Acreage = G,
  BlockOfUnits = B
}