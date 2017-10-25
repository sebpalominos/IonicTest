import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { AffordabilityModule } from '../affordability/affordability.module';
import { SharedModule } from '../../shared/shared.module';

import { PropertyCentreComponent } from './property-centre.component';
import { PropertyGoalComponent } from './property-goal/property-goal.component';
import { PropertyNextComponent } from './property-next/property-next.component';
import { PropertyQuicksearchComponent } from './shared/property-quicksearch/property-quicksearch.component';
import { PropertyResultsComponent } from './property-results/property-results.component';
import { PropertySearchComponent } from './property-search/property-search.component';
import { PropertyShortlistComponent } from './property-shortlist/property-shortlist.component';
import { PropertyComponent } from './property/property.component';
// import { CategoryService } from './shared/category.service';

@NgModule({
  declarations: [ 
    PropertyCentreComponent,
    PropertyGoalComponent,
    PropertyNextComponent,
    PropertyQuicksearchComponent,
    PropertySearchComponent, 
    PropertyResultsComponent,
    PropertyShortlistComponent, 
    PropertyComponent
  ],
  imports: [
    IonicModule,
    SharedModule,
    AffordabilityModule
  ],
  exports: [ 
    PropertyCentreComponent,
    PropertyGoalComponent,
    PropertyNextComponent,   
    PropertyQuicksearchComponent,
    PropertyResultsComponent, 
    PropertySearchComponent, 
    PropertyGoalComponent,
    PropertyShortlistComponent, 
    PropertyComponent
  ],
  entryComponents: [ 
    PropertyCentreComponent,
    PropertyGoalComponent,
    PropertyNextComponent, 
    PropertyResultsComponent,
    PropertySearchComponent, 
    PropertyShortlistComponent, 
    PropertyComponent
  ]
})
export class PropertiesModule {}
