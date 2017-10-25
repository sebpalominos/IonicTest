import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'modal-app-info',
  templateUrl: 'app-info.html'
})
export class AppInfoComponent {
  constructor(public viewCtrl: ViewController){}
  ngOnInit(){
    // Todo: read all the system info and display it back out
  }
}
