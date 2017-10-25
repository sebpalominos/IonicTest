import { Component, ViewChild, Renderer } from '@angular/core';

@Component({
  selector: 'hero-unit',
  template: `
    <div class="hero-inner">
      <ng-content></ng-content>
    </div>
  `,
  host: {
    class: 'opc-hero-unit'
  }
})
export class HeroUnitComponent {
  constructor() {}
  handleScrollEvent(event){
    console.warn('HeroUnitComponent::handleScrollEvent() is deprecated. Please remove the reference to this method.');
  }
}