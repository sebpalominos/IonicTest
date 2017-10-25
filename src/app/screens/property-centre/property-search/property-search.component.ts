import { Component } from '@angular/core';
import { NavParams, NavController, LoadingController, AlertController, ViewController, ModalController, ActionSheetController } from 'ionic-angular';

import { Property, PropertyShape } from '../shared/property.model';
import { PropertyEvents } from '../shared/property-events';
import { PropertySearchType, PropertySearchSuggestion, PropertySearchSummary, PropertySearchMessage, PropertySearchSuggestionShape } from '../shared/property-search.model';
import { LocalityShape, AddressShape } from '../../misc/shapes/geography';
import { PropertyService } from '../../../core/services/property/property.service';
import { PropertyFilterComponent } from '../../../shared/property-filter/property-filter.component';
import { PropertyFilterShape } from '../../../shared/property-filter/property-filter';

type SuggestionInfo = {
  suggestion: PropertySearchSuggestion;
  action: any;
};

@Component({
  selector: 'modal-property-search',
  templateUrl: 'property-search.html',
  host: {
    class: 'property-search'
  }
})
export class PropertySearchComponent {
  searchParams: { [paramName: string]: any };
  selectedAddresses: AddressShape[];
  propertySearchTypes: any = PropertySearchType;
  propertySearchTypeValue: PropertySearchType;
  presetSearchTerm: string;
  isSearchFocused: boolean;
  showSearchError: boolean;
  searchInfoMessages: string[];
  searchWarningMessages: string[];
  suggestions: SuggestionInfo[];
  propertyFilter: PropertyFilterShape;
  suggestion: PropertySearchSuggestionShape;
  loadingSuggestions: boolean = false;
  clearSearchSuggestion: boolean = false;
  isDebounced;

  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected alertCtrl: AlertController,
    protected viewCtrl: ViewController,
    protected modalCtrl: ModalController,
    protected actionSheetCtrl: ActionSheetController,
    protected loadingCtrl: LoadingController,
    protected propertyService: PropertyService
  ) { }
  ionViewWillLoad() {
    this.propertySearchTypeValue = Number(this.params.get('propertySearchType') || 0);
    console.log('this.propertySearchTypeValue',this.propertySearchTypeValue);
    this.presetSearchTerm = this.params.get('presetSearchTerm') || '';
    console.log('this.presetSearchTerm ',this.presetSearchTerm );
    this.searchParams = {
      price: { lower: 100, upper: 1000 },
      locality: this.presetSearchTerm,
      freetext: this.presetSearchTerm,
    };
  }
  ionViewWillEnter() {
    if (this.presetSearchTerm) {
      console.log('this.presetSearchTerm (ionViewWillEnter)',this.presetSearchTerm );
      this.search();
    } 
  }

  onKeyDown(){
    clearTimeout(this.isDebounced);
  }

  onKeyUp(){    
    this.isDebounced = setTimeout(()=>{
      if(this.searchParams.freetext.length >2){
        this.search();
        // console.log('up',this.searchParams.freetext);
      }
    },2000);
  }

  search() {
    this.showSearchError = false;
    this.searchInfoMessages = [];
    this.searchWarningMessages = [];
    if (!this.validateSearchParams()) {
      this.alertCtrl.create({
        title: 'Invalid search',
        subTitle: 'Please enter some search terms',
        buttons: ['OK']
      });
      return;
    }
    // let loading = this.loadingCtrl.create({ content: 'Finding matches' });
    // loading.present();
    this.loadingSuggestions = true;
    this.clearSearchSuggestion = false;
    this.executeSearchType().then((suggestions: PropertySearchSuggestion[]) => {
      // Display suggestions as a list underneath the seach box
      this.suggestions = suggestions.map(suggestion => {
        let action = this.getSuggestionCallback(suggestion);
        return <SuggestionInfo>{ action, suggestion };
      });
      // loading.dismiss();
      this.loadingSuggestions = false;
      this.clearSearchSuggestion = true;
    }).catch(err => {
      this.displaySearchMesages(err);
      // loading.dismiss();
      this.loadingSuggestions = false;
      this.clearSearchSuggestion = true;
    });
  }

  clearSearch(event){
    event.preventDefault();
    this.searchParams.freetext = '';
  }

  cancel() {
    this.viewCtrl.dismiss(<PropertyEvents.PropertySearchResult>{ results: [], isUserCancelled: true });
  }
  setSearchFocused(isFocused: boolean) {
    console.log(`Set isSearchFocused to ${isFocused}`);
    this.isSearchFocused = isFocused;
  }

  private displaySearchMesages(messageObject: PropertySearchMessage | any) {
    if (Array.isArray(messageObject)) {
      // Anything that's validation, show as info. Otherwise, show as warning.
      this.searchInfoMessages = messageObject.filter(msg => {
        return msg.hasOwnProperty('message') &&
          ((msg as PropertySearchMessage).type === 'VALIDATION'
            || (msg as PropertySearchMessage).type === 'INFORMATION');
      }).map(msg => msg.message);
      this.searchWarningMessages = messageObject.filter(msg => {
        return msg.hasOwnProperty('message') && (msg as PropertySearchMessage).type !== 'VALIDATION';
      }).map(msg => msg.message);
    }
    else {
      this.showSearchError = true;
      console.error(messageObject);
    }
  }

  private getSuggestionCallback(suggestion: PropertySearchSuggestion): any {
    // console.log('this.suggestion',this.suggestion);
    switch (suggestion.locationType) {
      case 'address':
        return () => {
          // address suggestion always contains propertyId
          // Set the underlying results page to show the property anyway, then 
          // fast forward into the property detail screen
          let loading = this.loadingCtrl.create({ content: 'Opening property' });
          loading.present();
          console.log('address suggestion', suggestion);
          this.propertyService.getProperty(suggestion.propertyId)
            .then(property => {
              // console.log('property', property);
              let searchResults: PropertyEvents.PropertySearchResult = {
                results: [PropertySearchSummary.createFromProperty(property)],//this result is not used
                isPropertySingleResult: true,
                propertySingleResult: property
              };
              this.viewCtrl.dismiss(searchResults).then(() => {
                // this.navCtrl.push(this.screens['property'], { property });
                loading.dismissAll();
              });
            })
            .catch(err => {
              console.error(err);
              this.alertCtrl.create({
                title: 'Could not get results',
                message: 'There was an error when opening this property.',
                buttons: [
                  { text: 'Cancel', role: 'cancel' },
                  { text: 'Try again', handler: () => this.getSuggestionCallback(suggestion) }
                ]
              }).present();
              loading.dismissAll();
            });
        };
      case 'locality':
        return () => {
          
          console.log('locality suggestion', suggestion);
          this.suggestion = suggestion;

          let propertyFilterView = this.modalCtrl.create(PropertyFilterComponent);
          propertyFilterView.onDidDismiss(data =>{
            // console.log('data',data);
            if(data){
              let loading = this.loadingCtrl.create({ content: `Loading results for ${suggestion.displayName}` });
              loading.present();

              let filter = this.processFilter(data);
              // Search location with filter
              this.searchLocalityWithFilter(suggestion,loading,filter);   
            }
          });
          propertyFilterView.present();       
        };
      case 'postcode':
        return () => {          
          console.log('postcode suggestion', suggestion);
          this.suggestion = suggestion;

          let propertyFilterView = this.modalCtrl.create(PropertyFilterComponent);
          propertyFilterView.onDidDismiss(data =>{
            // console.log('data',data);
            if(data){
              let loading = this.loadingCtrl.create({ content: `Loading results for ${suggestion.displayName}` });
              loading.present();

              let filter = this.processFilter(data);
              // Search location with filter
              this.searchPostcodeWithFilter(suggestion,loading,filter);   
            }
          });
          propertyFilterView.present();  
        };
      case 'street':
        return () => {          
          console.log('street suggestion', suggestion);
          this.suggestion = suggestion;

          let propertyFilterView = this.modalCtrl.create(PropertyFilterComponent);
          propertyFilterView.onDidDismiss(data =>{
            // console.log('data',data);
            if(data){
              let loading = this.loadingCtrl.create({ content: `Loading results for ${suggestion.displayName}` });
              loading.present();
              
              let filter = this.processFilter(data);
              // Search location with filter
              this.searchStreetWithFilter(suggestion,loading,filter);   
            }
          });
          propertyFilterView.present();  
        };
      default:
        return () => {
          console.log('Default suggestion selected (no op)');
        };
    }
  }

  private searchLocalityWithFilter(suggestion: PropertySearchSuggestion, loading, filter){
    console.log('filter',filter);
    this.propertyService.getSearchResultsForLocality(suggestion.localityId, filter).then(summaries => {
      this.thenSummaries(summaries, loading);
    }).catch(err => {
      this.catchSummaries(err,suggestion,loading);
    });
  }

  private searchPostcodeWithFilter(suggestion: PropertySearchSuggestion, loading, filter){
    console.log('filter',filter);
    this.propertyService.getSearchResultsForPostcode(suggestion.postcodeId, filter).then(summaries => {
      this.thenSummaries(summaries, loading);
    }).catch(err => {
      this.catchSummaries(err,suggestion,loading);
    });
  }

  private searchStreetWithFilter(suggestion: PropertySearchSuggestion, loading, filter){
    console.log('filter',filter);
    this.propertyService.getSearchResultsForStreet(suggestion.streetId, filter).then(summaries => {
      this.thenSummaries(summaries, loading);
    }).catch(err => {
      this.catchSummaries(err,suggestion,loading);
    });
  }

  private thenSummaries(summaries, loading){
    console.log('search summaries', summaries);
    summaries.propertySummaryList.forEach((elem) => {
      this.propertyService.getProperty(elem.id).then(property => {
        elem.currentValue = property.currentValue;//Assigning price to summary search property
      });
    });  
    this.viewCtrl.dismiss(<PropertyEvents.PropertySearchResult>{
      results: summaries.propertySummaryList,
      page: {
        number: summaries.page.number,
        size: summaries.page.size,
        totalElements: summaries.page.totalElements,
        totalPages: summaries.page.totalPages
      },
      filter: this.propertyFilter,
      suggestion: this.suggestion
    }).then(() => {
      loading.dismissAll();
    });
  }

  private catchSummaries(err,suggestion,loading){
    console.error(err);
    this.alertCtrl.create({
      title: 'Could not get results',
      message: 'There was an error when retrieving search results.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Try again', handler: () => this.getSuggestionCallback(suggestion) }
      ]
    }).present();
    loading.dismissAll();
  }

  private processFilter(data){
    this.propertyFilter = data;
    let propTypeData = [];
    let propertyType;
    let sortByData;
    let filter = {};

    data.filter.propertyTypes.forEach(elem => {
      if(elem.selected){
        propTypeData.push(elem.param);
      }
    });

    if(propTypeData.length > 0){
      propertyType = '';
      propTypeData.forEach((elem,index) =>{
        if(index === propTypeData.length - 1){
          propertyType += elem;
        }else{
          propertyType += elem + ',';
        }
      });
    }else{
      propertyType = 'all';
    }

    data.filter.sortBy.forEach(elem => {
      if(elem.selected){
        sortByData = elem.param
      }
    });

    if(data.filter.sort){
      sortByData += ',desc';
    }else{
      sortByData += ',asc';
    }

    filter = { otm:data.filter.otm, types:propertyType, sort:sortByData };
    return filter;
  }

  private getQueryForSearchType(overrideSearchType?: PropertySearchType): any {
    let propertySearchType = overrideSearchType || this.propertySearchTypeValue;
    switch (propertySearchType) {
      case PropertySearchType.LocationFeatures:
        return String(this.searchParams['locality']);
      default:
        return String(this.searchParams['freetext']);
    }
  }
  private validateSearchParams(overrideSearchType?: PropertySearchType): boolean {
    let propertySearchType = overrideSearchType || this.propertySearchTypeValue;
    let query: any = this.getQueryForSearchType(propertySearchType);
    switch (propertySearchType) {
      case PropertySearchType.LocationFeatures:
        let hasTownSuburb: boolean = query.trim().length > 0;
        return hasTownSuburb;
      default:
        let hasFreetext: boolean = query.trim().length > 0;
        return hasFreetext;
    }
  }
  private executeSearchType(overrideSearchType?: PropertySearchType): Promise<PropertySearchSuggestion[]> {
    let propertySearchType = overrideSearchType || this.propertySearchTypeValue;
    let query: any = encodeURIComponent(this.getQueryForSearchType());
    switch (propertySearchType) {
      case PropertySearchType.LocationFeatures:
      default:
        return this.propertyService.getSearchSuggestions(String(query));
    }
  }
} 