import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';
/* Cordova/Ionic Native */
import { Keychain } from '@ionic-native/keychain';
import { TouchID } from '@ionic-native/touch-id';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SafariViewController } from '@ionic-native/safari-view-controller';
import { EmailComposer } from '@ionic-native/email-composer';
/* Components */
import { ButtonRowComponent } from './button-row/button-row.component';
import { CategorisationBannerComponent } from './categorisation-banner/categorisation-banner.component';
import { CoverImageComponent } from './cover-image/cover-image.component';
import { IconComponent } from './opc-icon/opc-icon.component';
import { IconHeadingComponent } from './icon-heading/icon-heading.component';
import { InfoBarComponent } from './info-bar/info-bar.component';
import { CategoriserPadComponent } from './categoriser-pad/categoriser-pad.component';
import { CategoriserListComponent } from './categoriser-list/categoriser-list.component';
import { MenuProfileComponent } from './menu-profile/menu-profile.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { ProgressComponent } from './opc-progress/opc-progress.component';
import { PropertySummaryComponent } from './property-summary/property-summary.component';
import { PropertyFilterComponent } from './property-filter/property-filter.component';
import { HeroUnitComponent } from './hero-unit/hero-unit.component';
import { SearchOverlayComponent } from './search-overlay/search-overlay.component';
import { SliderComponent } from './slider/slider.component';
import { SliderCardComponent } from './slider-card/slider-card.component';
import { SpendingLimitComponent } from './spending-limit/spending-limit.component';
import { LoadingBarComponent } from './loading-bar/loading-bar.component';
import { EndpointSwitcherComponent } from './endpoint-switcher/endpoint-switcher.component';
import { IonNumericKeyboard } from './ion-numeric-keyboard/ion-numeric-keyboard';
import { IonWalkthrough } from './ion-walkthrough/ion-walkthrough';
import { GoogleMapComponent } from './google-map/google-map.component';
import { GoogleMapModalComponent } from './google-map-modal/google-map-modal.component';

/* Directives */
import { KeyboardAttachDirective } from './keyboard-attach/keyboard-attach.directive';
import { HeroEdgeDirective } from './hero-edge/hero-edge.directive';
import { MoneyDirective } from './money/money.directive';
import { NavbarFadeableDirective } from './navbar-fadeable/navbar-fadeable.directive';
/* Pipes */
// None

@NgModule({
  declarations: [ 
    ButtonRowComponent,
    CategorisationBannerComponent,
    CoverImageComponent,
    IconComponent,
    IconHeadingComponent,
    InfoBarComponent,
    SliderComponent,
    SliderCardComponent,
    CategoriserPadComponent,
    CategoriserListComponent,
    MenuProfileComponent,
    ProgressComponent,
    PropertySummaryComponent,
    PropertyFilterComponent,
    HeroUnitComponent,
    SearchOverlayComponent,
    PieChartComponent,
    LineChartComponent,
    SpendingLimitComponent,
    LoadingBarComponent,
    EndpointSwitcherComponent,
    IonNumericKeyboard,
    IonWalkthrough,
    KeyboardAttachDirective,
    HeroEdgeDirective,
    MoneyDirective,
    NavbarFadeableDirective,
    GoogleMapModalComponent,
    GoogleMapComponent
  ],
  providers: [
    Keyboard,
    Keychain,
    SplashScreen,
    StatusBar,
    TouchID,
    InAppBrowser,
    SafariViewController,
    EmailComposer,
  ],
  imports: [    
    CommonModule,
    IonicModule
  ],
  exports: [ 
    ButtonRowComponent,
    CategorisationBannerComponent,
    CoverImageComponent,
    IconComponent,
    IconHeadingComponent,
    InfoBarComponent,
    SliderComponent,
    SliderCardComponent,
    MenuProfileComponent,
    ProgressComponent,
    PropertySummaryComponent,
    PropertyFilterComponent,
    CategoriserPadComponent,
    CategoriserListComponent,
    HeroUnitComponent,
    SearchOverlayComponent,
    PieChartComponent,
    LineChartComponent,
    SpendingLimitComponent,
    LoadingBarComponent,
    EndpointSwitcherComponent,
    IonNumericKeyboard,
    IonWalkthrough,
    KeyboardAttachDirective,
    HeroEdgeDirective,
    MoneyDirective,
    NavbarFadeableDirective,
    GoogleMapComponent
  ],
  entryComponents: [
    PropertyFilterComponent,
    GoogleMapModalComponent
  ]
})
export class SharedModule {}