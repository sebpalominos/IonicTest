import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/switchMap';

import { TaskPersistenceBase } from './task-persistence-base';
import { TaskManagerService } from './task-manager.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { InsightsHttpService } from '../insights-http/insights-http.service';

/**
 * TaskService is for registering, running and reviving background tasks as required by various 
 * functions of the app
 * @export
 * @class TaskService
 */
@Injectable()
export class TaskService extends TaskPersistenceBase {
  constructor(
    protected storage: Storage,
    protected http: InsightsHttpService,
    protected events: Events,
    protected taskManagerService: TaskManagerService,
    protected onboardingService: OnboardingService,
  ) { super(taskManagerService) }

  /**
   * Task to check for new accounts, after account connection is done
   * Note: Temporary solution
   * @param {number} [intervalSeconds=5] 
   * @memberOf TaskService
   */
  public checkConnectionNewAccounts(intervalSeconds: number = 5, timeoutSeconds: number = 120) {
    this.persist('checkConnectionNewAccounts');     // on
    let timerSubscription;
    // Set a timeout to stop bothering after 2 minutes
    setTimeout(() => {
      this.desist('checkConnectionNewAccounts');    // off
      timerSubscription.unsubscribe();
    }, timeoutSeconds * 1000);
    // Get an initial snapshot, then subsequently compare with this snapshot
    this.onboardingService.getExistingAccountSummary()
      .then((accountIds: number[]) => {
        // Emits a number every 5 secs
        // Every tick, switchMap to a HTTP GET instead
        let poller = Observable.timer(0, intervalSeconds * 1000);
        var accountIdPoller = poller.switchMap(() => this.onboardingService.getExistingAccountSummary());
        timerSubscription = accountIdPoller.subscribe((polledAccountIds: number[]) => {
          if (accountIds.length !== polledAccountIds.length) {
            this.desist('checkConnectionNewAccounts');    // off
            timerSubscription.unsubscribe();
            let diff = polledAccountIds.length - accountIds.length;
            let absDiff = Math.abs(diff);
            // Publish a "showalert" event to the app.component.ts root component
            this.events.publish('root:showAlert', {
              title: `${absDiff} accounts ${diff > 0 ? 'added' : 'removed'}`, 
              subTitle: 'You can access data on these accounts now',
              buttons: [{
                text: 'Later'
              }, {
                text: 'View now',
                handler: function() { console.log(this) }
              }]
            });
          }
        });
      })
      .catch(err => {
        console.warn(err);
      });
  }
}