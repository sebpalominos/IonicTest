import { Component } from '@angular/core';
import { NavParams, Events } from 'ionic-angular';

// import { PropertyShape, Property } from '../shared/property.model';
import { PropertySearchComponent } from '../property-search/property-search.component';
import { PropertyShortlistComponent } from '../property-shortlist/property-shortlist.component';

@Component({
    selector: 'scr-property-goal',
    templateUrl: 'property-goal.html'
})
export class PropertyGoalComponent {
  screens: { [screenName: string]: any } = { 
    propertySearch: PropertySearchComponent,
    propertyShortlist: PropertyShortlistComponent
  };
  constructor(public events: Events){}
  ionViewWillLoad(){
    setTimeout(() => {
      // This will execute outside of current digest cycle (or whatever its called in Angular 2)
      this.events.publish('slider:init', ['slider-property-goal-insights']);
    }, 0); 
  }
}