/**
 * ON HOLD: (03/04/2017)
 * Attempting to implement this as a pure service first.
 */

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';  
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { Task } from './task.model';

export class NewConnectionPollingTask extends Task {

  // constructor() {
  //   super();
  //   let subject = new Observable<
  // }
}