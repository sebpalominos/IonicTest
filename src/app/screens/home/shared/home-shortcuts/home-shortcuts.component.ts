import { Component, Input } from '@angular/core';
import { NavController, ModalController, AlertController, Events } from 'ionic-angular';

import { CapabilityDefinitionItem } from '../../../../core/data/version/version-types';
import { VersionService } from '../../../../core/services/version/version.service';

interface Shortcut extends CapabilityDefinitionItem {
  label: string;
  screen: any;
  modal?: boolean;
  params?: any;
  iconPath: string;
  disabled: boolean;
};

@Component({
  selector: 'home-shortcuts',
  templateUrl: 'home-shortcuts.component.html',
  host: {
    class: 'opc-home-shortcuts card-slider'
  }
})
export class HomeShortcutsComponent {
  @Input() screens: { [screenName: string]: any };
  protected shortcuts: Shortcut[];
  constructor(
    protected navCtrl: NavController,
    protected modalCtrl: ModalController,
    protected alertCtrl: AlertController,
    protected events: Events,
    protected versionService: VersionService
  ) {}
  ngOnInit() {
    this.shortcuts = this.versionService.assignCapabilityDesignation([
      { identifier: 'CAP_ACCOUNTS', label: 'My Accounts', screen: this.screens['accountList'], iconPath: 'assets/icons/squidink/svg64/financial/wallet.svg', disabled: false },
      { identifier: 'CAP_ACCOUNTS', label: 'Add account', screen: this.screens['connectAccount'], modal: true, iconPath: 'assets/icons/squidink/svg64/financial/check.svg', disabled: false },
      { identifier: 'CAP_BREAKDOWN', label: 'Breakdown', screen: this.screens['categoryList'], iconPath: 'assets/icons/squidink/svg64/financial/tag.svg', disabled: false },
      { identifier: 'CAP_AFFORDABILITY', label: 'Affordability', screen: this.screens['affordability'], iconPath: 'assets/icons/squidink/svg64/financial/bullish.svg', disabled: false },
      { identifier: 'CAP_GOAL_CENTRE', label: 'Goal Centre', screen: this.screens['goalList'], iconPath: 'assets/icons/squidink/svg64/financial/target.svg', disabled: false },
      { identifier: 'CAP_PROPERTY_CENTRE', label: 'Property Centre', screen: this.screens['propertyCentre'], iconPath: 'assets/icons/squidink/svg64/household/armchair-2.svg', disabled: false },
    ], true);
  }
  shortcutSelected(shortcut) {
    if (!shortcut.disabled) {
      if (shortcut.modal) {
        this.modalCtrl.create(shortcut.screen, shortcut.params || {}).present().catch(err => {
          this.events.publish('version:accessRestricted', err);
        });
      }
      else {
        this.navCtrl.push(shortcut.screen, shortcut.params || {}).catch(err => {
          this.events.publish('version:accessRestricted', err);
        });
      }
    }
  }
}