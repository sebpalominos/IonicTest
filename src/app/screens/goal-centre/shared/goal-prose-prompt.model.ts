import { GoalType, GoalTypeShape } from './goal-type.model';
import { GoalSetting, GoalSettingShape } from './goal-setting.model';
import { TimeScaleType } from '../../../core/data/shared/constant-types';
import { GoalResponseValues, GoalProseResponse, GoalProseSettingResponse } from '../../../core/data/goal/goal-response';

export interface GoalProsePromptShape {
  // settings: GoalSettingShape[];
  setting: GoalSettingShape;
  type: GoalTypeShape;
  blocks: GoalProseBlockShape[];
}
export class GoalProsePrompt implements GoalProsePromptShape {
  constructor(...shapes: Partial<GoalProsePromptShape>[]) {
    Object.assign(this, ...shapes);
  }
  type: GoalType;
  // settings: GoalSetting[];
  /** The next goal setting you should display */
  setting: GoalProseSettingBase;
  /** Blocks of historical prompts/response */
  blocks: GoalProseBlockShape[];
  static createFromResponse(resp: GoalProseResponse): GoalProsePrompt {
    // ================================================
    // Find the first item with 'inputRequired' setting
    // ================================================
    let nextSettingResponse = resp.settings.find(setting => setting.inputRequired);
    if (nextSettingResponse) {
      return new GoalProsePrompt(<GoalProsePromptShape> {
        type: GoalType.createFromResponse(resp.goalHeader),
        setting: this.createSettingFromResponse(nextSettingResponse),
        blocks: <GoalProseBlockShape[]> resp.blocks
      });
    }
    return null;
  }
  static createListFromResponse(resp: GoalProseResponse, includeInputRequired: boolean = true): GoalProsePrompt[] {
    // ==============================
    // Return all settings, nofilter
    // ==============================
    return resp.settings.filter(setting => {
      // Either onlyNoInputRequired, or the input must not actually be required, i.e. 
      // only show finished settings unless overriden.
      return includeInputRequired || setting.inputRequired === false;
    }).map(setting => {
      return new GoalProsePrompt(<GoalProsePromptShape> {
        type: GoalType.createFromResponse(resp.goalHeader),
        setting: this.createSettingFromResponse(setting),
        blocks: <GoalProseBlockShape[]> resp.blocks
      });
    });
  }
  private static createSettingFromResponse(setting: GoalProseSettingResponse) {
    switch (setting.dataType) {
      case 'MONEY':
        return GoalProseMoneySetting.createFromResponse(setting);
      case 'MONTHS':
        return GoalProseTimeSetting.createFromResponse(setting, TimeScaleType.Monthly);
      case 'OBJECT':
      default:
        return GoalProseObjectSetting.createFromResponse(setting);
    }
  }
}
// ================================
// Goal Prose Prompt subcomponents
// ================================
export interface GoalProseBlockShape {
  preText: string;
  postText: string;
  lineBreakAtStart: boolean;
}
export interface GoalProseSelectableValue {
  value: string;
  description: string;
  explainer: string;
}
export interface GoalProseSettingShape {
  selectableValues: GoalProseSelectableValue[];
  preText: string;
  postText: string;
  questionText: string;
  lineBreakAtStart: boolean;
  validations?: any;
}
export interface GoalProseObjectSettingShape {
  value: {
    savingFor: string;
    status: GoalResponseValues.ProseStatus;
  };
}
// Goal Prose setting :: TIME
export interface GoalProseTimeSettingShape {
  value: {
    value: number;  
  }
  timeScale: TimeScaleType;
  // valueStatus: GoalResponseValues.ProseStatus;
}
// Goal Prose setting :: MONEY
export interface GoalProseMoneySettingShape {
  value: {
    amount: number;
    currencyCode: string;
    status: GoalResponseValues.ProseStatus;
  }
}
// =====================================
// Goal Prose Prompt::Setting components
// =====================================
/**
 * Base class and method signatures for any GoalProse*Setting
 * @abstract
 * @class GoalProseSettingBase
 * @implements {GoalSettingShape}
 * @implements {GoalProseSettingShape}
 */
export abstract class GoalProseSettingBase implements GoalSettingShape, GoalProseSettingShape {
  type: string;
  explainer: string;
  selectableValues: GoalProseSelectableValue[];
  preText: string;
  postText: string;
  questionText: string;
  lineBreakAtStart: boolean;
  validations?: any;
  abstract mapResponse(...values: any[]);
  abstract getPayload(...overrides: any[]): any;
  abstract displayValue(): string;
  protected performValidation(dirtyValues: { [dirtyKey: string]: string }) {
    Object.keys(dirtyValues).forEach(dirtyKey => {
      // Wrapping in string constructor only to shut the TypeScript linter up.
      // let dirtyValue = String(key.split('.').reduce((prev, curr) => {
      //   return prev.hasOwnProperty(curr) ? prev[curr] : null;
      // }, this));
      if (this.validations && this.validations[dirtyKey]) {
        let validationRegexString: string = this.validations[dirtyKey];
        // Hack: Remove unhelpful slashes
        if (validationRegexString.startsWith('/')) {
          validationRegexString = validationRegexString.substring(1);
        }
        if (validationRegexString.endsWith('/')) {
          validationRegexString = validationRegexString.substring(0, validationRegexString.length-1);
        }
        let dirtyValue = dirtyValues[dirtyKey];
        if (!dirtyValue.match(new RegExp(validationRegexString))) {
          throw 'Failed regex validation: ' + dirtyKey + '[' + dirtyValue + '] failed ' + validationRegexString;
        }
      }
    });
  }
}
/**
 * Prose setting for an Object type
 * @export
 * @class GoalProseObjectSetting
 * @implements {GoalSettingShape}
 * @implements {GoalProseSettingShape}
 * @implements {GoalProseObjectSettingShape}
 */
export class GoalProseObjectSetting extends GoalProseSettingBase implements GoalProseObjectSettingShape {
  value: {
    savingFor: string;
    status: GoalResponseValues.ProseStatus;
  }
  constructor(...shapes: Partial<GoalSettingShape&GoalProseSettingShape&GoalProseObjectSettingShape>[]) {
    super();
    Object.assign(this, ...shapes);
  }
  mapResponse(savingForResponse: string) {
    super.performValidation({ 'value.savingFor': savingForResponse });
    this.value.savingFor = savingForResponse;
  }
  getPayload(savingFor?: string): any {
    return {
      [this.type]: { savingFor: savingFor || this.value.savingFor }
    };
  }
  displayValue(): string {
    return this.value.savingFor;
  }
  static createFromResponse(resp: GoalProseSettingResponse): GoalSetting {
    return new GoalProseObjectSetting(<GoalSettingShape&GoalProseSettingShape&GoalProseObjectSettingShape> {
      type: resp.type,
      explainer: resp.explainer,
      selectableValues: resp.selectableValues,
      preText: resp.preText,
      postText: resp.postText,
      questionText: resp.questionText,
      lineBreakAtStart: resp.lineBreakAtStart,
      validations: resp.validations,
      value: {
        savingFor: resp.value.savingFor,
        status: resp.value.status,
      }    
    });
  }
}
/**
 * Prose setting for a Time type
 * @export
 * @class GoalProseTimeSetting
 * @implements {GoalSettingShape}
 * @implements {GoalProseSettingShape}
 * @implements {GoalProseTimeSettingShape}
 */
export class GoalProseTimeSetting extends GoalProseSettingBase implements GoalProseTimeSettingShape {
  value: {
    value: number; 
  };
  timeScale: TimeScaleType;
  // valueStatus: GoalResponseValues.ProseStatus;
  constructor(...shapes: Partial<GoalSettingShape&GoalProseSettingShape&GoalProseTimeSettingShape>[]) {
    super();
    Object.assign(this, ...shapes);
  }
  mapResponse(timeValueResponse: string) {
    super.performValidation({ 'value': timeValueResponse });
    this.value.value = Number(timeValueResponse);
  }
  getPayload(timeValue?: number): any {
    return {
      [this.type]: timeValue || this.value.value
    };
  }
  displayValue(): string {
    return String(this.value.value).trim();
  }
  static createFromResponse(resp: GoalProseSettingResponse, timeScale: TimeScaleType): GoalSetting {
    return new GoalProseTimeSetting(<GoalSettingShape&GoalProseSettingShape&GoalProseTimeSettingShape> {
      type: resp.type,
      explainer: resp.explainer,
      selectableValues: resp.selectableValues,
      preText: resp.preText,
      postText: resp.postText,
      questionText: resp.questionText,
      lineBreakAtStart: resp.lineBreakAtStart,
      timeScale: timeScale,
      validations: resp.validations,
      value: {
        value: resp.value.value,
      }
      // valueStatus: resp.value.status,
    });
  }
}
/**
 * Prose setting for money type
 * @export
 * @class GoalProseMoneySetting
 * @implements {GoalSettingShape}
 * @implements {GoalProseSettingShape}
 * @implements {GoalProseMoneySettingShape}
 */
export class GoalProseMoneySetting extends GoalProseSettingBase implements GoalProseMoneySettingShape {
  value: {
    amount: number;
    currencyCode: string;
    status: GoalResponseValues.ProseStatus;
  }
  constructor(...shapes: Partial<GoalSettingShape&GoalProseSettingShape&GoalProseMoneySettingShape>[]) {
    super();
    Object.assign(this, ...shapes);
  }
  mapResponse(amountResponse: string, currencyCode: string = 'AUD') {
    super.performValidation({ 'value.amount': amountResponse });
    this.value.amount = Number(amountResponse);
  }
  getPayload(amount?: number, currencyCode: string = 'AUD'): any {
    return {
      [this.type]: {
        amount: amount || this.value.amount,
        currencyCode: currencyCode || this.value.currencyCode || 'AUD'
      }
    };
  }
  displayValue(): string {
    return `${this.value.currencyCode||'$'}${this.value.amount}`;
  }
  static createFromResponse(resp: GoalProseSettingResponse): GoalSetting {
    return new GoalProseMoneySetting(<GoalSettingShape&GoalProseSettingShape&GoalProseMoneySettingShape> {
      type: resp.type,
      explainer: resp.explainer,
      selectableValues: resp.selectableValues,
      preText: resp.preText,
      postText: resp.postText,
      questionText: resp.questionText,
      lineBreakAtStart: resp.lineBreakAtStart,
      validations: resp.validations,
      value: {
        amount: resp.value.amount,
        currencyCode: resp.value.currencyCode,
        status: resp.value.status,
      }
    });
  }
}