import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { GoogleMapComponent } from '../google-map-modal/google-map-modal.component';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {

  time = false;
  text1 = 'Hola';
  text2 = 'Hello';

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


  disabled = [
    {
       "providerName": "Westpac",
       "providerInternalSlug": "westpac",
       "providerInternalId": 14,
       "lastRefreshStatus": "SUCCESS",
       "disabledAccounts": [
          {
             "connectorAccountId": "519557",
             "connectorUserSiteId": 6,
             "name": "Jim fund",
             "connector": "PROVISO"
          }
       ],
       "connector": "PROVISO"
    },
    {
       "providerName": "ING Direct",
       "providerInternalSlug": "ing",
       "providerInternalId": 5000151,
       "lastRefreshStatus": "SUCCESS",
       "disabledAccounts": [],
       "connector": "PROVISO"
    }
 ];
}
