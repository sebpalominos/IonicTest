import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'loading-bar',
  template: `
    <div class="lb-outer" [ngClass]="{ active: active }">
      <div class="lb-inner" (input)="contentChanged($event)">
        <ion-spinner name="crescent"></ion-spinner>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  host: {
    class: 'loading-bar'
  }
})
export class LoadingBarComponent {
  @Input() active: boolean;
  @Input() color: string;      // TBC to implement
  // @Input() duration: number = 350;    // milliseconds
}