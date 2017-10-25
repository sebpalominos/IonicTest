import { Component, Input, SimpleChanges } from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';
import { NavController, Events, Searchbar } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';

import { SearchResult, SearchNavigableScreens } from '../../core/data/search/search-types';
import { SearchService } from '../../core/services/search/search.service';

import { NotificationListComponent } from '../../screens/notification-centre/notification-list/notification-list.component';
import { AccountComponent } from '../../screens/accounts/account/account.component';
import { AccountsComponent } from '../../screens/accounts/accounts.component';
import { CategoryComponent } from '../../screens/categories/category/category.component';
import { CategoriesComponent } from '../../screens/categories/categories.component';
import { GoalCentreComponent } from '../../screens/goal-centre/goal-centre.component';
import { GoalComponent } from '../../screens/goal-centre/goal/goal.component';
import { PropertyCentreComponent } from '../../screens/property-centre/property-centre.component';
import { SuggestionComponent } from '../../screens/insights/suggestion/suggestion.component';
import { TransactionsComponent } from '../../screens/transactions/transactions.component';
import { UserProfileComponent } from '../../screens/user/user-profile/user-profile.component';

@Component({
  selector: 'search-overlay',
  templateUrl: 'search-overlay.component.html',
  host: { class: 'search-overlay' }
})
export class SearchOverlayComponent {
  @Input('searchInput') queryText: string;
  @Input('searchbar') searchbar: Searchbar;
  results: SearchResult[];
  showOverlay: boolean;
  searchResultsWrapperStyles: any;
  screens: SearchNavigableScreens = {
    category: CategoryComponent,
    suggestion: SuggestionComponent,
    account: AccountComponent,
    accountList: AccountsComponent,
    profile: UserProfileComponent,
    goalCentre: GoalCentreComponent,
    goal: GoalComponent,
    categoryList: CategoriesComponent,
    notificationList: NotificationListComponent,
    propertyCentre: PropertyCentreComponent,
    transactionList: TransactionsComponent
  };
  constructor(
    private keyboard: Keyboard,
    protected navCtrl: NavController,
    protected events: Events,
    protected searchService: SearchService
  ) {}
  ngOnInit() {
    this.reset();
    this.keyboard.hideKeyboardAccessoryBar(true);
    this.keyboard.onKeyboardShow().subscribe(event => {
      this.searchResultsWrapperStyles = { 'margin-bottom': `${event.keyboardHeight}px` };
    });
    this.keyboard.onKeyboardHide().subscribe(() => {
      this.searchResultsWrapperStyles = {};
    });
  }
  selectResult(result: SearchResult) {
    this.keyboard.close();
    this.navCtrl.push(this.screens[result.screen], result.params).then(() => {
      this.reset();
    }).catch(err => {
      this.events.publish('version:accessRestricted', err);
    });
  }
  search(queryText: string = this.queryText): Promise<boolean> {
    return this.searchService.search(queryText).then(results => {
      this.results = results;
      return results.length > 0;
    });
  }
  handleAction(event: any) {
    // ionBlur or ionFocus
    let hasResults = this.results && this.results.length !== 0;
    let hasQueryText = this.queryText && this.queryText.length !== 0;
    if (event instanceof FocusEvent) {
      if (event.type === 'blur' && hasQueryText) {
        this.showOverlay = hasResults;
        if (hasResults) {
          this.searchbar.setFocus();    // Keep keyboard up 
        }
      }
      else if (event.type === 'focus') {
        this.showOverlay = hasResults || hasQueryText;
        // this.reset();
      }
    }
    // ionText
    if (event instanceof Event) {
      if (event.type === 'input') {
        if (hasQueryText) {
          this.search(this.queryText).then(hasResults => {
            this.showOverlay = true;
          });
        }
        else {
          this.reset();
        }
      }
    }
  }
  backdropAction() {
    let hasQueryText = this.queryText && this.queryText.length !== 0;
    if (!hasQueryText) {
      this.close();
    }
  }
  touchEndAction(event: any) {
    event.preventDefault();
    let hasResults = this.results && this.results.length !== 0;
    if (hasResults) {
      this.searchbar.setFocus();    // Keep keyboard up
    }
  }
  /** Make the overlay go away but retain data */
  close() {
    this.showOverlay = false;
  }
  /**
   * Wipe search term and search results. Intended for internal use only. 
   * Trigger a reset through one of the handled actions
   * @memberof SearchOverlayComponent
   */
  reset() {
    this.queryText = '';
    this.results = [];
    this.showOverlay = false;    
  }
}