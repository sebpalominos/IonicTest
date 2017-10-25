import { Component, ViewChild } from '@angular/core';
import { NavParams, Config, Platform, AlertController, Content } from 'ionic-angular'
import { StatusBar } from '@ionic-native/status-bar';
// import { InAppBrowser } from '@ionic-native/in-app-browser';
// import { SafariViewController } from '@ionic-native/safari-view-controller';
import { EmailComposer } from '@ionic-native/email-composer';

import { SafariViewControllerLauncher } from '../../shared/safari-view-component-launcher';

@Component({
  selector: 'login-help',
  templateUrl: 'login-help.component.html',
  host: {
    class: 'login-help'
  }
})
export class LoginHelpComponent {
  @ViewChild(Content) content: Content;
  svcLauncher: SafariViewControllerLauncher = SafariViewControllerLauncher.init();
  constructor(
    protected statusBar: StatusBar,
    protected platform: Platform,
    protected config: Config,
    protected alertCtrl: AlertController,
    protected emailComposer: EmailComposer,
  ) { 
    // this.svcLauncher = new SafariViewControllerLauncher(platform, alertCtrl, safariViewController, inAppBrowser);
  }
  ionViewWillEnter() {
    this.statusBar.hide();
  }
  ionViewWillLeave() {
    this.statusBar.show();
  }
  launchProductVideo() {
    let productVideoUrl = this.config.get('loginHelpProductVideoUrl', 'https://m.youtube.com/watch?v=GDTmVh99JYk');
    this.svcLauncher.launch(productVideoUrl);
  }
  launchWebsite() {
    let websiteUrl = this.config.get('loginHelpBrochureWebsite', 'http://www.opicagroup.com.au');
    this.svcLauncher.launch(websiteUrl);
  }
  sendEmail() {
    this.emailComposer.isAvailable().then(isAvailable => {
      if (isAvailable) {
        let email = {
          to: this.config.get('loginHelpEmailRecipients', 'gopal.hariharan@opicagroup.com.au'),
          subject: this.config.get('loginHelpEmailSubject', 'OPICA Insights App'),
          isHtml: true
        };
        this.emailComposer.open(email);
      }
      else {
        window.location.href = 'mailto: ';
      }
    });
  }
}