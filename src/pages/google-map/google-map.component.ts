import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
 
declare var google;
 
@Component({
  selector: 'google-map-page',
  templateUrl: 'google-map.html'
})
export class GoogleMapPage {
 
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  @Input('lat') lat: number;
  @Input('long') long: number;
 
  constructor(public navCtrl: NavController) {
    // this.loadMap();
  }
 
//   ionViewDidLoad(){
//     this.loadMap();
    
//   }
ngOnInit() {
    this.loadMap();
    setTimeout(() =>{
        this.map.setCenter(new google.maps.LatLng(this.lat, this.long));
    },1000);
  }
 
  loadMap(){
 
    let latLng = new google.maps.LatLng(-34.9290, 138.6010);
 
    let mapOptions = {
      center: latLng,
      zoom: 15,
      scrollwheel: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: false,
      scaleControl: false,
      streetViewControl: false
    }
 
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(this.lat, this.long),
        map: this.map
    });

    
    console.log('lat',this.lat);
    console.log('long',this.long);

  }

//   setMarker(lat,long,title){
//     var marker = new google.maps.Marker({
//         position: new google.maps.LatLng(lat, long),
//         map: this.map,
//         title: title
//     });
//   }
}