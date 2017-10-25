import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, Config } from 'ionic-angular'

import { InsightsHttpService } from '../../../core/services/insights-http/insights-http.service';

import { AppInfoComponent } from '../../misc/app-info/app-info.component';
import { ChangePasswordComponent } from '../../auth/change-password/change-password.component';
import { VersionService } from '../../../core/services/version/version.service';
import { VersionInfo } from '../../../core/data/version/version-types';

@Component({
  selector: 'account-settings',
  templateUrl: 'account-settings.html'
})
export class AccountSettingsComponent {
  configuredSettings: Array<{ key: string; value: any; }>[];   // Array of lists
  versionInfo: VersionInfo;
  screens = {
    changePassword: ChangePasswordComponent,
    appInfo: AppInfoComponent
  };
  constructor(
    protected config: Config,
    protected navCtrl: NavController, 
    protected modalCtrl: ModalController,
    protected alertCtrl: AlertController,
    protected http: InsightsHttpService,
    protected versionService: VersionService
  ) {}
  ionViewWillLoad() {
    this.configuredSettings = [];
    this.http.getJSONConfigs(['app']).then((retrievedConfigLists: any[]) => {
      retrievedConfigLists.forEach(retrievedConfigList => {
        let kvpMappedConfigList = Object.keys(retrievedConfigList).map(keyName => ({
          key: keyName,
          value: retrievedConfigList[keyName],
        }));
        this.configuredSettings.push(kvpMappedConfigList);
      });
    });
    this.versionService.ready().then(versionInfo => {
      this.versionInfo = versionInfo;
    })
  }
  showChangePasswordModal(){
    this.modalCtrl.create(this.screens['changePassword']).present();
  }
  showAppInfoModal(){
    this.modalCtrl.create(this.screens['appInfo']).present();
  }
  showSettingDetails(setting: { key: string; value: any; }) {
    this.alertCtrl.create({
      title: setting.key,
      message: setting.value,
      buttons: [ 'OK' ]
    }).present();
  }
}
