import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

import { AuthService } from '../auth/auth.service';
import { AccountService } from '../account/account.service';
import { CategoryService } from '../category/category.service';
import { SearchResult } from '../../data/search/search-types';
import { Account } from '../../../screens/accounts/shared/account.model';
import { Category } from '../../../screens/categories/shared/category.model';
import { CategoryBreakdownInfo } from '../../../screens/categories/shared/category-data-maps';

@Injectable()
export class SearchService {
  prefetchedData: {
    accounts: Account[];
    categories: CategoryBreakdownInfo[];
  };
  prefetchReady: Promise<any>;
  constructor(
    protected accountService: AccountService,
    protected categoryService: CategoryService,
    protected authService: AuthService,
    protected events: Events
  ) { this.init() }
  /**
   * Retrieves relevant results from prefetched data
   * @desc Go through prefetched accounts and categories. For each, determine
   * whether they have any match to the query text, and if so, what match 
   * coefficient would you assign to each result. The coefficient value must 
   * be relevant across all search result item types, i.e. a 0.8 account is better than 
   * a 0.77 category which in turn is better than a 0.72 account.
   * @param {string} queryText 
   * @returns {Promise<SearchResult[]>} 
   * @memberof SearchService
   */
  search(queryText: string): Promise<SearchResult[]> {
    // A single function to determine matchedness from the source string
    return this.prefetchReady.then(() => {
      let matchedAccounts: SearchResult[] = this.prefetchedData.accounts.map(account => {
        if (account.isDisconnected || account.isSyncing) {
          return null;
        }
        else {
          let matchCoefficient = this.determineMatchCoefficient(queryText, account.preferredName(), 1.05);
          return matchCoefficient >= 0 ? {
            nameLabel: account.preferredName(),
            typeLabel: 'Account',
            screen: 'account',
            params: { account },
            icon: { type: 'opc-icon', name: 'id-card-4', set: 'essential' },
            matchCoefficient: matchCoefficient
          } as SearchResult : null;
        }
      }).filter(searchResult => searchResult != null);
      let matchedCategories: SearchResult[] = this.prefetchedData.categories.map(breakdown => {
        let matchCoefficient = this.determineMatchCoefficient(queryText, breakdown.category.name);
        return matchCoefficient >= 0
          ? <SearchResult>{
            nameLabel: breakdown.category.name,
            typeLabel: 'Category',
            screen: 'category',
            params: { category: breakdown.category },
            icon: { type: 'opc-icon', name: 'price-tag-3', set: 'business' },
            matchCoefficient: matchCoefficient
          } : null;
      }).filter(searchResult => searchResult != null);
      return (Array.prototype.concat(matchedAccounts, matchedCategories) as SearchResult[]).sort((a, b) => {
        return Math.sign(a.matchCoefficient - b.matchCoefficient);      // apparently this is the equivalent of the spaceship <=>
      });
    });
  }
  private init() {
    this.prefetch();
    this.listenEvents();
  }
  private prefetch() {
    this.prefetchReady = preflight.call(this).then(() => {
      console.log('%cSearch prefetch preflight checks succeeded', "color: aquamarine");
      Promise.all([
        this.accountService.getAccounts(),
        this.categoryService.getTopLevelCategoryListSummary(),
      ]).then(results => {
        this.prefetchedData = {
          accounts: results[0],
          categories: results[1]
        };
      }).catch(err => {
        this.prefetchedData = {
          accounts: [],
          categories: []
        };
        console.error(err);
      });
    }).catch(err => {
      console.warn('%cSearch prefetch preflight checks failed', "color: firebrick");
    });
    function preflight(): Promise<any> {
      return this.authService.status().then(isAuthed => {
        // Defer resolution until authentication occurs
        return isAuthed 
          ? Promise.resolve() 
          : new Promise((resolve, reject) => {
            this.events.subscribe('auth:credentialsReady', () => resolve());
          });
      });
    }
  }
  private determineMatchCoefficient(query: string, source: string, modifier: number = 1): number {
    /// Assumptions
    /// That 5 letters matched anywhere is rock solid
    /// That 4 letters matched at the beginning is rock solid
    /// Determine word boundaries in source, and split there
    /// Assume no word boundaries in the query... we'll just concatenate it, heheheh
    let punctuationRegex = /[\s.,\/#!$%\^&\*;:{}=\-_`~()]+/g;
    let sourceSplit = source.toLowerCase().split(punctuationRegex);
    let sourceConcat = source.toLowerCase().replace(punctuationRegex, '');
    let queryConcat = query.toLowerCase().replace(punctuationRegex, '');
    if (sourceConcat.includes(queryConcat)) {
      // What's the base score depending on amount of letters matched
      let baseScore = Math.min(1, queryConcat.length * .2);
      // Try matching it to the beginning or end of any of the tokens. Bonus points if it does. 
      let finalScore = sourceSplit.reduce((prev, token) => {
        let isEdge = token.startsWith(queryConcat) || token.endsWith(queryConcat);
        return isEdge ? prev * 1.25 : prev;
      }, baseScore);
      return finalScore;
    }
    else {
      return -1;
    }
  }
  private listenEvents() {
    this.events.subscribe('accounts:removedAccount', accountId => {
      if (this.prefetchedData && this.prefetchedData.accounts) {
        let accountIndex = this.prefetchedData.accounts.findIndex(account => account.id === accountId);
        if (accountIndex >= 0) {
          this.prefetchedData.accounts.splice(accountIndex, 1);
        }
      }
    });
  }
}