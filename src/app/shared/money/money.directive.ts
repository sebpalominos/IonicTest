import { Directive, ElementRef, Renderer, Input } from '@angular/core';

/**
 * Adds supporting CSS classes to make a value look more like money.
 * @see [themes_dir]/_money.scss for implementation
 * @todo Alter currency symbol based on configured locale
 * @export
 * @class MoneyDirective
 */
@Directive({ 
  selector: 'opc-money, [opc-money]'
})
export class MoneyDirective {
  @Input() sign: number = 1;
  @Input() colorize: string;
  constructor(
    protected renderer: Renderer,
    protected elementRef: ElementRef
  ) {}
  ngOnInit() {
    // Add money classes to this element.
    this.renderer.setElementClass(this.elementRef.nativeElement, 'money', true);
    // Todo: Localize 
    this.renderer.setElementClass(this.elementRef.nativeElement, 'currency-aud', true);
    // let isColorize = this.colorize != null && this.colorize;
    if (this.sign) {
      let valueClass = this.sign > 0 ? 'value-positive' : 'value-negative';
      this.renderer.setElementClass(this.elementRef.nativeElement, valueClass, true);
      if (this.colorize != null) {
        if (this.colorize === 'inverse') {
          // Larger than zero is bad
          var colorClass = this.sign > 0 ? 'money-color-negative' : 'money-color-positive';
        }
        else {
          // Larger than zero is good
          var colorClass = this.sign > 0 ? 'money-color-positive' : 'money-color-negative';
        }
        this.renderer.setElementClass(this.elementRef.nativeElement, colorClass, true); 
      }
      // if (isColorize) {
      //   if (this.amount > 0) {
      //     let colorClass = this.transactionMultiplier > 0 ? 'money-color-positive' : 'money-color-negative';
      //     this.renderer.setElementClass(this.elementRef.nativeElement, colorClass, true);      
      //   }
      //   else if (this.amount < 0) {
      //     let colorClass = this.transactionMultiplier > 0 ? 'money-color-negative' : 'money-color-positive';
      //     this.renderer.setElementClass(this.elementRef.nativeElement, colorClass, true);      
      //   }
      //   else {
      //     this.renderer.setElementClass(this.elementRef.nativeElement, 'money-neutral', true);        
      //   }
      // }
    }
    // this.elementRef.nativeElement.style.backgroundColor = 'yellow';
  }
}