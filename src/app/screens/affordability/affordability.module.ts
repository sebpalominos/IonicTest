import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IonicModule } from 'ionic-angular';
import { GoalWorkspaceModule } from '../goal-workspace/goal-workspace.module';
import { SharedModule } from '../../shared/shared.module';

import { AffordabilityComponent } from './affordability.component';
import { AffordabilityOverviewComponent } from './afford-overview/afford-overview.component';
import { CreateAffordabilityComponent } from './create-afford/create-afford.component';
import { CreateAffordabilityCompleteComponent } from './create-afford-complete/create-afford-complete.component';
import { CreateAffordabilityIntroComponent } from './create-afford-intro/create-afford-intro.component';
import { CreateAffordabilityMortgageComponent } from './create-afford-mortgage/create-afford-mortgage.component';
import { CreateAffordabilityPropertyComponent } from './create-afford-property/create-afford-property.component';
import { CreateAffordabilityPropertySelectorComponent } from './create-afford-property-selector/create-afford-property-selector.component';
import { CreateAffordabilitySetPropertyPriceComponent } from './create-afford-set-property-price/create-afford-set-property-price.component';
import { CreateAffordabilitySetMortgageDetailsComponent } from './create-afford-set-mortgage-details/create-afford-set-mortgage-details.component';
import { CreateAffordabilityHubComponent } from './create-afford-hub/create-afford-hub.component';
import { CreateAffordabilityHubPlaceholderComponent } from './create-afford-hub-placeholder/create-afford-hub-placeholder.component';
import { CreateAffordabilitySurplusLimitsComponent } from './create-afford-surplus-limits/create-afford-surplus-limits.component';
import { CreateAffordabilitySurplusDeclineComponent } from './create-afford-surplus-decline/create-afford-surplus-decline.component';
import { CreateAffordabilitySurplusTargetComponent } from './create-afford-surplus-target/create-afford-surplus-target.component';
import { CreateAffordabilitySurplusHelpComponent } from './create-afford-surplus-help/create-afford-surplus-help.component';
import { AffordabilityLoadingComponent } from './shared/afford-loading/afford-loading.component';
import { AffordabilityBeginComponent } from './shared/afford-begin/afford-begin.component';
import { AffordabilityTeaserComponent } from './shared/afford-teaser/afford-teaser.component';
import { AffordabilityPropertyHeroComponent } from './shared/afford-property-hero/afford-property-hero.component';
import { AffordabilityTimeComponent } from './shared/afford-time/afford-time.component';
import { AffordabilityTrackingComponent } from './shared/afford-tracking/afford-tracking.component';
import { AffordabilityBurndownComponent } from './shared/afford-burndown/afford-burndown.component';

@NgModule({
  declarations: [ 
    AffordabilityComponent,
    AffordabilityOverviewComponent,
    AffordabilityLoadingComponent,
    AffordabilityBeginComponent,
    AffordabilityTeaserComponent,
    AffordabilityPropertyHeroComponent,
    AffordabilityTimeComponent,
    AffordabilityTrackingComponent,
    AffordabilityBurndownComponent,
    CreateAffordabilityComponent,
    CreateAffordabilityCompleteComponent,
    CreateAffordabilityMortgageComponent,
    CreateAffordabilityPropertyComponent,
    CreateAffordabilityPropertySelectorComponent,
    CreateAffordabilitySetPropertyPriceComponent,
    CreateAffordabilitySetMortgageDetailsComponent,
    CreateAffordabilityIntroComponent,
    CreateAffordabilityHubComponent,
    CreateAffordabilityHubPlaceholderComponent,
    CreateAffordabilitySurplusLimitsComponent,
    CreateAffordabilitySurplusDeclineComponent,
    CreateAffordabilitySurplusTargetComponent,
    CreateAffordabilitySurplusHelpComponent
  ],
  providers: [
    DatePipe
  ],
  imports: [
    IonicModule,
    GoalWorkspaceModule,
    SharedModule
  ],
  exports: [ 
    AffordabilityComponent,
    AffordabilityOverviewComponent,
    AffordabilityLoadingComponent,
    AffordabilityBeginComponent,
    AffordabilityTeaserComponent,
    AffordabilityPropertyHeroComponent,
    AffordabilityTimeComponent,
    AffordabilityTrackingComponent,
    AffordabilityBurndownComponent,    
    CreateAffordabilityComponent,
    CreateAffordabilityCompleteComponent,
    CreateAffordabilityMortgageComponent,
    CreateAffordabilityPropertyComponent,
    CreateAffordabilityPropertySelectorComponent,
    CreateAffordabilitySetPropertyPriceComponent,
    CreateAffordabilitySetMortgageDetailsComponent,
    CreateAffordabilityIntroComponent,
    CreateAffordabilityHubComponent,
    CreateAffordabilityHubPlaceholderComponent,
    CreateAffordabilitySurplusLimitsComponent,
    CreateAffordabilitySurplusDeclineComponent,
    CreateAffordabilitySurplusTargetComponent,
    CreateAffordabilitySurplusHelpComponent
  ],
  entryComponents: [ 
    AffordabilityComponent,
    AffordabilityOverviewComponent,
    CreateAffordabilityComponent,
    CreateAffordabilityCompleteComponent,
    CreateAffordabilityIntroComponent,
    CreateAffordabilityMortgageComponent,
    CreateAffordabilityPropertyComponent,
    CreateAffordabilityPropertySelectorComponent,
    CreateAffordabilitySetPropertyPriceComponent,
    CreateAffordabilitySetMortgageDetailsComponent,
    CreateAffordabilityHubComponent,
    CreateAffordabilityHubPlaceholderComponent,
    CreateAffordabilitySurplusLimitsComponent,
    CreateAffordabilitySurplusDeclineComponent,
    CreateAffordabilitySurplusTargetComponent,
    CreateAffordabilitySurplusHelpComponent
  ]
})
export class AffordabilityModule {}
