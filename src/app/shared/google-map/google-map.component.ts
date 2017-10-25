import { Component, ViewChild, ElementRef, Input } from '@angular/core';

declare var google;

@Component({
    selector: 'google-map',
    templateUrl: 'google-map.html'
})
export class GoogleMapComponent {

    @ViewChild('map') mapElement: ElementRef;
    map: any;
    @Input('lat') lat: number;
    @Input('long') long: number;

    constructor() {
    }

    ngOnInit() {
        
        setTimeout(() => {
            this.loadMap();
            this.map.setCenter(new google.maps.LatLng(this.lat, this.long));
        }, 1000);
    }

    loadMap() {

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

    }
}