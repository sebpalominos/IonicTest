import { Component, Input } from '@angular/core';

import { OpiconSize } from './opc-icon-type';

@Component({
  selector: 'opc-icon',
  template: `
    <span [ngClass]="iconClassName"></span>
  `,
  host: {
    'class': 'opc-icon icon'
  }
})
export class IconComponent {
  @Input() name: string = 'diamond';
  @Input() set: string = 'essential';
  @Input() size: string|OpiconSize;
  iconClassName: string[];
  constructor(){}
  ngOnInit(){
    this.iconClassName = [].concat(this.getClassNamesBySet(), this.getClassNamesBySize());
  }
  private getClassNamesBySet() : string[] {
    switch (this.set){
      case 'opica':
        return ['opicon', `opicon-${this.name}`];
      case 'fatcow':
        return ['fatcow-icon', `fatcow-icon-${this.name}`];
      case 'essential':
      case 'business':
      case 'hotel':
      case 'job':
      case 'interaction':
        return ['font-icon', `fi-${this.set}`, `fi-${this.set}-${this.name}`];
      default: 
        return [`${this.set}`, `${this.name}`];
    }
  }
  private getClassNamesBySize() : string[] {
    switch (this.size){
      case OpiconSize.extraLarge:
      case 'xl':
        return [`icon-size-xl`];
      case OpiconSize.large:
      case 'lge':
      case 'lg':
        return [`icon-size-lg`];
      case OpiconSize.medium:
      case 'med':
      case 'md':
        return [`icon-size-md`];
      case OpiconSize.small:
      case 'sml':
      case 'sm':
        return [`icon-size-sm`];
      default: 
        return [];
    }
  }
}