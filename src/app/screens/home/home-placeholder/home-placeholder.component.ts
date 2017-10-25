import { Component } from '@angular/core';
import { Events } from 'ionic-angular';

@Component({
  selector: 'home-placeholder',
  templateUrl: 'home-placeholder.component.html',
  host: {
    class: 'opc-home home-placeholder'
  }
})
export class HomePlaceholderComponent {
  constructor(
    protected events: Events
  ) {}
  ionViewWillEnter() {
    this.events.publish('init:landed');
  }
}