import { Component } from '@angular/core';
import { NavParams, ViewController, ModalController } from 'ionic-angular';

@Component({
  selector: 'modal-error-splash',
  template: `
    <ion-header>
      <ion-navbar>
        <ion-title>Error encountered</ion-title>
        <ion-buttons end>
          <button ion-button (click)="close()">
            <span showWhen="ios">Cancel</span>
            <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
          </button>
        </ion-buttons>
      </ion-navbar>
    </ion-header>
    <ion-content>
      <h1>This app encountered an error&hellip;</h1>
      <p>&hellip; and we don't have a solution just yet!</p>
      <pre><code>{{message}}</code></pre>
    </ion-content>
  `,
  host: {
    class: 'error-splash'
  }
})
export class ErrorSplashComponent {
  message: string;
  constructor(
    public navParams: NavParams, 
    public viewCtrl: ViewController, 
    public modalCtrl: ModalController
  ) {}
  ngOnInit() {
    let error: any = this.navParams.get('error') || this.navParams.get('message');
    if (typeof error === 'object') {
      this.message = JSON.stringify(error);
    }
    else {
      this.message = error.toString() || 'No error message provided';
    }
  }
  public close() {
    this.viewCtrl.dismiss();
  }
}