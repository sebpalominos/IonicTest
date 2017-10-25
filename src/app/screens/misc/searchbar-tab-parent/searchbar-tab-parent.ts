import { ViewChild } from '@angular/core';
import { NavParams, Searchbar, Tabs } from 'ionic-angular';

export abstract class SearchbarTabParent {
  @ViewChild('searchbar') searchbar: Searchbar; 
  tabs: Tabs;     // Expect this to be overriden
  showSearchBar: boolean;
  constructor(
    protected params: NavParams, 
  ) {}
  ionViewDidEnter(){
    this.hideSearch();
    // Jump to the appropriate tab, if tabIndex is provided
    if (this.tabs && this.params.get('tabIndex') !== undefined) {
      let tabIndex = parseInt(this.params.get('tabIndex'));
      if (tabIndex < this.tabs.length()) {
        this.tabs.select(tabIndex);
      }
    }
  }
  ionViewDidLeave(){
    this.hideSearch();
  }
  hideSearch(){
    this.showSearchBar = false;
  }
  showSearch(){
    this.showSearchBar = true;
    setTimeout(() => this.searchbar.setFocus(), 0);
  }
}