import { Directive, ElementRef, Renderer, Input } from '@angular/core';
/**
 * When applied to the parent element of a HeroUnitComponent, this directive 
 * enables the hero unit to reach the top edge of the screen by underlapping the header
 * @export
 * @class HeroEdgeDirective
 */
@Directive({ 
  selector: '[hero-edge]'
})
export class HeroEdgeDirective {
  constructor(
    protected renderer: Renderer,
    protected elementRef: ElementRef
  ) {}
  ngOnInit() {
    this.renderer.setElementClass(this.elementRef.nativeElement, 'hero-edge', true);
  }
}