import { Component, Input } from '@angular/core';

/**
 * Add an icon or arbitrary image to the left of another block element. Everything gets displays in a straight line (via flexbox).
 * ### Usage examples:
 * Add an image by source.
 * ``` 
 * <opc-icon-heading [src]="path/to/pic.png">...</opc-icon-heading>
 * ``` 
 * Add a pre-defined `.logo-icon` (there must be CSS written to render the bg image, etc).
 * ```
 * <opc-icon-heading [className]="the-logo-icon-classname">...</opc-icon-heading>
 * ```
 * Insert a default heading
 * ```
 * <opc-icon-heading [src]="path/to/pic.png">This is a default heading</opc-icon-heading>
 * ```
 * Insert your own custom headings and images
 * ```
 * <opc-icon-heading [src]="path/to/pic.png">
 *   <img src="my/own/image.png">
 *   <h1 class="my-own-class">My own heading tag</h1>
 * </opc-icon-heading>
 * ```
 * @export
 * @class IconHeadingComponent
 */
@Component({
  selector: 'opc-icon-heading',
  template: `
    <div class="ih-wrapper" [ngClass]="sizeClassName">
      <img *ngIf="src" class="ih-icon" [src]="src" [ngStyle]="style">
      <div *ngIf="iconClassName" class="ih-icon logo-icon" [ngClass]="iconClassName" [ngStyle]="style"></div>
      <ng-content select="img,opc-icon"></ng-content>
      <div class="ih-heading-block">
        <div class="ih-heading" text-wrap>
          <ng-content select="h1,h2,h3,h4"></ng-content>
          <h2><ng-content></ng-content></h2>
        </div>
        <ng-content select="div,p"></ng-content>
      </div>
    </div>
  `,
  host: {
    'class': 'icon-heading'
  }
})
export class IconHeadingComponent {
  @Input() src: string;
  @Input() style: string;
  @Input() size: string;
  @Input('logoIconName') iconClassName: string;
  sizeClassName: string;
  ngOnInit() {
    this.sizeClassName = this.parseSizeClassname();
  }
  private parseSizeClassname(): string {
    switch (this.size) {
      case 'xxl':
      case 'xl':
      case 'lg':
      case 'md':
      case 'sm':
      case 'xs':
        return `size-${this.size}`;
      default:
        return `size-md`;
    }
  }
}