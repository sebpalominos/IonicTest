import { Component, Input } from '@angular/core';
import { ModalController, Events } from 'ionic-angular';

import { AffordabilityGoal, AffordabilitySnapshot } from '../affordability-goal.model';
import { CreateAffordabilityComponent } from '../../create-afford/create-afford.component';
import { PropertyUtils } from '../../../property-centre/shared/property-utils';
import { PropertyService } from '../../../../core/services/property/property.service';

type SnapshotDisplay = {
  label: string,
  snapshot: AffordabilitySnapshot
};

@Component({
  selector: 'afford-time',
  templateUrl: 'afford-time.component.html',
  host: {
    class: 'afford-time'
  }
})
export class AffordabilityTimeComponent {
  @Input() goal: AffordabilityGoal;
  currentSurplusDiffPercent: number;
  currentSurplusDiffColor: string;
  snapshotDisplays: SnapshotDisplay[];
  moneyShortener = PropertyUtils.moneyShortener;
  constructor(
    protected modalCtrl: ModalController,
    protected events: Events
  ) {}
  ngOnInit() {
    this.snapshotDisplays = [];
    if (this.goal.overview.currentDaySnapshot) {
      this.snapshotDisplays.push({ label: 'Based on your current spending', snapshot: this.goal.overview.currentDaySnapshot });
    }
    if (this.goal.overview.surplusBasedSnapshot) {
      this.snapshotDisplays.push({ label: 'Based on your surplus target', snapshot: this.goal.overview.surplusBasedSnapshot });
    }
    if (this.goal.overview.currentSurplus) {
      let diff = this.goal.overview.currentSurplus.projectedSurplus - this.goal.overview.currentSurplus.targetSurplus;
      let diffPercent = Math.round(diff / this.goal.overview.currentSurplus.targetSurplus * 100);
      this.currentSurplusDiffPercent = diffPercent;
      this.currentSurplusDiffColor = diffPercent >= 0 ? 'tl-green' : 'tl-red';
    }
    setTimeout(() => {
      this.events.publish('slider:init', ['slider-time-to-affordability']);
    }, 0);
  }
}