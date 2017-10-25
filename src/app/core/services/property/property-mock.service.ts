import { Injectable } from '@angular/core';

import { Property, PropertyShape } from '../../../screens/property-centre/shared/property.model';
import { AddressShape } from '../../../screens/misc/shapes/geography';
import { PropertyResponse, PropertySearchResultResponse } from '../../data/property/property-response';
import { StateChangeResponse } from '../../data/shared/state-change-response';
import { PROPERTIES } from '../../data/property/mock-properties';

@Injectable()
export class PropertyMockService {
  // getSearchSuggestions(freetext: string): Promise<Property[]> {
  //   let results = PROPERTIES.map(prop => new Property(prop));
  //   return Promise.resolve(results);
  // }
  // getPropertyShortlist() : Promise<Property[]> {
  //   let shortlist = PROPERTIES.slice(0,2).map(prop => new Property(prop));
  //   return Promise.resolve(shortlist);
  // }
  getProperty(propertyId: number) : Promise<Property> {
    let propertyShape = PROPERTIES.find(prop => prop.id === propertyId);
    if (propertyShape){
      let property = new Property(propertyShape);
      return Promise.resolve(property);
    }
    return Promise.reject('Not found');
  }
}