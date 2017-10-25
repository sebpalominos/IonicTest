import { Component, Input } from '@angular/core';
import { NavController } from "ionic-angular";

@Component({
  selector: 'slider-card',
  template: `
    <div [ngClass]="classNames">
      <ng-content></ng-content>
    </div>
  `,
  host: {
    class: 'slider-card'
  }
})
export class SliderCardComponent {
  @Input() borderless: boolean = false;
  @Input() padding: boolean = false;
  classNames: string[];
  constructor(public navCtrl: NavController){}
  ngOnInit(){
    this.classNames = ['carousel-card'];
    if (this.borderless){
      this.classNames.push('borderless');
    }
  }
}