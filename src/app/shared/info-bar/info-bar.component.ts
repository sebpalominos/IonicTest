import { Component, Input, SimpleChanges } from '@angular/core';

import { OpiconSize } from './opc-icon-type';

@Component({
  selector: 'info-bar',
  template: `
    <div class="info-bar-inner" [ngClass]="classNames" *ngIf="isVisible">
      <ion-icon class="info-bar-dismiss" name="close" (tap)="close()" *ngIf="showDismiss"></ion-icon>
      <div class="info-bar-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  host: {
    class: 'info-bar'
  }
})
export class InfoBarComponent {
  @Input() id: string;
  @Input() context: 'success'|'info'|'warning'|'danger';
  @Input() snap: 'top'|'bottom';
  @Input() align: 'left'|'center'|'right' = 'left';
  @Input() dismissable: boolean;
  @Input() forgettable: boolean;
  classNames: string[];
  showDismiss: boolean;
  isForgetWhenDismiss: boolean;
  isVisible: boolean = true;
  ngOnInit() {
    this.classNames = [];
    this.classNames.push('ib');
    if (this.context) {
      this.classNames.push(`ib-${this.context}`);
    }
    this.determineSnapPosition();
    this.determineDismissModes();
  }
  close() {
    this.isVisible = false;
    if (this.isForgetWhenDismiss) {
      // TODO
    }
  }
  private determineSnapPosition() {
    switch(this.snap) {
      case 'top':
        return this.classNames.push('snap-top');
      case 'bottom':
        return this.classNames.push('snap-bottom');
    }
  }
  private determineAlignment() {
    switch (this.align) {
      case 'right':
        this.classNames.push('rtl');
      case 'center': 
        this.classNames.push('center');
    }
  }
  private determineDismissModes() {
    if (this.dismissable != null && this.dismissable !== false) {
      this.showDismiss = true;
    }
    else if (this.forgettable != null && this.forgettable !== false) {
      if (!this.id) {
        console.warn('Forgettable info bar must have a non-null ID attribute');
      }
      else {
        this.showDismiss = true;
        this.isForgetWhenDismiss = true;
      }
    }
  }
}