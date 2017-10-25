import { Component, ViewChild, Renderer, SimpleChanges } from '@angular/core';
import { Content, NavController, ModalController, LoadingController, Events } from 'ionic-angular';
import { CompleterService, CompleterData } from 'ng2-completer';

import { UserSummary } from '../user/shared/user-summary.model';
import { UserService } from '../../core/services/user/user.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { VersionService } from '../../core/services/version/version.service';

// Quick links from bottom of page
import { NotificationListComponent } from '../notification-centre/notification-list/notification-list.component';
import { AccountComponent } from '../accounts/account/account.component';
import { AccountsComponent } from '../accounts/accounts.component';
import { CategoriesComponent } from '../categories/categories.component';
import { GoalCentreComponent } from '../goal-centre/goal-centre.component';
import { EditGoalComponent } from '../goal-centre/edit-goal/edit-goal.component';
import { CreateGoalComponent } from '../goal-centre/create-goal/create-goal.component';
import { PropertyCentreComponent } from '../property-centre/property-centre.component';
import { PropertyResultsComponent } from '../property-centre/property-results/property-results.component';
import { HeroUnitComponent } from '../../shared/hero-unit/hero-unit.component';
import { SearchOverlayComponent } from '../../shared/search-overlay/search-overlay.component';
import { SuggestionComponent } from '../insights/suggestion/suggestion.component';
import { TransactionsComponent } from '../transactions/transactions.component';
import { AffordabilityComponent } from '../affordability/affordability.component';
import { ConnectionModalComponent } from '../onboarding/connection-modal/connection-modal.component';

@Component({
  selector: 'scr-home',
  templateUrl: 'home.component.html',
  host: { class: 'opc-home' }
})
export class HomeComponent {
  @ViewChild(Content) content: Content;
  @ViewChild('searchOverlay') searchOverlay: SearchOverlayComponent;
  screens: { [screenName: string]: any } = {
    // account: AccountComponent,
    // category: CategoryComponent,
    suggestion: SuggestionComponent,
    account: AccountComponent,
    accountList: AccountsComponent,
    goalList: GoalCentreComponent,
    categoryList: CategoriesComponent,
    notificationList: NotificationListComponent,
    propertyCentre: PropertyCentreComponent,
    transactionList: TransactionsComponent,
    editGoal: EditGoalComponent,
    createGoal: CreateGoalComponent,
    propertyResults: PropertyResultsComponent,
    affordability: AffordabilityComponent,
    connectAccount: ConnectionModalComponent
  };
  summary: UserSummary;
  searchInput: string;
  scrollunder: HeroUnitComponent;
  showSearch: boolean;
  constructor(
    protected events: Events,
    protected navCtrl: NavController, 
    protected modalCtrl: ModalController, 
    protected loadingCtrl: LoadingController,
    protected userService: UserService,
    protected authService: AuthService,
    protected versionService: VersionService
  ) {}
  ionViewCanEnter() {
    this.authService.status();
  }
  ionViewDidLoad() {
    this.showSearch = this.versionService.isCapabilityEnabled('CAP_UNIVSEARCH');
    // this.userService.getSummary().then((summary: UserSummary) => {
    //   this.summary = summary;
    // });
    this.searchOverlay.reset();
  }
  ionViewDidEnter() {
    // Refresh all sliders
    this.searchInput = '';
    this.events.publish('slider:reinit');
    this.events.publish('init:landed');
  }
  ionViewDidLeave(){
    this.searchInput = '';
    this.searchOverlay.close();
  }
  shortcutToAffordability() {
    this.navCtrl.push(this.screens['affordability']);
  }
}
