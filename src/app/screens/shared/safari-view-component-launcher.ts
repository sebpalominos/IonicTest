import { ReflectiveInjector } from '@angular/core';
import { Platform, Config, AlertController, App } from 'ionic-angular';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SafariViewController } from '@ionic-native/safari-view-controller';

/**
 * Utility/Wrapper class for SafariViewController plugin used within Insights app/Ionic framework
 * @export
 * @class SafariViewControllerLauncher
 */
export class SafariViewControllerLauncher {
  /**
   * Returns a DI'd instance from the provided injector
   * @static
   * @param {Injector} injector 
   * @returns {SafariViewControllerLauncher} 
   * @memberof SafariViewControllerLauncher
   */
  static init(): SafariViewControllerLauncher {
    let injector = ReflectiveInjector.resolveAndCreate([Platform, SafariViewController, InAppBrowser, AlertController, App, Config]);
    return new SafariViewControllerLauncher(
      injector.get(Platform), 
      injector.get(AlertController), 
      injector.get(SafariViewController), 
      injector.get(InAppBrowser), 
    );
  }
  /**
   * Creates an instance of SafariViewControllerLauncher. 
   * @param {Platform} platform 
   * @param {AlertController} alertCtrl 
   * @param {SafariViewController} safariViewController 
   * @param {InAppBrowser} inAppBrowser 
   * @memberof SafariViewControllerLauncher
   */
  constructor(
    protected platform: Platform,
    protected alertCtrl: AlertController,
    protected safariViewController: SafariViewController,
    protected inAppBrowser: InAppBrowser,
  ) {}
  launch(url: string) {
    if (this.platform.is('cordova')) {
      this.safariViewController.isAvailable().then(isAvailable => {
        if (isAvailable) {
          this.safariViewController.show({
            url: url,
            hidden: false,
            animated: false,
            enterReaderModeIfAvailable: false,
          }).catch((err, obs) => {
            this.alertCtrl.create({
              title: 'SafariViewController error',
              message: JSON.stringify(err),
              buttons: ['OK']
            }).present();
            return obs;
          });
        }
        else {
          this.inAppBrowser.create(url, '_blank', {
            location: 'yes',
            hidden: 'no',
            zoom: 'no',
            hardwareback: 'no',
            closebuttoncaption: 'Close',
            toolbar: 'no',
          });    // _blank forces it to load in the InAppBrowser
        }
      });
    }
    else {
      window.open(url, '_blank', 'location=yes');
    } 
  }
  warmUp(url: string) {
    if (this.platform.is('cordova')) {
      this.safariViewController.isAvailable().then(isAvailable => {
        if (isAvailable) {
          this.safariViewController.warmUp();
          this.safariViewController.mayLaunchUrl(url);
        }
      });
    }
  }
}