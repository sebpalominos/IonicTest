import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AccountsModule } from './screens/accounts/accounts.module';
import { AffordabilityModule } from './screens/affordability/affordability.module';
import { AuthModule } from './screens/auth/auth.module';
import { CategoriesModule } from './screens/categories/categories.module';
import { GoalsModule } from './screens/goal-centre/goal-centre.module';
import { GoalWorkspaceModule } from './screens/goal-workspace/goal-workspace.module';
import { HomeModule } from './screens/home/home.module';
import { InsightsModule } from './screens/insights/insights.module';
import { MiscModule } from './screens/misc/misc.module';
import { NotificationsModule } from './screens/notification-centre/notifications.module';
import { OnboardingModule } from './screens/onboarding/onboarding.module';
import { SharedModule } from './shared/shared.module';
import { PropertiesModule } from './screens/property-centre/property-centre.module';
import { ServicesModule } from './core/services/services.module';
import { TransactionsModule } from './screens/transactions/transactions.module';
import { UserModule } from './screens/user/user.module';
import { Pro } from '@ionic/pro';
import 'intl';
import 'intl/locale-data/jsonp/en';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

const IonicPro = Pro.init('8267bb10', {
  appVersion: "0.16.2"
});

export class MyErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    IonicPro.monitoring.handleNewError(err);
  }
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(AppComponent, { 
      env: 'prod',
      inAppBrowserRegistrationUrl: 'https://portal.opicagroup.com.au/register.php?mode=inappbrowser',
      apiEndpointBaseUrl: 'https://app.opicagroup.com.au/api/',
    }),
    IonicStorageModule.forRoot({
      name: 'insightslocal',
      driverOrder: ['sqlite', 'indexeddb', 'websql'],
    }),
    AccountsModule,
    AffordabilityModule,
    AuthModule,
    CategoriesModule,
    GoalsModule,
    GoalWorkspaceModule,
    HomeModule,
    InsightsModule,
    MiscModule,
    NotificationsModule,
    OnboardingModule,
    SharedModule,
    PropertiesModule,
    ServicesModule,
    TransactionsModule,
    UserModule
  ],
  bootstrap: [
    IonicApp
  ],
  entryComponents: [
    AppComponent
  ],
  providers: [{provide: ErrorHandler, useClass: MyErrorHandler }]
})
export class AppModule {}
