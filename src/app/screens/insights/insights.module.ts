import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { SharedModule } from '../../shared/shared.module';

import { SuggestionComponent } from './suggestion/suggestion.component';

@NgModule({
  declarations: [ 
    SuggestionComponent
  ],
  imports: [
    IonicModule,
    SharedModule
  ],
  exports: [ 
    SuggestionComponent
  ],
  entryComponents: [
    SuggestionComponent
  ],
})
export class InsightsModule {}
