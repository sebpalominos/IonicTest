import { Component, Input } from '@angular/core';

@Component({
  selector: 'cover-image',
  template: `
    <aside class="cover-image-placeholder" [ngStyle]="style"></aside>
  `,
  host: {
    class: 'opc-cover-image'
  }
})
export class CoverImageComponent {
  @Input() src: string;
  @Input() height: number;
  style: any;
  ngOnInit() {
    let src = this.src || '../assets/img/placeholder/cover-image-placeholder.png';
    let height = this.height || 200;
    this.style = { 
      'background-image': `url('${src}')`, 
      height: `${height}px`
    };
  }
}