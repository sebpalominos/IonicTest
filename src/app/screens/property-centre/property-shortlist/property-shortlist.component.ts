import { Component } from '@angular/core';
import { NavParams, NavController, Events } from 'ionic-angular';

import { PropertyComponent } from '../property/property.component';
import { PropertyShape, Property } from '../shared/property.model';
import { PropertyFavourite, FavouriteItemInfo } from '../shared/property-data-maps';
import { PropertySearchSummary } from '../shared/property-search.model';
import { PropertyService } from '../../../core/services/property/property.service';

@Component({
    selector: 'scr-property-shortlist',
    templateUrl: 'property-shortlist.html'
})
export class PropertyShortlistComponent {
  favourites: FavouriteItemInfo[];
  showLoadingFavourites: boolean;
  screens: { [screenName: string]: any } = { 
    property: PropertyComponent 
  };
  constructor(
    protected navCtrl: NavController,
    protected events: Events,
    protected propertyService: PropertyService
  ) {}
  ionViewWillLoad() {
    this.favourites = [];
  }
  ionViewDidLoad() {
    this.loadFavourites(true);
    this.events.subscribe('property:shortlistChanged', () => {
      this.loadFavourites();
    });
  }
  propertySelected(propertySummary: PropertySearchSummary) {
    let favouriteItemInfo = this.favourites.find(favInfo => favInfo.summary.id === propertySummary.id);
    let propertyScreenParams = favouriteItemInfo ? { property: favouriteItemInfo.property } : { id: propertySummary.id };
    this.navCtrl.push(this.screens['property'], propertyScreenParams);
  }
  private loadFavourites(foreground = false) {
    this.showLoadingFavourites = true;
    this.propertyService.getFavourites()
      .then((favourites: PropertyFavourite[]) => {
        if (!favourites) {
          this.showLoadingFavourites = false;
          return;
        }
        this.favourites = favourites.filter(fav => fav.propertyId).map(favourite => ({ 
          favourite: favourite,
          property: undefined, 
          summary: undefined 
        }));
        let loadingFavourites: Promise<any>[] = [];
        this.favourites.forEach((favInfo, index, arr) => {
          let loadingFavourite = this.propertyService.getProperty(favInfo.favourite.propertyId)
            .then(property => {
              arr[index].property = property;
              arr[index].summary = PropertySearchSummary.createFromProperty(property);
            })
            .catch(err => console.error(err));
          loadingFavourites.push(loadingFavourite);
        });
        Promise.all(loadingFavourites).then(() => {
          this.showLoadingFavourites = false;
        });
      });
  }
}