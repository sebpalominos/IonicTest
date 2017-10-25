import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';

@Component({
  selector: 'scr-explain-connection-help',
  templateUrl: 'explain-connection-help.html'
})
export class ExplainConnectionHelpComponent {
  constructor(
    public params: NavParams, 
    public navCtrl: NavController,
  ) {}
}
