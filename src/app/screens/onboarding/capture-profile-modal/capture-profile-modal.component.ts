import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';

import { CaptureNameComponent } from '../capture-name/capture-name.component';

@Component({
  selector: 'modal-capture-profile',
  template: `
    <ion-nav #captureProfileNav></ion-nav>
  `
})
export class CaptureProfileModalComponent {
  @ViewChild('captureProfileNav') nav: NavController;
  constructor(public params: NavParams) {}
  ngOnInit() {
    // And for some reason, if the goalType is already set (e.g. arriving from deep link):
    this.nav.setRoot(CaptureNameComponent);
  }
}