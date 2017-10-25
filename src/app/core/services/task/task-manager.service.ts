import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { TaskManagerOpts } from '../../data/task/task-manager-types';
// import { OnboardingService } from '../onboarding/onboarding.service';
// import { OpicaHttpService } from '../insights-http/insights-http.service';

/**
 * TaskService is for registering, running and reviving background tasks as required by various 
 * functions of the app
 * @export
 * @class TaskService
 */
@Injectable()
export class TaskManagerService {
  constructor(
    protected storage: Storage
  ) {}
  protected storageNamespacePrefix = 'task';
  /**
   * Revive any saved tasks since the app last closed.
   * @param {*} targetTaskService - Externally-provided target object upon which to invoke the revived task methodNames.
   * @returns {Promise<boolean>} 
   * @memberOf TaskManagerService
   */
  public reviveTasks(targetTaskService: any): Promise<boolean> {
    return this.storage.keys().then(keys => {
      keys.filter(key => key.startsWith(`${this.storageNamespacePrefix}.`)).forEach(key => {
        let prefixLength = this.storageNamespacePrefix.length + 1;    // Length = string char size + 1 (for the dot)
        let methodName = key.substring(prefixLength);
        if (targetTaskService[methodName]) {
          this.storage.get(key).then((keyData: TaskManagerOpts) => {
            let args = keyData.methodArgs || [];
            targetTaskService[methodName](...args);
          }).catch(error => {
            targetTaskService[methodName]();
          });
        }
      });
      return true;
    }).catch(error => {
      console.warn(error);
      return false;
    });
  }
  /**
   * Add a task to the revival stack, to be actioned when the app closes then opens again. 
   * No LBYL
   * @protected
   * @param {string} taskSignature 
   * @memberOf TaskService
   */
  public pushTask(taskSignature: string, opts?: TaskManagerOpts) {
    let associatedData: TaskManagerOpts = Object.assign({ since: new Date() }, opts || {});
    this.storage.set(`${this.storageNamespacePrefix}.${taskSignature}`, associatedData);
  }
  /**
   * Remove a task from the revival stack, usually done when the task in question has been completed
   * @protected
   * @param {string} taskSignature 
   * @memberOf TaskService
   */
  public popTask(taskSignature: string) {
    this.storage.remove(`${this.storageNamespacePrefix}.${taskSignature}`);
  }
}