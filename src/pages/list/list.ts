import { Component } from '@angular/core';

import { NavController, NavParams, ModalController } from 'ionic-angular';

import { ItemDetailsPage } from '../item-details/item-details';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  cucumber = [];
  icons: string[];
  items: Array<{title: string, note: string, icon: string, checked: boolean}>;
  

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public modalCtrl: ModalController) 
    {
    this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane',
    'american-football', 'boat', 'bluetooth', 'build'];

    this.items = [];
    for(let i = 1; i < 11; i++) {
      this.items.push({
        title: 'Item ' + i,
        note: 'This is item #' + i,
        icon: this.icons[Math.floor(Math.random() * this.icons.length)],
        checked: false
      });
    }
    if(this.navParams.get('id')){
      console.log('1', this.navParams.get('id'));
    }
    
  }

  

  itemTapped(event, item) {
    let itemDetailsPage = this.modalCtrl.create(ItemDetailsPage, {
      item: item
    });
    itemDetailsPage.onDidDismiss(data =>{
      if(data){
        console.log(data);
      }
    });
    itemDetailsPage.present();
    
    // this.navCtrl.push(ItemDetailsPage, {
    //   item: item
    // });
  }

  doInfinite(infiniteScroll) {
    console.log('Begin async operation');

    setTimeout(() => {
      for (let i = 0; i < 10; i++) {
        this.items.push({
          title: 'Item ' + i,
          note: 'This is item #' + i,
          icon: this.icons[Math.floor(Math.random() * this.icons.length)],
          checked: false
        });
      }

      console.log('Async operation has ended');
      infiniteScroll.complete();
    }, 500);
  }


}
