import { Component, Input } from '@angular/core';

@Component({
  selector: 'ion-walkthrough',
  template: `
      <div
       class="ion-walkthrough-slide-container {{getDeviceType()}}-layout {{getDeviceColor()}}"
       [ngClass]="{'top-layout': isTopLayout()}"
       [ngStyle]="options.styles && options.styles.background && {'background': options.styles.background}">
        <ion-toolbar transparent class="ion-walkthrough-slide-buttons" [ngStyle]="{'order': isTopLayout() ? 3 : 1 }">
          <ion-buttons left>
            <button 
              ion-button
              clear 
              *ngIf="options.buttons && options.buttons.left"
              (click)="options.buttons.left.onClick()"
              [ngStyle]="options.buttons.left.textColor && {'color': options.buttons.left.textColor}"
              class="ion-walkthrough-slide-nav-button ion-walkthrough-slide-nav-button-left"
            >{{options.buttons.left.text}}</button>
          </ion-buttons>
          <ion-buttons right>
            <button 
              ion-button
              clear 
              *ngIf="options.buttons && options.buttons.right"
              (click)="options.buttons.right.onClick()"
              [ngStyle]="options.buttons.right.textColor && {'color': options.buttons.right.textColor}"
              class="ion-walkthrough-slide-nav-button ion-walkthrough-slide-nav-button-right"
            >{{options.buttons.right.text}}</button>
           </ion-buttons>
        </ion-toolbar>
        <div [ngStyle]="{'order': 2}">
          <h1
            class="ion-walkthrough-slide-title"
            [innerHTML]="options.title"
            [ngStyle]="options.styles && options.styles.titleColor && {'color': options.styles.titleColor}">
          </h1>
          <p 
            class="ion-walkthrough-slide-description" 
            [innerHTML]="options.description" 
            [ngStyle]="options.styles && options.styles.descriptionColor && {'color': options.styles.descriptionColor}">
          </p>
        </div>
        <div class="ion-walkthrough-slide-device-section" [ngStyle]="{'order': isTopLayout() ? 1 : 3 }">
          <div class="ion-walkthrough-slide-image" 
          [ngStyle]="{
            'background-image': 'url(' + options.image + ')'
          }">
          </div>
        </div>
      </div>
  `,
  styles: [`
    .ion-walkthrough-slide-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between; 
      height: 100%;
    }
    .ion-walkthrough-slide-container .ion-walkthrough-slide-nav-button {
      font-size: 1.4rem;
      font-weight: 500;
      padding: 0 8px;
    }
    .ion-walkthrough-slide-container h1 {
      margin: .4rem;
    }
    .ion-walkthrough-slide-container div p.ion-walkthrough-slide-description {
      padding: 0 40px;
      font-size: 14px;
      line-height: 1.5;
    }
    .ion-walkthrough-slide-container div.ion-walkthrough-slide-device-section {
      overflow: hidden;
      background-repeat: no-repeat;
      background-position: center top;
    }
    .ion-walkthrough-slide-container.top-layout div.ion-walkthrough-slide-device-section {
      background-position: center bottom;
    }
    .ion-walkthrough-slide-container div.ion-walkthrough-slide-device-section .ion-walkthrough-slide-image {
      margin: 0 auto;
      height: 100%;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center top;
    }
    .ion-walkthrough-slide-container.top-layout div.ion-walkthrough-slide-device-section .ion-walkthrough-slide-image {
      background-position: center bottom;
    }

    .ion-walkthrough-slide-container.android-layout.black div.ion-walkthrough-slide-device-section {
      background-image: url('./assets/ion-walkthrough/android-black.png');
    }
    .ion-walkthrough-slide-container.android-layout.white div.ion-walkthrough-slide-device-section {
      background-image: url('./assets/ion-walkthrough/android-white.png');
    }
    .ion-walkthrough-slide-container.iphone-layout.silver div.ion-walkthrough-slide-device-section {
      background-image: url('./assets/ion-walkthrough/iphone-silver.png');
    }
    .ion-walkthrough-slide-container.iphone-layout.gold div.ion-walkthrough-slide-device-section {
      background-image: url('./assets/ion-walkthrough/iphone-gold.png');
    }
    .ion-walkthrough-slide-container.iphone-layout.spacegrey div.ion-walkthrough-slide-device-section {
      background-image: url('./assets/ion-walkthrough/iphone-spacegrey.png');
    }


    @media (max-height: 568px) {
      .ion-walkthrough-slide-container div.ion-walkthrough-slide-device-section  {
        height: 340px;
        background-size: 275px 540px;
      }
      .ion-walkthrough-slide-container.android-layout div.ion-walkthrough-slide-device-section .ion-walkthrough-slide-image {
        width: 238px;
        margin-top: 52px;
      }
      .ion-walkthrough-slide-container.iphone-layout div.ion-walkthrough-slide-device-section .ion-walkthrough-slide-image {
        width: 235px;
        margin-top: 65px;
      }
      .ion-walkthrough-slide-container.top-layout div.ion-walkthrough-slide-device-section .ion-walkthrough-slide-image {
        margin-top: -67px;
      }
    }

    @media (min-height: 569px) and (max-height: 667px) {
      .ion-walkthrough-slide-container div.ion-walkthrough-slide-device-section  {
        height: 460px;
        background-size: 300px 590px;
      }
      .ion-walkthrough-slide-container.android-layout div.ion-walkthrough-slide-device-section .ion-walkthrough-slide-image {
        width: 260px;
        margin-top: 56px;
      }
      .ion-walkthrough-slide-container.iphone-layout div.ion-walkthrough-slide-device-section .ion-walkthrough-slide-image {
        width: 256px;
        margin-top: 70px;
      }
      .ion-walkthrough-slide-container.top-layout div.ion-walkthrough-slide-device-section .ion-walkthrough-slide-image {
        margin-top: -72px;
      }
    }

    @media (min-height: 668px) {
      .ion-walkthrough-slide-container div.ion-walkthrough-slide-device-section  {
        height: 520px;
        background-size: 330px 648px;
      }
      .ion-walkthrough-slide-container.android-layout div.ion-walkthrough-slide-device-section .ion-walkthrough-slide-image {
        width: 282px;
        margin-top: 62px;
      }
      .ion-walkthrough-slide-container.iphone-layout div.ion-walkthrough-slide-device-section .ion-walkthrough-slide-image {
        width: 288px;
        margin-top: 78px;
      }
      .ion-walkthrough-slide-container.top-layout div.ion-walkthrough-slide-device-section .ion-walkthrough-slide-image {
        margin-top: -80px;
      }
    }
  `]
})
export class IonWalkthrough {
  @Input() options: IonWalkthroughOptions;

  constructor() { }

  ngOnInit() {
    if (this.options === undefined || this.options === null) {
      console.error('[IonWalkthrough] options are not defined.');
      return;
    }
  }

  isTopLayout() {
    return this.options.layout && this.options.layout.position === 'top';
  }

  getDeviceType() {
    return this.options.layout && this.options.layout.deviceType === 'iphone' ? 'iphone' : 'android';
  }

  getDeviceColor() {
    if (this.getDeviceType() === 'iphone') {
      if (this.options.layout && this.options.layout.deviceColor === 'silver') {
        return 'silver';
      }
      else if (this.options.layout && this.options.layout.deviceColor === 'gold') {
        return 'gold';
      }
      else {
        return 'spacegrey';
      }
    }
    else {
      return this.options.layout && this.options.layout.deviceColor === 'white' ? 'white' : 'black';
    }
  }
}

export interface IonWalkthroughOptions {
  title: string,
  description: string,
  image: string,
  styles?: {
    background?: string,
    titleColor?: string,
    descriptionColor?: string,
    leftBtnColor?: string,
    rightBtnColor?: string
  },
  layout?: {
    position?: string,
    deviceType?: string,
    deviceColor?: string
  }
  buttons?: {
    left?: {
      text: string,
      textColor?: string,
      onClick: Function
    },
    right?: {
      text: string,
      textColor?: string,
      onClick: Function
    }
  }
}
