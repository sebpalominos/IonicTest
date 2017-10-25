import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { NavParams } from 'ionic-angular';

declare var google;

@Component({
    selector: 'google-map-modal',
    templateUrl: 'google-map-modal.html'
})
export class GoogleMapModalComponent {

    @ViewChild('map') mapElement: ElementRef;
    map: any;
    coordinates;
    address: string;
    addressDefault: string = 'Property Address';

    constructor(
        protected navParams: NavParams
    ) { 
        
    }

    ngOnInit() {
        this.loadMap();
        if(this.navParams.get('coordinates')){
            console.log('coordinates', this.navParams.get('coordinates'));
            this.coordinates = this.navParams.get('coordinates');
            this.setMarker(this.coordinates.latitude,this.coordinates.longitude);
        }
        if(this.navParams.get('address')){
            console.log('address', this.navParams.get('address'));
            this.address = this.navParams.get('address');            
        }
        this.map.setCenter(new google.maps.LatLng(this.coordinates.latitude, this.coordinates.longitude));
    }

    loadMap() {

        let latLng = new google.maps.LatLng(-34.9290, 138.6010);

        let mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    }

      setMarker(lat,long){
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, long),
            map: this.map
        });
      }
}