import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, ViewController, Tabs } from 'ionic-angular';

// import { PropertyShape, Property } from '../shared/property.model';
import { PropertyGoalComponent } from './property-goal/property-goal.component';
import { PropertyNextComponent } from './property-next/property-next.component';
import { PropertyResultsComponent } from './property-results/property-results.component';
import { PropertyShortlistComponent } from './property-shortlist/property-shortlist.component';
import { SearchbarTabParent } from '../misc/searchbar-tab-parent/searchbar-tab-parent';
import { VersionService } from '../../core/services/version/version.service';

@Component({
    selector: 'property-centre',
    templateUrl: 'property-centre.html'
})
export class PropertyCentreComponent extends SearchbarTabParent {
  @ViewChild('propertyCentreTabs') tabs: Tabs;
  propertySearchParams: any;
  screens: { [screenName: string]: any } = { 
    propertyNext: PropertyNextComponent,
    propertyGoal: PropertyGoalComponent,
    propertyResults: PropertyResultsComponent,
    propertyShortlist: PropertyShortlistComponent
  };
  constructor(
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected viewCtrl: ViewController,
    protected versionService: VersionService
  ) { super(params) }
  ionViewDidLoad() {
    this.propertySearchParams = { 
      propertySearchType: 0 
    };
  }
  ionViewCanEnter(): boolean{
   return this.versionService.isCapabilityEnabled('CAP_PROPERTY_CENTRE');
  }
  ionViewDidEnter() {
    // Jump to the appropriate tab, if tabIndex is provided
    if (this.params.get('tabIndex') !== undefined) {
      let tabIndex = parseInt(this.params.get('tabIndex'));
      if (tabIndex < this.tabs.length()) {
        this.tabs.select(tabIndex);
      }
    }
  }
}