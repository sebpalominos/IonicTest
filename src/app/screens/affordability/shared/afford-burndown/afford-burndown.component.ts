import { Component, Output, EventEmitter } from '@angular/core';
import { ModalController, Events } from 'ionic-angular';
import * as moment from 'moment';

import { CreateAffordabilityComponent } from '../../create-afford/create-afford.component';
import { LineChartUtil } from '../../../../shared/line-chart/line-chart-util';

@Component({
  selector: 'afford-burndown',
  template: `
  <div padding-vertical>
    <ion-grid padding-horizontal>
      <ion-row align-items-center>
        <h2 ion-col>How are you doing</h2>
        <button ion-col col-auto ion-button icon-left clear color="dark" (click)="editClicked.emit()">
          <ion-icon name="create"></ion-icon> Edit
        </button>
      </ion-row>
    </ion-grid>
    <ion-card>
      <img src="assets/img/placeholder/burndown.png" alt="Burndown">
      <ion-card-content ion-grid>
        <ion-row>
          <ion-col text-center><strong>{{monthName}}</strong></ion-col>
          <ion-col text-center><opc-money>{{4000 | number:'1.2-2'}}</opc-money></ion-col>
          <ion-col text-center><opc-money>{{4600 | number:'1.2-2'}}</opc-money></ion-col>
        </ion-row>
      </ion-card-content>
    </ion-card>
  </div>
  `,
  host: { class: 'afford-burndown' }
})
export class AffordabilityBurndownComponent {
  @Output('onEdit') editClicked = new EventEmitter();
  monthName: string = moment().format('MMMM YYYY');
}