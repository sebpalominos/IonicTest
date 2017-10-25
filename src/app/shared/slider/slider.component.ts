import { Component, Input } from '@angular/core';
import { NavController, Events } from "ionic-angular";

import * as $ from "jquery";
import 'slick-carousel';

@Component({
  selector: 'slider',
  template: `
    <div [ngClass]="classNames">
      <ng-content select="slider-card"></ng-content>
    </div>
  `,
  host: {
    class: 'opc-slider'
  }
})
export class SliderComponent {
  @Input() id: string = `slider-${Math.floor(Math.random()*16777215).toString(16)}`;
  @Input() opcSliderOpts: any;
  classNames: string[];
  constructor(public navCtrl: NavController, public events: Events){}
  ngOnInit(){
    let carouselClassname = 'carousel';
    this.classNames = [carouselClassname];
    this.events.subscribe('slider:init', (ids: string[], overrideOpts?: any) => {
      if (~ids.indexOf(this.id)){
        console.log('Slick init fired for ' + ids.join(', '));
        // Also gather all attribute opts
        let opts = Object.assign({}, this.opcSliderOpts || {}, overrideOpts || {});
        $(`#${this.id} .${carouselClassname}`).not('.slick-initialized').slick(Object.assign({
          infinite: false,
          arrows: false,
          dots: false,
          slidesToShow: 1,
        }, opts));
      }
    });
  }
  ngOnDestroy(){
    console.log(`${this.id} slider destroyed`);
  }
}