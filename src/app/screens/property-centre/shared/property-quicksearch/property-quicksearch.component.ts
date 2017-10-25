import { Component, Output, EventEmitter } from '@angular/core';
import { NavParams, NavController, LoadingController } from 'ionic-angular';

import { PropertyGoalComponent } from '../../property-goal/property-goal.component';
import { PropertyResultsComponent } from '../../property-results/property-results.component';
import { PropertyShortlistComponent } from '../../property-shortlist/property-shortlist.component';

@Component({
  selector: 'property-quicksearch',
  templateUrl: 'property-quicksearch.html',
  host: {
    class: 'property-quicksearch'
  }
})
export class PropertyQuicksearchComponent {
  @Output() searchTermSubmitted = new EventEmitter<string>();
  quicksearchTerm: string;
  screens: { [screenName: string]: any } = { 
    propertyGoal: PropertyGoalComponent,
    propertyResults: PropertyResultsComponent,
    propertyShortlist: PropertyShortlistComponent
  };
  constructor(
    public navCtrl: NavController,
  ) {}
}