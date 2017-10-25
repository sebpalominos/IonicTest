import { Component, Input, SimpleChanges } from '@angular/core';

import { OpiconSize } from './opc-icon-type';

@Component({
  selector: 'opc-progress',
  template: `
    <div class="progress-bar-caption" *ngIf="caption">
      <span class="caption-inner">{{caption}}</span>
    </div>
    <progress [ngClass]="progressClasses" [max]="max" [value]="current"></progress>
  `,
  host: {
    class: 'progress progress-bar-wrapper'
  }
})
export class ProgressComponent {
  @Input() caption: string;
  @Input('color') colorOpts: { [className: string]: boolean };
  @Input('max') inputMax: number;
  @Input('value') inputCurrent: number;
  @Input('bg') isBackground: boolean;
  max: number;
  current: number;
  progressClasses: { [className: string]: boolean };
  ngOnInit() {
    this.progressClasses = {
      'progress-bar': !this.isBackground,
      'progress-bar-bg': this.isBackground
    };
    // this.progressClasses.push( ?  : 'progress-bar-bg');
    if (this.colorOpts) {
      this.progressClasses = Object.assign(this.progressClasses, this.colorOpts);
    }
    this.parseMaxValue(this.inputMax);
    this.parseCurrentValue(this.inputCurrent);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['inputCurrent'] && changes['inputCurrent'].currentValue) {
      this.parseCurrentValue(changes['inputCurrent'].currentValue);
    }
    if (changes['inputMax'] && changes['inputMax'].currentValue) {
      this.parseMaxValue(changes['inputMax'].currentValue);
    }
  }
  private parseMaxValue(max: number) {
    this.max = !isNaN(parseFloat(String(max))) && isFinite(max) ? max : 100;
  }
  private parseCurrentValue(current: number) {
    this.current = !isNaN(parseFloat(String(current))) && isFinite(current) ? current : 0;
  }
}