import { Component } from '@angular/core';
import { NavController, ModalController, ToastController, Events } from 'ionic-angular';

import { HomeComponent } from '../../home/home.component';
import { HomePlaceholderComponent } from '../../home/home-placeholder/home-placeholder.component';
import { CreateGoalComponent } from '../../goal-centre/create-goal/create-goal.component';
import { LoginComponent } from '../../auth/login/login.component';
import { AuthModalComponent } from '../../auth/auth-modal/auth-modal.component';
import { ConnectionModalComponent } from '../../onboarding/connection-modal/connection-modal.component';
import { NotificationListComponent } from '../../notification-centre/notification-list/notification-list.component';
import { TransactionComponent } from '../../transactions/transaction/transaction.component';
import { TransactionsComponent } from '../../transactions/transactions.component';
import { AccountComponent } from '../../accounts/account/account.component';
import { AccountsComponent } from '../../accounts/accounts.component';
import { CategoriesComponent } from '../../categories/categories.component';
import { CategoryComponent } from '../../categories/category/category.component';
import { PropertyGoalComponent } from '../../property-centre/property-goal/property-goal.component';
import { PropertyResultsComponent } from '../../property-centre/property-results/property-results.component';
import { PropertyComponent } from '../../property-centre/property/property.component';
import { PropertyCentreComponent } from '../../property-centre/property-centre.component';
import { GoalCentreComponent } from '../../goal-centre/goal-centre.component';
import { AffordabilityComponent } from '../../affordability/affordability.component';
import { CreateAffordabilitySurplusTargetComponent } from '../../affordability/create-afford-surplus-target/create-afford-surplus-target.component';
import { CreateAffordabilityCompleteComponent } from '../../affordability/create-afford-complete/create-afford-complete.component';
import { AffordabilityUtils } from '../../affordability/shared/affordability-utils';
import { UserProfileComponent } from '../../user/user-profile/user-profile.component';
import { CategorisationQueueComponent } from '../../notification-centre/categorisation-queue/categorisation-queue.component';

import { PropertyService } from '../../../core/services/property/property.service';
import { TelemetryService } from '../../../core/services/telemetry/telemetry.service';

@Component({
  selector: 'opc-dev-util',
  styles: [`
    div { background: darkorange; }
  `],
  template: `
    <div class="opc-info-bar opc-info-bar-info">UNDER DEVELOPMENT</div>
    <div><a href="#" onclick="window.reload()">RELOAD</a></div>
  `
})
export class DevelopmentStartPageComponent {
  constructor(
    protected navCtrl: NavController, 
    protected modalCtrl: ModalController,
    protected toastCtrl: ToastController,
    protected events: Events,
    protected propertyService: PropertyService,
    protected telemetryService: TelemetryService
  ) {}
  ngOnInit() {
    // this.propertyService.getProperty(2968469).then(targetProperty => {
      // let surplusTargetParams: AffordabilityUtils.SurplusTargetParams = { targetProperty };
      // this.navCtrl.setRoot(CreateAffordabilitySurplusTargetComponent, { surplusTargetParams });
    // });
    // this.toastCtrl.create({
    //   message: 'TEST ONLY',
    //   showCloseButton: true,
    //   closeButtonText: 'abcd',
    //   cssClass: 'opc-toasty',
    //   position: 'top'
    // }).present();
    this.navCtrl.setRoot(HomeComponent)
    .then(() => {
      // this.navCtrl.push(CategoryComponent, { id: 10 });
      // this.navCtrl.push(AccountsComponent);
      // this.modalCtrl.create(AuthModalComponent).present();
      // this.navCtrl.push(PropertyComponent, { id: 22 });
      // this.navCtrl.push(GoalWorkspaceComponent, {});
      // this.modalCtrl.create(ConnectionModalComponent).present();
      // this.navCtrl.push(TransactionComponent, {id: '6a15ea51-0da2-4e97-9d32-a055e579130d'});
      // this.navCtrl.push(PropertyGoalComponent);
      // this.navCtrl.push(CategoryComponent, { id: 1 });
      // this.navCtrl.push(TransactionsComponent, { accountId: 3402 });
      // this.navCtrl.setRoot(AccountsComponent);
      // this.navCtrl.setRoot(AccountListComponent).then(() => {
      //   return this.navCtrl.push(TransactionsComponent);
      // }).then(() => {
      //   this.navCtrl.push(TransactionComponent, { id: 'M08GK343426IX50IA3' });
      // });
    })
    .catch((err)=>{
      console.log('development-start-page',err);
    });
  }
}