import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, LoadingController, ModalController, ViewController, AlertController, Content } from 'ionic-angular';

import { Property, PropertyShape } from '../shared/property.model';
import { PropertyEvents } from '../shared/property-events';
import { PropertyFavourite } from '../shared/property-data-maps';
import { PropertySearchSummary, PropertySearchSuggestionShape } from '../shared/property-search.model';
import { AddressShape } from '../../misc/shapes/geography';
import { PropertyComponent } from '../property/property.component';
import { PropertySearchComponent } from '../property-search/property-search.component';
import { PropertyService } from '../../../core/services/property/property.service';
import { PropertyFilterComponent } from '../../../shared/property-filter/property-filter.component';
import { PropertyFilterShape, FilterEndpoint } from '../../../shared/property-filter/property-filter';
import { PageResponseShape } from '../../../core/data/property/property-response';

type AdjustableVariables = {
  priceMin: number;
  priceMax: number;
  priceStep: number;
  priceSlider: any;
};

@Component({
  selector: 'scr-property-results',
  templateUrl: 'property-results.html',
  host: {
    class: 'property-results'
  }
})
export class PropertyResultsComponent {
  @ViewChild(Content) content: Content;
  results: PropertySearchSummary[];
  resultsPluralMapping: any;
  shouldLaunchSearch: boolean;
  presetSearchTerm: string;
  adjustableVariables: AdjustableVariables;
  favouritesMap: { [propertyId: number]: boolean };
  resultMessage: { [k: string]: string };
  screens: { [screenName: string]: any } = {
    property: PropertyComponent
  };
  propertyFilter: PropertyFilterShape;
  filterSetting: FilterEndpoint;
  page: PageResponseShape;
  suggestion: PropertySearchSuggestionShape;
  pageCount: number = 0;
  moreResults: boolean = true;

  constructor(
    public params: NavParams,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    protected alertCtrl: AlertController,
    protected viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public propertyService: PropertyService
  ) { }
  /**
   * // If a list of properties was provided via params, display those. 
   * // Otherwise by default, invoke the search modal
   * // Note: Providing an empty array of properties will prevent the search modal
   */
  ionViewWillLoad() {
    this.determineSearchBehaviour();
    this.propertyService.getFavourites().then((favs: PropertyFavourite[]) => {
      if (Array.isArray(favs)) {
        this.favouritesMap = this.favouritesMap || {};
        favs.forEach(fav => this.favouritesMap[fav.propertyId] = fav.isFavourite);
      }
    });
    // this.adjustableVariables = {
    //   priceMax: 2000000,
    //   priceMin: 100000,
    //   priceStep: 100000,
    //   priceSlider: {}
    // };

    this.resultsPluralMapping = {
      '=0': 'No results. ',
      '=1': 'Retreived one result. ',
      'other': 'Retrieved # results. '
    };
  }
  ionViewDidLoad() {
    if (this.shouldLaunchSearch) {
      this.launchSearchModal();
    }
  }

  scrollToTop() {
    this.content.scrollToTop();
  }

  showFilter() {
    let propertyFilterView = this.modalCtrl.create(PropertyFilterComponent, this.propertyFilter);
    propertyFilterView.onDidDismiss(data => {
      if (data && this.results) {
        this.propertyFilter = data;
        console.log('data', data);
        this.getSuggestionCallback(data);
        this.pageCount = 0;
        this.moreResults = true;
        
      }

    });
    propertyFilterView.present();
  }

  private getSuggestionCallback(filterParams): any {
    console.log('this.suggestion', this.suggestion);
    if (this.suggestion.locationType == 'locality') {
      let loading = this.loadingCtrl.create({ content: `Loading results for ${this.suggestion.displayName}` });
      loading.present();
      // console.log('locality suggestion', this.suggestion);

      let filter = this.processFilter(filterParams);
      this.filterSetting = filter;
      // Search location with filter
      this.searchLocalityWithFilter(this.suggestion, loading, filter);

    }
    else if (this.suggestion.locationType == 'postcode') {
      let loading = this.loadingCtrl.create({ content: `Loading results for ${this.suggestion.displayName}` });
      loading.present();
      // console.log('postcode suggestion', this.suggestion);

      let filter = this.processFilter(filterParams);
      this.filterSetting = filter;
      // Search location with filter
      this.searchPostcodeWithFilter(this.suggestion, loading, filter);

    }
    else if (this.suggestion.locationType == 'street') {
      let loading = this.loadingCtrl.create({ content: `Loading results for ${this.suggestion.displayName}` });
      loading.present();
      // console.log('street suggestion', this.suggestion);

      let filter = this.processFilter(filterParams);
      this.filterSetting = filter;
      // Search location with filter
      this.searchStreetWithFilter(this.suggestion, loading, filter);

    }
    else {
      console.log('Default suggestion selected (no op)');

    }
  }

  private processFilter(data): FilterEndpoint {
    this.propertyFilter = data;
    let propTypeData = [];
    let propertyType;
    let sortByData;
    let filter: FilterEndpoint;

    data.filter.propertyTypes.forEach(elem => {
      if (elem.selected) {
        propTypeData.push(elem.param);
      }
    });

    if (propTypeData.length > 0) {
      propertyType = '';
      propTypeData.forEach((elem, index) => {
        if (index === propTypeData.length - 1) {
          propertyType += elem;
        } else {
          propertyType += elem + ',';
        }
      });
    } else {
      propertyType = 'all';
    }

    data.filter.sortBy.forEach(elem => {
      if (elem.selected) {
        sortByData = elem.param
      }
    });

    if (data.filter.sort) {
      sortByData += ',desc';
    } else {
      sortByData += ',asc';
    }

    filter = { otm: data.filter.otm, types: propertyType, sort: sortByData, page: data.filter.page };
    return filter;
  }

  private searchLocalityWithFilter(suggestion: PropertySearchSuggestionShape, loading, filter) {
    console.log('filter', filter);
    this.propertyService.getSearchResultsForLocality(suggestion.localityId, filter).then(summaries => {
      this.thenSummaries(summaries, loading);
    }).catch(err => {
      this.catchSummaries(err, loading);
    });
  }

  private searchPostcodeWithFilter(suggestion: PropertySearchSuggestionShape, loading, filter) {
    console.log('filter', filter);
    this.propertyService.getSearchResultsForPostcode(suggestion.postcodeId, filter).then(summaries => {
      this.thenSummaries(summaries, loading);
    }).catch(err => {
      this.catchSummaries(err, loading);
    });
  }

  private searchStreetWithFilter(suggestion: PropertySearchSuggestionShape, loading, filter) {
    console.log('filter', filter);
    this.propertyService.getSearchResultsForStreet(suggestion.streetId, filter).then(summaries => {
      this.thenSummaries(summaries, loading);
    }).catch(err => {
      this.catchSummaries(err, loading);
    });
  }

  private thenSummaries(summaries, loading){
    this.results = summaries.propertySummaryList;
    this.page = summaries.page;
    this.scrollToTop();
    this.results.forEach((elem) => {
      this.propertyService.getProperty(elem.id).then(property => {
        elem.currentValue = property.currentValue;//Assigning price to summary search property
      });
    });  
    console.log('summaries', summaries);
    loading.dismissAll();
  }

  private catchSummaries(err, loading) {
    console.error(err);
    this.alertCtrl.create({
      title: 'Could not get results',
      message: 'There was an error when retrieving search results.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Try again', handler: () => this.getSuggestionCallback(this.propertyFilter) }
      ]
    }).present();
    loading.dismissAll();
  }

  launchSearchModal() {
    let propertySearchType = Number(this.params.get('propertySearchType'));
    let presetSearchTerm = this.params.get('presetSearchTerm');
    let searchModal = this.modalCtrl.create(PropertySearchComponent, { propertySearchType, presetSearchTerm });
    searchModal.onDidDismiss((resp: PropertyEvents.PropertySearchResult) => {
      console.log('resp', resp);
      if (!resp || resp.isUserCancelled) {
        // It's possible the user cancelled before searching
        // Do anything?
      }
      else {
        // Now assign those search results to ours.
        let { results, page, filter, suggestion, description, isPropertySingleResult, propertySingleResult } = resp;
        this.results = results;
        console.log('results', results);
        if (page) {//This doesn't exist if a results is a single property
          this.page = page;
        }
        if (filter) {//This doesn't exist if a results is a single property
          // filter.page = page.number;
          this.propertyFilter = filter;
          this.filterSetting = this.processFilter(filter);
          // console.log('this.propertyFilter ', this.propertyFilter);
          console.log('this.filterSetting ', this.filterSetting);
        }
        if (suggestion) {
          this.suggestion = suggestion;
        }
        // console.log('this.results',this.results);
        if (isPropertySingleResult && propertySingleResult) {
          this.navCtrl.push(PropertyComponent, { property: propertySingleResult });
        }
      }
    });
    searchModal.present();
  }
  priceRangeChanged(min: number, max: number) {
    console.log(`Price range changed: ${min} - ${max}`);
  }
  propertySelected(propertySummary: PropertySearchSummary) {
    this.navCtrl.push(this.screens['property'], { id: propertySummary.id, coordinates: propertySummary.coordinates });
  }
  propertyToggleFavourite(propertySummary: PropertySearchSummary) {
    let isAlreadyFavourite = this.favouritesMap.hasOwnProperty(propertySummary.id);
    let toggled = !isAlreadyFavourite;
    this.favouritesMap[propertySummary.id] = toggled;
    let fav: Partial<PropertyFavourite> = {
      propertyId: propertySummary.id,
      displayName: propertySummary.displayName(),
      thumbnailUrl: propertySummary.thumbnailImage(),
      date: new Date,
    };
    this.propertyService.setFavourite(fav, toggled);
  }
  /**
   * Define a bunch of bitmask flags.
   * First 4 bits are for the search type -- Note that PropertySearchType can contain max 16 members
   * Next 4 bits are for search modal invocation behaviour, etc
   */
  private determineSearchBehaviour() {
    let flagHasSearchType = Number(this.params.get('propertySearchType'));
    let flagHasPresetSearch = this.params.get('presetSearchTerm') ? 0b1000 : 0;
    let flagHasList = this.params.get('propertyList') ? 0b10000 : 0;
    let flagHasSuppress = this.params.get('shouldSuppressPropertySearch') ? 0b1000000 : 0;
    let propertyResultBitmask = flagHasSearchType | flagHasPresetSearch | flagHasList | flagHasSuppress;
    if (propertyResultBitmask < 64) {
      if (propertyResultBitmask > 16) {
        // It contains a propertylist at least, so display that instead of launching a search
        this.results = this.params.get('propertyList');
      }
      else {
        // launch a search modal
        this.shouldLaunchSearch = true;
      }
    }
  }

  loadMoreProperties(infiniteScroll) {
    if (this.page) {
      if (this.pageCount < this.page.totalPages - 1) {
        this.pageCount++;
        let filter: FilterEndpoint;
        filter = this.processFilter(this.propertyFilter);
        filter.page = this.pageCount;
        console.log('filter infinite', filter);

        if (this.suggestion.locationType == 'locality') {
          this.propertyService.getSearchResultsForLocality(this.suggestion.localityId, filter).then(summaries => {
            this.thenSummariesInfinite(summaries, infiniteScroll);
          }).catch(err => {
          });
        }
        else if (this.suggestion.locationType == 'postcode') {
          this.propertyService.getSearchResultsForPostcode(this.suggestion.postcodeId, filter).then(summaries => {
            this.thenSummariesInfinite(summaries, infiniteScroll);
          }).catch(err => {
          });
        }
        else if (this.suggestion.locationType == 'street') {
          this.propertyService.getSearchResultsForStreet(this.suggestion.streetId, filter).then(summaries => {
            this.thenSummariesInfinite(summaries, infiniteScroll);
          }).catch(err => {
          });
        }
        else {
          console.log('Default suggestion selected (no op)');
          infiniteScroll.complete();
        }
      }else {
        infiniteScroll.complete();
        this.moreResults = false;
      }
    } else {
      infiniteScroll.complete();
      this.moreResults = false;
    }
  }

  private thenSummariesInfinite(summaries, infiniteScroll){
    this.page = summaries.page;
    summaries.propertySummaryList.forEach((elem) => {
      this.propertyService.getProperty(elem.id).then(property => {
        elem.currentValue = property.currentValue;//Assigning price to summary search property
      });
    });  
    this.results = this.results.concat(summaries.propertySummaryList);
    infiniteScroll.complete();
    console.log('summaries', summaries);
  }
}