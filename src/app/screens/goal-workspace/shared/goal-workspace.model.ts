import { Account } from '../../accounts/shared/account.model';
import { GoalWorkspaceResponse } from '../../../core/data/goal/goal-response';

export namespace WorkspaceItems {
  export interface FocalPoint {
    isMain?: boolean;      // Map/match this from the response's focus:string value. 
    focus: string;
    active: boolean;
    description: string;
  }
}
export interface GoalWorkspaceShape {
  key: string;
  title: string;
  label: string;      // from CTA
  description: string;    // from CTA
  focalPoints: WorkspaceItems.FocalPoint[];             // Do not map focal points which are 'IRRELEVANT' (??)
  path?: string;      // workspacePath, for return postbacks
  items?: { [key: string]: any };
}
export abstract class GoalWorkspaceBase implements GoalWorkspaceShape {
  constructor(...shapes: Partial<GoalWorkspaceShape>[]) {
    Object.assign(this, ...shapes);
  }
  key: string;
  title: string;
  label: string;
  description: string;
  focalPoints: WorkspaceItems.FocalPoint[];
  path?: string;      // workspacePath, for return postbacks
  items?: { [key: string]: any };     // Resp {key:string;content:any} => {key:content}
  // itemsResponse: any[];     // Unparsed; keep an unparsed copy in case extra details needed?
  abstract getPayload(...args: any[]);
  /**
   * Determine whether the key name of this workspace matches a bunch of query names. 
   * Useful for templating purposes to discriminate. 
   * @param {any} names - Array or per arg string names, to check for matches e.g. SOME_KEY_NAME
   * @returns {boolean} 
   * @memberof GoalWorkspaceBase
   */
  matchKeyName(...names: string[]): boolean {
    let key = this.key.toLowerCase();
    return names.find(name => {
      if (Array.isArray(name)) {
        return name.find(name2 => key.includes(name2.toLowerCase()));
      }
      return key.includes(name.toLowerCase());
    }) !== undefined;
  }
}