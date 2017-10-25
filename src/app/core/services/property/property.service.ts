import { Injectable } from '@angular/core';
import { RequestOptionsArgs, URLSearchParams } from '@angular/http';
import { InsightsHttpService } from '../insights-http/insights-http.service';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import { AddressShape } from '../../../screens/misc/shapes/geography';
import { PropertyMockService } from './property-mock.service';
import { Property, PropertyShape } from '../../../screens/property-centre/shared/property.model';
import { PropertySearchSuggestion, PropertySearchSummary, PropertySearchMessage } from '../../../screens/property-centre/shared/property-search.model';
import { PropertyFavourite, FavouriteItemInfo } from '../../../screens/property-centre/shared/property-data-maps';
import { StateChangeResponse } from '../../data/shared/state-change-response';
import { PropertyResponse, PropertySearchResultResponse } from '../../data/property/property-response';
import { PropertySearchSuggestionsResponse, PropertySearchMessageResponse } from '../../data/property/property-response';
import { LocalitySummaryResponse, PropertySummaryResponse, PropertySearchSummaryResponse } from '../../data/property/property-response';

@Injectable()
export class PropertyService extends PropertyMockService {
  constructor(
    public http: InsightsHttpService,
    public storage: Storage
  ) { super() }
  /**
   * Mixed suggestions for freetext, which could include addresses, 
   * localities, postcodes, etc
   * @param {string} freetext - Something that evokes an address, locality, postcode, etc
   * @returns {Promise<Property[]>} 
   * @memberOf PropertyService
   */
  getSearchSuggestions(freetext: string): Promise<PropertySearchSuggestion[]> {
    // Do we need to deal with URL escaping here?
    let endpoint = ['real-estate', 'suggest'];
    let getParams = new URLSearchParams();
    getParams.set('q', freetext);
    let requestOptionsArgs: RequestOptionsArgs = {
      search: getParams
    };
    return this.http.get(endpoint, requestOptionsArgs).toPromise().then(resp => {
      let body: any = resp.json();
      if (body.hasOwnProperty('suggestions')) {
        let suggestions: PropertySearchSuggestionsResponse = resp.json();
        return PropertySearchSuggestion.createListFromResponse(suggestions);
      }
      else {
        if (body.hasOwnProperty('messages')) {
          let messageResponse: PropertySearchMessageResponse = resp.json();
          throw messageResponse.messages.map(msg => {
            return <PropertySearchMessage> {
              type: msg.type,
              message: `${msg.message} (${msg.code})`
            };
          });
        }
      }
    });
  }

  private processSearchResultForLocation(endpoint, filter): Promise<PropertySearchSummaryResponse>{
    let getParams = new URLSearchParams();
    getParams.set('otm', filter.otm);
    getParams.set('sort', filter.sort);
    getParams.set('types', filter.types);
    getParams.set('page', filter.page);
    let requestOptionsArgs: RequestOptionsArgs = {
      search: getParams
    };
    return this.http.get(endpoint, requestOptionsArgs).toPromise().then(resp => {
      let body: LocalitySummaryResponse = resp.json();
      // console.log('body locality',body);
      return {
        propertySummaryList: body.propertySummaryList.map(smy => PropertySearchSummary.createFromResponse(smy, filter.otm)),
        page: {
          number: body.page.number,
          size: body.page.size,
          totalElements: body.page.totalElements,
          totalPages: body.page.totalPages
        }
      }      
    });
  }

  getSearchResultsForLocality(localityId: number, filter): Promise<PropertySearchSummaryResponse> {    
    let endpoint = ['real-estate', 'get-locality-summary', String(localityId)];
    return this.processSearchResultForLocation(endpoint, filter);
  }

  getSearchResultsForStreet(streetId: number, filter): Promise<PropertySearchSummaryResponse> {
    let endpoint = ['real-estate', 'get-street-summary', String(streetId)];
    return this.processSearchResultForLocation(endpoint, filter);
  }

  getSearchResultsForPostcode(postcodeId: number, filter): Promise<PropertySearchSummaryResponse> {
    let endpoint = ['real-estate', 'get-postcode-summary', String(postcodeId)];
    return this.processSearchResultForLocation(endpoint, filter);
  }
  /**
   * Retrieve a specific property. Can be used when opening a detailed real estate 
   * screen, coming from a list response.
   * @param {number} propertyId - Returned from suggest endpoint
   * @returns {Promise<Property>} 
   * @see {@link https://opicagroup.atlassian.net/wiki/pages/viewpage.action?pageId=1647006&focusedCommentId=1692610|API docs}
   * @memberOf PropertyService
   */
  getProperty(propertyId: number) : Promise<Property> {
    let endpoint = ['real-estate', 'get-detailed', String(propertyId)];
    return this.http.get(endpoint).toPromise().then(resp => {
      let propertyResponse: PropertyResponse = resp.json();
      // console.log('body property',propertyResponse);
      return Property.createFromResponse(propertyResponse, propertyId);
    });
  }
  /**
   * Retrieve favourited items for property shortlist feature
   * @returns {Promise<PropertyFavourite[]>} 
   * @memberOf PropertyService
   * @todo Investigate cause of null favourites?
   */
  getFavourites(limit?: number) : Promise<PropertyFavourite[]> {
    return this.storage.get('property.favourites').then(entries => {
      // Todo: Any data mapping that needs to be done?
      if (entries && Array.isArray(entries)) {
        // let favs: PropertyFavourite[] = entries.filter(entry => entry.isFavourite);
        return limit === undefined 
          ? entries.filter(entry => entry.isFavourite)
          : entries.filter(entry => entry.isFavourite).slice(0, limit)
      }
      else {
        console.warn('Entries format not recognised as Array');
        return [];
      }
    });
  }
  /**
   * Retrieve favourited items for property shortlist feature
   * @returns {Promise<PropertyFavourite[]>} 
   * @memberOf PropertyService
   */
  getFavourite(propertyId) : Promise<PropertyFavourite> {
    return this.getFavourites().then(entries => {
      return entries && entries.find(fav => fav.propertyId === propertyId);
    });
  }
  /**
   * Persist a favourited item for property shortlist feature
   * @param {number} propertyId 
   * @param {boolean} isFavourite 
   * @returns {Promise<StateChangeResponse>} 
   * @memberOf PropertyService
   */
  setFavourite(favourite: Partial<PropertyFavourite>, isFavourite: boolean) : Promise<StateChangeResponse> {
    return new Promise((resolve, reject) => {
      this.storage.get('property.favourites').then((favs: PropertyFavourite[]) => {
        // 'Update or create' scenario
        favs = favs || [];
        let fav = favs.find(fav => fav.propertyId === favourite.propertyId);
        if (fav) {
          // Assign the new favourite status to existing object
          Object.assign(fav, { isFavourite });
        }
        else {
          // Add a new favourite object 
          let newFav = Object.assign(<PropertyFavourite>{ 
            date: new Date(),
            displayName: `Property #${favourite.propertyId}`,
            thumbnailUrl: 'assets/img/placeholder/realestate-not-available-thumbnail.jpg',
          }, favourite, { isFavourite });
          favs.push(newFav);
        }
        return favs;
      }).then((favs: PropertyFavourite[]) => {
        this.storage.set('property.favourites', favs).then((favs: PropertyFavourite[]) => {
          resolve({ success: true });
        });
      })
    });
  }

}