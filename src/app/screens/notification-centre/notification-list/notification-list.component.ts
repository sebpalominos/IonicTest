import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, ActionSheetController } from 'ionic-angular';
import { List, InfiniteScroll } from 'ionic-angular';

import { NotificationComponent } from '../notification/notification.component';
import { Notification } from '../shared/notification.model';
import { NotificationType, NotificationStateType, NotificationListItem, OpiconParams } from '../shared/notification-type';
import { ACTIONABLE_SCREENS } from '../shared/notification-action-screens';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'scr-notification-list',
  templateUrl: 'notification-list.html',
  host: {
    class: 'notification-list'
  }
})
export class NotificationListComponent {
  @ViewChild(List) list: List;
  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
  notificationListItems: NotificationListItem[];
  limitPerPage: number = 5;
  currentOffset: number = 0;
  actionableScreens = ACTIONABLE_SCREENS;
  screens = { notification: NotificationComponent };
  isRetrieving: boolean;
  constructor(
    protected navCtrl: NavController, 
    protected modalCtrl: ModalController,
    protected actionSheetCtrl: ActionSheetController,
    protected notificationService: NotificationService
  ) {}
  ionViewWillLoad() {
    // Theoretically this will happen once if the view comes into existence. So 
    // we run a retrieval and set the isAlreadyRetrieving flag. 
    // this.notificationService.retrieveNotifications().then(result => {
    //   this.loadNotifications();
    // });
    this.notificationListItems = [];
  }
  ionViewWillEnter() {
    if (!this.isRetrieving) {
      this.loadNotifications(true);
    }
  }
  /** 
   * Handle a tap event. If the notf is actionable, execute the action.
   * Otherwise display a generic "details" screen for that notification.
   */
  handleNotificationTap(notificationListItem: NotificationListItem) {
    this.list.closeSlidingItems();
    // In any case, we should set it to read
    notificationListItem.showUnreadCounter = false;
    let notification = notificationListItem.notification;
    notification.state = NotificationStateType.Read;
    // Outcome 1: On actionables, go to that component
    if (notification.type === NotificationType.Actionable){
      if (notification.actionComponent && this.screens.hasOwnProperty(notification.actionComponent)){
        let screen = this.actionableScreens[notification.actionComponent];
        if (notification.isActionModal) {
          this.modalCtrl.create(screen, notification.actionData).present();
        }
        else {
          this.navCtrl.push(screen, notification.actionData);
        }
        return;
      }
    }
    // Outcome 2: On WebPages, bring it up in a web wrapper
    if (notification.type === NotificationType.WebPage){
      // Expect URL to be fully qualified
      if (notification.actionData.url && notification.actionData.url.match(new RegExp('@^(https?|ftp)://[^\s/$.?#].[^\s]*$@iS'))){
        console.log(`Launched in-app browser for ${notification.actionData.url}`);
        // cordova.InAppBrowser.open(url, "_system", "location=true"); 
        return;   
      }
    }
    // Outcome 3: View it in a dead-end notification page
    this.navCtrl.push(this.screens['notification'], notification);
  }
  markRead(notificationListItem: NotificationListItem) {
    notificationListItem.showUnreadCounter = false;
    notificationListItem.notification.state = NotificationStateType.Read;
    this.list.closeSlidingItems();
  }
  showOptions() {
    this.list.closeSlidingItems();
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [{
        text: 'Mark all read',
        handler: () => this.notificationListItems.forEach(ni => ni.notification.state = NotificationStateType.Read)
      }, {
        text: 'Cancel',
        role: 'cancel'
      }]
    });
    actionSheet.present();
  }
  loadMoreNotifications() {
    return this.loadNotifications(false);
  }
  private loadNotifications(isInitial = true) {
    this.notificationService.getNotifications(this.limitPerPage, this.currentOffset).then((notifications: Notification[]) => {
      if (!notifications || notifications.length === 0) {
        this.infiniteScroll.enable(false);
        return console.warn('Notifications is null – possibly end of list');
      }
      let newNotifications = notifications.map(notification => {
        // Determine which icon this should show.
        // let { ionicon, opicon } = this.determineContextIcon(notification);
        let ionicon = null, opicon = null;
        let showUnreadCounter = notification.state === NotificationStateType.New;
        return <NotificationListItem> { notification, ionicon, opicon, showUnreadCounter };
      });
      this.notificationListItems = this.notificationListItems.concat(newNotifications);
      this.currentOffset += this.limitPerPage;
      if (!isInitial) {
        this.infiniteScroll.complete();
      }
    });
  }
  // private loadMoreNotifications(infiniteScroll: InfiniteScroll) {
  //   this.notificationService.getNotifications(this.limitPerPage, 0).then((notifications: Notification[]) => {
  //     if (!notifications) {
  //       return console.warn('Notifications is null – possibly end of list');
  //     }
  //     this.currentOffset += this.limitPerPage;
  //     this.notificationListItems = notifications.map(notification => {
  //       // Determine which icon this should show.
  //       // let { ionicon, opicon } = this.determineContextIcon(notification);
  //       let ionicon = null, opicon = null;
  //       let showUnreadCounter = notification.state === NotificationStateType.Unread;
  //       return <NotificationListItem> { notification, ionicon, opicon, showUnreadCounter };
  //     });
  //   });
  // }
  /**
   * Icon determinator. Todo: Turn into a service?
   * Return a relevant icon for the notification. Note: this method returns an 
   * array where both ionicon and opicon could be optional.
   */
  private determineContextIcon(notification: Notification) : { ionicon?: string; opicon?: OpiconParams } {
    switch (notification.actionComponent) {
      case 'category':
        if (~notification.tags.indexOf('progress')){
          return { opicon: { name: 'progressbar', set: 'fatcow' } };
        } 
        return { opicon: { name: 'three-tags', set: 'fatcow' } };
      case 'account':
        return { opicon: { name: 'card-back', set: 'fatcow' } };
    }
    if (~notification.tags.indexOf('mortgage')) {
      return { opicon: { name: 'house-go', set: 'fatcow' } };
    }
    if (~notification.tags.indexOf('ratechange')) {
      if (~notification.tags.indexOf('up')) {
        return { opicon: { name: 'chart-up-color', set: 'fatcow' } };
      }
      return { opicon: { name: 'chart-down-color', set: 'fatcow' } };
    }
    if (~notification.tags.indexOf('financialadvice')) {
      return { opicon: { name: 'comments', set: 'fatcow' } };
    }
    
    // Default is to show an icon based on type
    switch (notification.type) {
      case NotificationType.Info:
        return { opicon: { name: 'information', set: 'fatcow' } };
      case NotificationType.Actionable:
        return { opicon: { name: 'information', set: 'fatcow' } };
    }
    return {};
  }
}