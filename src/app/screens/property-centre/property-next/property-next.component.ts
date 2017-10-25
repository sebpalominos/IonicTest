import { Component } from '@angular/core';
import { NavParams, NavController, LoadingController, Events } from 'ionic-angular';

import { PropertyComponent } from '../property/property.component';
import { PropertyGoalComponent } from '../property-goal/property-goal.component';
import { PropertyResultsComponent } from '../property-results/property-results.component';
import { PropertyShortlistComponent } from '../property-shortlist/property-shortlist.component';
import { PropertyFavourite, FavouriteItemInfo } from '../shared/property-data-maps';
import { PropertySearchSummary } from '../shared/property-search.model';
import { AffordabilityComponent } from '../../affordability/affordability.component';
import { PropertyService } from '../../../core/services/property/property.service';

@Component({
  selector: 'scr-property-next',
  templateUrl: 'property-next.component.html',
  host: {
    class: 'property-next'
  }
})
export class PropertyNextComponent {
  topFavourites: FavouriteItemInfo[];
  topShownCount: number;
  totalFavourites: number;
  numFavouritesLeftPluralMapping: any;
  screens = { 
    property: PropertyComponent,
    propertyGoal: PropertyGoalComponent,
    propertyResults: PropertyResultsComponent,
    propertyShortlist: PropertyShortlistComponent,
    affordability: AffordabilityComponent
  };
  showLoadingFavourites: boolean;
  constructor(
    protected navCtrl: NavController,
    protected events: Events,
    protected propertyService: PropertyService
  ) {}
  ionViewWillLoad() {
    this.topShownCount = 5;
    this.loadTopFavourites();
    this.numFavouritesLeftPluralMapping = {
      '=0': 'no properties',
      '=1': '1 property',
      'other': '# properties'
    };
  }
  propertySelected(propertySummary: PropertySearchSummary) {
    let favouriteItemInfo = this.topFavourites.find(favInfo => favInfo.summary.id === propertySummary.id);
    let propertyScreenParams = favouriteItemInfo ? { property: favouriteItemInfo.property, coordinates: propertySummary.coordinates } : { id: propertySummary.id, coordinates: propertySummary.coordinates };
    this.navCtrl.push(this.screens['property'], propertyScreenParams);
  }
  private loadTopFavourites(foreground = false) {
    this.showLoadingFavourites = true;
    this.propertyService.getFavourites().then((favourites: PropertyFavourite[]) => {
      favourites = Array.isArray(favourites) ? favourites : [];
      let validFavourites = favourites.filter(fav => fav.propertyId);
      this.totalFavourites = validFavourites.length;
      this.topFavourites = validFavourites.slice(0, this.topShownCount).map(favourite => ({ 
        favourite: favourite,
        property: undefined, 
        summary: undefined 
      }));
      setTimeout(() => {
        this.events.publish('slider:init', ['slider-property-shortlist']);
      }, 0);
    }).then(() => {
      let loadFavourites = this.topFavourites.map((favInfo, index, arr) => {
        return this.propertyService.getProperty(favInfo.favourite.propertyId).then(property => {
          arr[index].property = property;
          arr[index].summary = PropertySearchSummary.createFromProperty(property);
        });
      });
      Promise.all(loadFavourites).then(() => {
        this.showLoadingFavourites = false;
      });
    }).catch(err => {
      this.showLoadingFavourites = false;
      console.error(err);
    });
  }
}