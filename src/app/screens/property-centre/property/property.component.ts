import { Component } from '@angular/core';
import { NavParams, NavController, AlertController, ModalController, LoadingController, ActionSheetController, Events } from 'ionic-angular';
import * as moment from 'moment';

import { Property } from '../shared/property.model';
import { PropertyType, PropertySaleType, PropertyFavourite } from '../shared/property-data-maps';
import { PropertyUtils } from '../shared/property-utils';
import { AffordabilityComponent } from '../../affordability/affordability.component';
import { CreateAffordabilityComponent } from '../../affordability/create-afford/create-afford.component';
import { PropertyService } from '../../../core/services/property/property.service';

type PropertySubInfoType = {
  title: string;
  value: string;
};

@Component({
    selector: 'scr-property',
    templateUrl: 'property.html',
    host: {
      class: 'property-single'
    }
})
export class PropertyComponent {
  showLoadingError: boolean;
  property: Property;
  propertyTypes: any = PropertyType;
  propertySaleType: any = PropertySaleType;
  currentValue: number;
  lastSaleDisplayValue: string;
  subInfo: Array<PropertySubInfoType>;
  isFavourite: boolean;
  coordinates;
  constructor(
    protected params: NavParams, 
    protected events: Events,
    protected navCtrl: NavController,
    protected alertCtrl: AlertController,
    protected modalCtrl: ModalController,
    protected loadingCtrl: LoadingController,
    protected actionSheetCtrl: ActionSheetController,
    protected propertyService: PropertyService
  ) {
  }
  ionViewDidLoad() {
    this.loadProperty().then(() => {
      this.loadPricingInfo();
    });
    
  }
  setFavouriteFromIcon(isFavourite: boolean) {
    this.alertCtrl.create({
      title: isFavourite ? 'Add to shortlist' : 'Remove from shortlist',
      message: isFavourite 
        ? 'Are you sure you want add this property to your shortlist?'
        : 'Are you sure you want to remove this property from your shortlist?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'OK', handler: () => this.setFavourite(isFavourite) }
      ]
    }).present();
  }
  setFavourite(isFavourite: boolean) {
    let thumbnailUrl = Array.isArray(this.property.thumbnailImages) && this.property.thumbnailImages.length 
      ? this.property.thumbnailImages[0] 
      : this.property.coverImage();
    let fav: Partial<PropertyFavourite> = {
      propertyId: this.property.id,
      displayName: this.property.displayName(),
      thumbnailUrl: thumbnailUrl,
      date: new Date,
    };
    this.propertyService.setFavourite(fav, isFavourite).then(success => {
      if (success) {
        this.isFavourite = isFavourite;
        this.events.publish('property:shortlistChanged');
        let shortlistChangeType = isFavourite ? 'property:shortlistAdded' : 'property:shortlistRemoved';
        this.events.publish(shortlistChangeType, this.property.id);
      }
    });
  }
  private loadProperty(): Promise<boolean> {
    this.showLoadingError = false;
    // NavParams should have the requested account ID
    return this.retrieveProperty().then((property: Property) => {
      this.property = property;
      this.propertyService.getFavourite(property.id).then(fav => {
        this.isFavourite = fav && fav.isFavourite;
      });
      setTimeout(() => {
        // This will execute outside of current digest cycle (or whatever its called in Angular 2)
        this.events.publish('slider:init', ['slider-property-images']);
      }, 0);
      return true;
    }).catch(err => {
      console.error(err);
      this.showLoadingError = true;
      return false;
    });
  }
  private retrieveProperty(): Promise<Property>{
    
    if (this.params.get('property')){//This comes from direct Property Search
      this.property = this.params.get('property');
      return Promise.resolve(this.property);
    }
    else if (this.params.get('id')){//This comes from a selected property in Property Search Result (Summary)
      // console.log('propertyId',this.params.get('id'));
      let loading = this.loadingCtrl.create({ content: 'Loading property' });
      loading.present();
      if (this.params.get('coordinates')){//These coordinates come from Property Summary
        this.coordinates = this.params.get('coordinates');
      }
      let propertyId = this.params.get('id');
      return this.propertyService.getProperty(propertyId).then(property => {
        console.log('property', property);
        loading.dismiss();
        return property;
      }).catch(err => {
        loading.dismiss();
        throw err;
      });
    }
  }
  private loadPricingInfo() {
    this.currentValue = this.property.currentValue;
    this.lastSaleDisplayValue = this.property.salePrice && `\$${PropertyUtils.moneyShortener(this.property.salePrice)}`;
    this.subInfo = [];
    if (this.property.currentLowValue) {
      this.subInfo.push({ title: 'Low range', value: `\$${PropertyUtils.moneyShortener(this.property.currentLowValue)}` });
    }
    if (this.property.currentHighValue) {
      this.subInfo.push({ title: 'High range', value: `\$${PropertyUtils.moneyShortener(this.property.currentHighValue)}` });
    }
    if (this.property.currentValueDate) {
      this.subInfo.push({ title: 'Last valued', value: moment(this.property.currentValueDate).format('DD MMM YYYY') });
    }
    // if (this.property.salePrice) {
    //   this.subInfo.push({ title: 'Last sale price', value: `\$${Math.round(this.property.salePrice/1000)}k` });
    // }
  }
  private showGoalCreateOptions() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'How do you want to use this property?',
      buttons:[
        { text: 'Cancel', role: 'cancel' },
        { text: 'Set as existing property', handler: () => {
          actionSheet.dismiss().then(navigateToAffordability.bind(this, 'existingProperty'));
          return false;
        } },
        { text: 'Set as target property', handler: () => {
          actionSheet.dismiss().then(navigateToAffordability.bind(this, 'targetProperty'));
          return false;
        } },
      ]
    });
    actionSheet.present();
    function navigateToAffordability(propertyParamName: string) {
      this.navCtrl.setRoot(AffordabilityComponent).then(() => {
        this.modalCtrl.create(CreateAffordabilityComponent, { [propertyParamName]: this.property }).present();
      });
    };
  }
}