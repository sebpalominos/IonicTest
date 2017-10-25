import { Component } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';

@Component({
  selector: 'pin-entry',
  template: `
    <ion-content #content no-bounce>
      <ion-spinner name="crescent"></ion-spinner>
    </ion-content>
  `,
  host: {
    class: 'opc-pin-entry placeholder'
  }
})
export class PinEntryPlaceholderComponent {
  constructor(
    private statusBar: StatusBar
  ) {}
  ionViewWillEnter() {
    this.statusBar.hide();
  }
  ionViewWillLeave() {
    this.statusBar.show();
  }
}