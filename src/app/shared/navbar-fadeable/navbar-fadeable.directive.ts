import { Directive, ElementRef, Renderer, Input, SimpleChanges } from '@angular/core';

/**
 * Adds supporting CSS classes to make a value look more like money.
 * @see [themes_dir]/_money.scss for implementation
 * @todo Alter currency symbol based on configured locale
 * @export
 * @class MoneyDirective
 */
@Directive({ 
  selector: '[navbar-fadeable]'
})
export class NavbarFadeableDirective {
  @Input('navbar-fadeable') show: boolean;
  constructor(
    protected renderer: Renderer,
    protected elementRef: ElementRef
  ) {}
  ngOnInit() {
    this.renderer.setElementClass(this.elementRef.nativeElement, 'navbar-fadeable', true);
  }
  ngOnChanges(changes: SimpleChanges) {
    // console.log(`Current ${changes['show'].currentValue}, Prev ${changes['show'].previousValue}`);
    if (changes['show'].currentValue !== changes['show'].previousValue) {
      let hideNavbar = !changes['show'].currentValue;
      this.renderer.setElementClass(this.elementRef.nativeElement, 'navbar-fadeable-out', hideNavbar);
    }
  }
}