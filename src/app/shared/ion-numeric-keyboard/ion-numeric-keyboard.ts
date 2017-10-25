import { Component, Input, Output, EventEmitter, SimpleChange} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Content } from 'ionic-angular'

@Component({
  selector: 'ion-numeric-keyboard',
  template: `
      <ion-toolbar class="ion-numeric-keyboard-container" [class.visible]="visible" [class.has-top-bar]="options.topBarKeys && options.topBarKeys.length">
        <ion-grid class="ion-numeric-keyboard" [class.animated]="options.animated" [class.visible]="visible" [class.has-top-bar]="options.topBarKeys && options.topBarKeys.length">
          <ion-row class="ion-numeric-keyboard-top-bar" *ngIf="options.topBarKeys && options.topBarKeys.length"> 
            <ion-col class="key top-bar-key {{topBarKey.keyClass}}" *ngFor="let topBarKey of options.topBarKeys"> 
              <button ion-button clear light (click)="onClick(topBarKey.keyContent, topBarKey.keySource)">{{topBarKey.keyContent}}</button>
            </ion-col>  
          </ion-row>
          <ion-row>
            <ion-col class="key">
              <button ion-button full clear light (click)="onClick(1, 'NUMERIC_KEY')">1</button>
            </ion-col>
            <ion-col class="key">
              <button ion-button full clear light (click)="onClick(2, 'NUMERIC_KEY')">2</button>
            </ion-col>
            <ion-col class="key">
              <button ion-button full clear light (click)="onClick(3, 'NUMERIC_KEY')">3</button>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col class="key">
              <button ion-button full clear light (click)="onClick(4, 'NUMERIC_KEY')">4</button>
            </ion-col>
            <ion-col class="key">
              <button ion-button full clear light (click)="onClick(5, 'NUMERIC_KEY')">5</button>
            </ion-col>
            <ion-col class="key">
              <button ion-button full clear light (click)="onClick(6, 'NUMERIC_KEY')">6</button>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col class="key">
              <button ion-button full clear light (click)="onClick(7, 'NUMERIC_KEY')">7</button>
            </ion-col>
            <ion-col class="key">
              <button ion-button full clear light (click)="onClick(8, 'NUMERIC_KEY')">8</button>
            </ion-col>
            <ion-col class="key">
              <button ion-button full clear light (click)="onClick(9, 'NUMERIC_KEY')">9</button>
            </ion-col>
          </ion-row>
          <ion-row class="row">
            <ion-col class="key control-key left-control-key">
              <button ion-button full clear light *ngIf="options.leftControlKey && options.leftControlKey.type == 'text'" (click)="onClick(options.leftControlKey.value, 'LEFT_CONTROL')" [innerHTML]="trustContent(options.leftControlKey.value)"></button>
              <button ion-button full clear light *ngIf="options.leftControlKey && options.leftControlKey.type == 'icon'" (click)="onClick(options.leftControlKey.value, 'LEFT_CONTROL')"><ion-icon name="{{options.leftControlKey.value}}"></ion-icon></button>
            </ion-col>
            <ion-col class="key">
              <button ion-button full clear light (click)="onClick(0, 'NUMERIC_KEY')">0</button>
            </ion-col>
            <ion-col class="key control-key right-control-key">
              <button ion-button full clear light *ngIf="options.rightControlKey && options.rightControlKey.type == 'text'" (click)="onClick(options.rightControlKey.value, 'RIGHT_CONTROL')" [innerHTML]="trustContent(options.rightControlKey.value)"></button>
              <button ion-button full clear light *ngIf="options.rightControlKey && options.rightControlKey.type == 'icon'" (click)="onClick(options.rightControlKey.value, 'RIGHT_CONTROL')"><ion-icon name="{{options.rightControlKey.value}}"></ion-icon></button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-toolbar>
  `,
  styles: [`
    .ion-numeric-keyboard,
    .ion-numeric-keyboard ion-row,
    .ion-numeric-keyboard ion-row ion-col.key,
    .ion-numeric-keyboard ion-row ion-col.key button {
      padding: 0;
      margin: 0;
    }
    .ion-numeric-keyboard ion-row {
      height: 45px;
    }
    .ion-numeric-keyboard ion-row.ion-numeric-keyboard-top-bar,
    .ion-numeric-keyboard ion-row.ion-numeric-keyboard-top-bar ion-col.top-bar-key,
    .ion-numeric-keyboard ion-row ion-col.key.control-key {
      background-color: #fafafa;
    }
    .ion-numeric-keyboard ion-row.ion-numeric-keyboard-top-bar {
      border-bottom: 1px solid #eee;
    }
    .ion-numeric-keyboard ion-row.ion-numeric-keyboard-top-bar ion-col.top-bar-key {
      border: none;
    }
    .ion-numeric-keyboard ion-row ion-col.key {
      border: 0;
      border-style: solid;
      border-color: #eee;
      background-color: #fff;
    }
    .ion-numeric-keyboard ion-row:nth-child(1) ion-col.key {
      border-top-width: 1px;
    }
    .ion-numeric-keyboard ion-row:nth-child(1) ion-col.key,
    .ion-numeric-keyboard ion-row:nth-child(2) ion-col.key,
    .ion-numeric-keyboard ion-row:nth-child(3) ion-col.key,
    .ion-numeric-keyboard ion-row:nth-child(4) ion-col.key {
      border-bottom-width: 1px;
    }
    .ion-numeric-keyboard ion-row ion-col.key:nth-child(1),
    .ion-numeric-keyboard ion-row ion-col.key:nth-child(2) {
      border-right-width: 1px;
    }
    .ion-numeric-keyboard ion-row ion-col.key button {
      height: 45px;
      font-size: 140%;
      color: #5995dc;
    }
    .ion-numeric-keyboard ion-row ion-col.key.top-bar-key button {
      font-size: 100%;
    }
    .ion-numeric-keyboard-container {
      position: relative;
      height: 0;
      visibility: visible;
      padding: 0;
      min-height: 0;
      transition: all 250ms ease;
    }
    .ion-numeric-keyboard-container.visible.has-top-bar,
    .ion-numeric-keyboard-container.visible {
      height: 180px;
      visibility: visible;
      transition: all 250ms ease;
    }
    .ion-numeric-keyboard-container.visible.has-top-bar {
      height: 225px;
    }
    .ion-numeric-keyboard {
      display: none !important;
    }
    .ion-numeric-keyboard.visible {
      display: block !important;
    }
    .ion-numeric-keyboard.animated.has-top-bar,
    .ion-numeric-keyboard.animated {
      display: block !important;
      position: absolute;
      bottom: -180px;
      left: 0;
      transition: all 250ms ease;
    }
    .ion-numeric-keyboard.animated.has-top-bar {
      bottom: -225px;
    }
    .ion-numeric-keyboard.animated.has-top-bar.visible,
    .ion-numeric-keyboard.animated.visible {
      bottom: 0;
    }
  `],
  host: {
    '(document: click)': 'closeOnOutsideClickEvent($event)',
    '(click)': 'trackHostClickEvent($event)',
  }
})
export class IonNumericKeyboard {
  // inputs
  @Input() options: IonNumericKeyboardOptions;
  @Input() visible: boolean = false;
  // outputs
  @Output() inkClick = new EventEmitter();
  @Output() inkClose = new EventEmitter();
  // internals
  private _hostClickEvent: any = null; // reference to the most recent host click event
  private _isFirstClickEventIgnored = false;
  constructor(private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    if (this.options === undefined || this.options === null) {
      console.error('[IonNumericKeyboard] options are not defined.');
    }
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    // watch visibility changes
    let c: SimpleChange = changes['visible'];
    if (this.options.contentComponent && c && !c.isFirstChange()) {
      if (!this.visible && this.visible === c.currentValue && c.previousValue !== true) {
        return; //don't fire events or resize content if keyboard already hidden
      }
      this.postToggleVisibility();
    }
  }

  trustContent(content: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(content);
  }

  onClick(key: any, source: string) {
    this.inkClick.emit({
      key: key,
      source: source
    });
  }

  postToggleVisibility() {
    this.options.contentComponent.resize();
    if (this.options.animated) {
      // resizing content several times to move up/down the content as the same time as the keyboard
      setTimeout(() => this.options.contentComponent.resize(), 100);
      setTimeout(() => this.options.contentComponent.resize(), 175);
      setTimeout(() => this.options.contentComponent.resize(), 250);
    }
    this._isFirstClickEventIgnored = false;
    if (!this.visible) {
      this.inkClose.emit({});
    }
  }

  closeOnOutsideClickEvent(globalClickEvent) {
    if (!globalClickEvent || !globalClickEvent.target) {
      return; // do not hide keyboard if there is no click target, no point going on
    }
    if (this.options && !this.options.hideOnOutsideClick) {
      return; // do not hide keyboard if option is disabled
    }
    if (!this.visible) {
      return; // do not hide keyboard if keyboard already hidden
    }
    if (this._hostClickEvent === globalClickEvent) {
      return; // do not hide keyboard if click event is inside the keyboard
    }
    if (!this._isFirstClickEventIgnored) {
      this._isFirstClickEventIgnored = true;
      return; // do not hide keyboard for the first outside click event
    }
    // loop through the available elements, looking for classes in the class list that might match
    for (var element = globalClickEvent.target; element; element = element.parentNode) {
      var classNames = element.className;
      // Unwrap SVGAnimatedString
      if (classNames && classNames.baseVal !== undefined) {
        classNames = classNames.baseVal;
      }
      // check for id's or classes, but only if they exist in the first place
      if (classNames && classNames.indexOf('ion-numeric-keyboard-source') > -1) {
        // now let's exit out as it is an element that has been defined as being ignored for clicking outside
        return; // do not hide keyboard if outside click event contains .ion-numeric-keyboard-source class
      }
    }
    // click outside detected
    // hiding the keyboard
    this.visible = false;
    this.postToggleVisibility();
  }

  trackHostClickEvent(newHostClickEvent) {
    this._hostClickEvent = newHostClickEvent;
  }
}

export interface IonNumericKeyboardOptions {
  hideOnOutsideClick?: boolean, // do not hide by default
  animated?: boolean, // do not animate by default
  leftControlKey?: {
    type: string,
    value: string
  }, // no left control key by default
  rightControlKey?: {
    type: string,
    value: string
  }, // no right control key by default
  topBarKeys?: Array<{
    keySource: string,
    keyContent: string,
    keyClass: string
  }>,
  contentComponent: Content
} 