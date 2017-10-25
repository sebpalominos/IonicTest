import { Component, Input } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

import { Category, CategoryShape } from '../category.model';
import { CategoryStats } from '../category-data-maps';
// import { CategoryComponent } from '../../category/category.component';
import { CategoryService } from '../../../../core/services/category/category.service';

@Component({
  selector: 'category-popup',
  templateUrl: 'category-popup.component.html',
  host: { class: 'category-popup' }
})
export class CategoryPopupComponent {
  category: Category;
  stats: CategoryStats;
  statsByMonthGroup: Array<{ label: string; value: number; trend: number; isPercentage: boolean; }>;
  activeMonthSpendDiff: { sign: number; value: number; };
  currentMonthSpendDiff: { sign: number; value: number; };  
  currentMonthProjectedSpendDiff: { sign: number; value: number; };  
  showLoadingError: boolean;
  constructor(
    protected params: NavParams,
    protected viewCtrl: ViewController,
    protected categoryService: CategoryService
  ) {}
  ngOnInit() {
    this.loadCategory();
  }
  view() {
    this.viewCtrl.dismiss(true);
  }
  close() {
    this.viewCtrl.dismiss();
  }
  loadCategory() {
    this.retrieveCategory().then(category => {
      this.category = category;
      return this.retrieveStats();
    }).then(stats => {
      this.stats = stats;
      this.statsByMonthGroup = [];
      if (!stats.isCurrentMonth) {
        if (stats.currentMonthDeltaPercent) {
          this.statsByMonthGroup.push({ 
            label: `compared to ${stats.activeMonthName} so far`, 
            // label: stats.activeMonthName, 
            value: stats.currentMonthDeltaPercent, 
            trend: stats.currentMonthDeltaTrend,
            isPercentage: true
          });
        }
        if (stats.currentMonthProjectedDeltaPercent) {
          this.statsByMonthGroup.push({ 
            label: `compared to projected end of ${stats.activeMonthName}`, 
            // label: stats.activeMonthName, 
            value: stats.currentMonthProjectedDeltaPercent, 
            trend: stats.currentMonthProjectedDeltaTrend,
            isPercentage: true
          });
        }
      }
      else {
        this.statsByMonthGroup.push({ 
          label: `vs ${stats.previousMonthName}`, 
          value: stats.previousMonthDeltaPercent, 
          trend: stats.previousMonthDeltaTrend,
          isPercentage: true
        });
      }
      if (stats.currentMonthDeltaPercent) {
        // has a stat for active vs current month
        let diff = stats.activeMonthSpend - stats.currentMonthSpend;
        this.currentMonthSpendDiff = { sign: Math.sign(diff), value: Math.abs(diff) };
      }
      if (stats.currentMonthProjectedDeltaPercent) {
        // has a stat for active vs current month projcted
        let diff = stats.activeMonthSpend - stats.projectedCurrentMonthSpend;
        this.currentMonthProjectedSpendDiff = { sign: Math.sign(diff), value: Math.abs(diff) };
      }
      if (stats.previousMonthDeltaPercent) {
        // Has a stat for active vs prev month
        let diff = stats.activeMonthSpend - stats.previousMonthSpend;
        this.activeMonthSpendDiff = { sign: Math.sign(diff), value: Math.abs(diff) };
      }
    }).catch(err => {
      console.error(err);
      this.showLoadingError = true;
    });
  }
  private retrieveCategory(): Promise<Category> {
    if (this.params.get('category')) {
      return Promise.resolve(this.params.get('category'));
    }
    else if (this.params.get('id')) {
      return this.categoryService.getCategory(this.params.get('id'));
    }
    else {
      return Promise.reject('CategoryPopup expected "category" or "id" as a parameter; not found.');
    }
  }
  private retrieveStats(): Promise<CategoryStats> {
    if (this.params.get('stats')) {
      return Promise.resolve(this.params.get('stats'));
    }
    else {
      let activeMonth = this.params.get('activeMonth') ? new Date(this.params.get('activeMonth')) : new Date();
      return this.categoryService.getCategoryStats(this.category.id, activeMonth);
    }
  }
}