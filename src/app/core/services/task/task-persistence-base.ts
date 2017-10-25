import { TaskManagerService } from './task-manager.service';
/**
 * TaskBase deals with the persistence stuff
 * @export
 * @class TaskBase
 */
export class TaskPersistenceBase {
  constructor(
    protected taskManager: TaskManagerService
  ) {}
  protected persist(storageKey: string) {
    this.taskManager.pushTask(storageKey);     // on
  }
  protected desist(storageKey: string) {
    this.taskManager.popTask(storageKey);    // off
  }
}