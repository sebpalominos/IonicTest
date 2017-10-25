import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SharedModule } from '../../shared/shared.module';
import { PropertiesModule } from '../property-centre/property-centre.module';

import { HomeComponent } from './home.component';
import { HomePlaceholderComponent } from './home-placeholder/home-placeholder.component';
import { FirstRunComponent } from './first-run/first-run.component';
import { HomeSummaryComponent } from './shared/home-summary/home-summary.component';
import { HomeAccountsComponent } from './shared/home-accounts/home-accounts.component';
import { HomeGoalsComponent } from './shared/home-goals/home-goals.component';
import { HomeSuggestionsComponent } from './shared/home-suggestions/home-suggestions.component';
import { HomeShortcutsComponent } from './shared/home-shortcuts/home-shortcuts.component';

@NgModule({
  declarations: [ 
    HomeComponent,
    HomeSummaryComponent,
    HomeAccountsComponent,
    HomeGoalsComponent,    
    HomeSuggestionsComponent,
    HomeShortcutsComponent,
    HomePlaceholderComponent,
    FirstRunComponent
  ],
  imports: [
    IonicModule,
    SharedModule,
    PropertiesModule
  ],
  exports: [ 
    HomeComponent,
    HomeSummaryComponent,
    HomeAccountsComponent,
    HomeGoalsComponent,
    HomeSuggestionsComponent,
    HomeShortcutsComponent,
    HomePlaceholderComponent,
    FirstRunComponent
  ],
  entryComponents: [
    HomeComponent,
    HomePlaceholderComponent
  ],
})
export class HomeModule {}
