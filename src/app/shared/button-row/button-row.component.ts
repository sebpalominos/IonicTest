import { Component, Input } from '@angular/core';

/**
 * @name ButtonRow
 * @desc 
 * Displays a button-height area containing buttons and an optional side 
 * caption. Should be used within a container such as `ion-card`. 
 * To display buttons snapped to the right, add the attribute `right` to the 
 * button element, otherwise defaults to the left. 
 * @export
 * @class ButtonRowComponent
 */
@Component({
  selector: 'button-row',
  template: `
    <div class="button-row-left"><ng-content select="button:not([item-end])"></ng-content></div>
    <div class="button-row-caption">
      <ng-content select="a,span,em,strong"></ng-content>
    </div>
    <div class="button-row-right"><ng-content select="button[item-end]"></ng-content></div>
  `,
  host: {
    class: 'opc-button-row'
  }
})
export class ButtonRowComponent {
  // @Input() side: string;
}