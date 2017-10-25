import { Component, Input, SimpleChanges } from '@angular/core';

import { TransactionMetric } from '../../screens/transactions/shared/transaction-metric.model';
import { CategorisationQueueComponent } from '../../screens/notification-centre/categorisation-queue/categorisation-queue.component';
import { TransactionService } from '../../core/services/transaction/transaction.service';

@Component({
  selector: 'categorisation-banner',
  template: `
    <ion-list no-margin no-border [ngClass]="{ 'queue-complete': overallMetric?.percentage <= 0 }" >
      <ion-item ion-text color="light" [hidden]="!overallMetric || overallMetric?.percentage > 0">
        <ion-icon item-end name="checkmark-circle"></ion-icon>
        Categorisation is up to date!
      </ion-item>
      <button ion-item detail-none [navPush]="categorisationQueue" *ngIf="overallMetric?.percentage > 0">
        <h2>Categorisation is {{overallMetric?.percentage}}% complete</h2>
        <p>Tap here to view remaining</p>
        <opc-icon set="business" name="price-tag-1" size="lg" item-end></opc-icon>
        <!--<ion-icon item-end color="light" name="share-alt"></ion-icon>-->
      </button>
    </ion-list>
  `,
  host: {
    class: 'categorisation-banner'
  }
})
export class CategorisationBannerComponent {
  overallMetric: TransactionMetric;
  categorisationQueue: any = CategorisationQueueComponent;
  constructor(
    protected transactionService: TransactionService,
  ) {}
  ngOnInit() {
    this.transactionService.getCategorisationMetric().then(metric => {
      this.overallMetric = metric;
    }).catch(err => {
      console.error(err);
    });
  }
}