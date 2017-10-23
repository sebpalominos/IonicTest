import { Component } from '@angular/core';

import { NavController, NavParams,ViewController } from 'ionic-angular';
import { ListPage } from '../list/list';


@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html'
})
export class ItemDetailsPage {
  selectedItem: any;
  params;
  pushPage: any;

  constructor(
    public navCtrl: NavController,
     public navParams: NavParams,
     public viewCtrl: ViewController) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');
    
    
  }

  cancel(){
    
    let params = { id: 42 };
    this.viewCtrl.dismiss(params);
    // this.navCtrl.pop();
  }
}
