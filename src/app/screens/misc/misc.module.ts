import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';
import { SharedModule } from '../../shared/shared.module';

import { AppInfoComponent } from './app-info/app-info.component';
import { ErrorSplashComponent } from './error-splash/error-splash.component';
import { DevelopmentStartPageComponent } from './development-start-page/development-start-page.component';
import { DevelopmentSettingsComponent } from './development-settings/development-settings.component';

@NgModule({
  declarations: [
    AppInfoComponent,
    ErrorSplashComponent,
    DevelopmentSettingsComponent,
    DevelopmentStartPageComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    SharedModule
  ],
  exports: [
    AppInfoComponent,
    ErrorSplashComponent,
    DevelopmentSettingsComponent,
    DevelopmentStartPageComponent
  ],
  entryComponents: [
    AppInfoComponent,
    DevelopmentSettingsComponent,
    DevelopmentStartPageComponent 
  ]
})
export class MiscModule {}