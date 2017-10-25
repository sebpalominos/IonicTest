import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { GoogleMapComponent } from '../google-map-modal/google-map-modal.component';
import * as moment from 'moment';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {

  time = false;
  text1 = 'Hola';
  text2 = 'Hello';
  text3 = 'ForSaleProperty';
  debounced;
  searchParams;

  constructor(
    public modalCtrl: ModalController
  ) {    
  }
  
  toggleSpinner(){
      this.time = !this.time;
      this.text1 = undefined;
      // console.log(this.time);
  }

  showGoogleMapModal(){
    let coordinates = {latitude: -34.9290, longitude: 138.6010};
    let googleMapModal = this.modalCtrl.create(GoogleMapComponent, {coordinates: coordinates});
    googleMapModal.present();
  }

  onKeyDown(){
    console.log('down');
    clearTimeout(this.debounced);
  }

  onKeyUp(){
    console.log('up');
    this.debounced = setTimeout(()=>{
      console.log('up late',this.searchParams);
    },2000);
  }

}
