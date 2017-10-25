import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, AlertController, ActionSheetController, LoadingController } from 'ionic-angular';

import { GoalShape, GoalBase } from '../shared/goal.model';
import { CreateGoalScreenFlow } from '../shared/goal-misc';
import { GoalProsePrompt, GoalProseSelectableValue } from '../shared/goal-prose-prompt.model';
import { GoalService } from '../../../core/services/goal/goal.service';

import { CreateGoalBaseComponent } from './create-goal-base.component';
import { CreateGoalLinkAccountComponent } from './create-goal-link-account.component';

type ProseDisplayStateValue = 'NOT_READY' | 'READY' | 'STARTED' | 'FINISHED';
type ProseDisplay = Partial<{
  activePrompt: GoalProsePrompt;    // Used for active display
  prompts: GoalProsePrompt[];       // Used for list display, deals with sentence continuation scenarios
  userInput: string;
  hasSelectableValues: boolean;
  selectableValues: GoalProseSelectableValue[];
}>;

@Component({
  selector: 'scr-create-goal-prose',
  templateUrl: 'create-goal-prose.html',
  host: {
    class: 'create-goal create-goal-prose'
  }
})
export class CreateGoalProseComponent extends CreateGoalBaseComponent {
  activePassage: ProseDisplay;
  otherPassages: ProseDisplay[];
  proseDisplayState: ProseDisplayStateValue;
  showSubmittingProse: boolean;
  showLoadingError: boolean;
  readonly onKeyboardShow = function() {
    console.log('keyboard shown in goal prose');
  };
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected alertCtrl: AlertController,
    protected loadingCtrl: LoadingController,
    protected actionSheetCtrl: ActionSheetController,
    protected goalService: GoalService
  ) { super(params, navCtrl, actionSheetCtrl) }
  ionViewWillLoad() {
    this.currentScreenFlowStage = CreateGoalScreenFlow.Prose;
    this.activePassage = null;
    this.otherPassages = [];
    this.proseDisplayState = 'NOT_READY';
  }
  ionViewDidLoad() {
    this.loadInitialProse();
    window.addEventListener('native.keyboardshow', this.onKeyboardShow);
  }
  ionViewWillLeave() {
    window.removeEventListener('native.keyboardshow', this.onKeyboardShow);
  }
  submitProse() {
    if (this.activePassage) {
      this.showSubmittingProse = true;
      // Grab the active prose and rinse it through validation.
      let input = this.activePassage.userInput || '';
      let setting = this.activePassage.activePrompt.setting;
      try {
        // Failed validation should throw.
        setting.mapResponse(input);
      }
      catch (err) {
        this.alertCtrl.create({ 
          title: 'Input Validation', 
          message: 'Something you typed in doesn\'t quite make sense. Please check your input.',
          buttons: ['OK']
        }).present();
        this.showSubmittingProse = false;
        return;
      }
      // Consolidate passages now, ahead of submisson.
      this.consolidateActivePassage();
      // Extract the payload object, then send to the
      // submission service, and retrieve the next active.
      let payload = setting.getPayload();
      this.goalService.submitGoalProseResponse(this.goalTypeIdentifier, payload)
        .then(cont => {
          if (cont.complete) {
            // In a completion scenario, bump the state counters, and move
            // activePassage into otherPassages;
            this.otherPassages.reverse();
            this.proseDisplayState = 'FINISHED';
          }
          else {
            // Consolidate activePrompt into otherPrompts, and add 
            // ellipses to denote 'no line breaks'. Then assign the 
            // new Next as activePassage.
            this.proseDisplayState = 'STARTED';
            this.activePassage = { activePrompt: cont.next };
          }
          this.showSubmittingProse = false;
        })
        .catch(err => {
          console.error(err);
          this.showSubmittingProse = false;          
        });
    }
    else {
      console.warn('Submit Prose was called but there was no active passage.');
    }
  }
  close() {
    // Any cleanup?
    super.close();
  }
  next() {
    super.next(CreateGoalLinkAccountComponent);
  }
  proseActive() {
    return this.proseDisplayState 
      && Boolean(~['READY', 'STARTED'].indexOf(this.proseDisplayState));
  }
  proseFinished() {
    return this.proseDisplayState 
      && Boolean(~['FINISHED'].indexOf(this.proseDisplayState));
  }
  getSelectedValueExplainer() {
    if (this.activePassage.userInput && Array.isArray(this.activePassage.selectableValues)) {
      let selectableValue = this.activePassage.selectableValues.find(sv => sv.value === this.activePassage.userInput);
      if (selectableValue) {
        return selectableValue.explainer;
      }
    }
  }
  consolidateActivePassage(clearActive: boolean = true) {
    this.consolidatePassage(this.activePassage);
    if (clearActive) {
      this.activePassage = null;
    }
  }
  /**
   * Moves activePassage into otherPassages, observing line break rules etc.
   * @private
   * @param {boolean} [clearActive=true] - Do we want to set activePassage to empty as well
   * @memberOf CreateGoalProseComponent
   */
  private consolidatePassage(passage: ProseDisplay) {
    // Move the activePrompt into the prompts array, because the history display 
    // uses the prompts array to do its rendering
    let prompt = passage.activePrompt;
    passage.prompts = [ prompt ];
    if (prompt.setting.lineBreakAtStart) {
      // Insert this as a new list item, prepending.
      this.otherPassages.unshift(passage);
    }
    else {
      // Mash it into the previous list item, if that item exists,
      // or else go ahead and prepend it anyway
      if (this.otherPassages.length) {
        this.otherPassages[0].prompts.push(passage.activePrompt);
      }
      else {
        this.otherPassages.unshift(passage);
      }
    }

  }
  /**
   * Load initial prose
   * @private
   * @memberOf CreateGoalProseComponent
   */
  private loadInitialProse() {
    // Grab/prefetch the first piece of prose
    let loading = this.loadingCtrl.create({ content: 'Loading' });
    loading.present();
    this.goalService.getNextGoalProse(this.goalTypeIdentifier).then(cont => {
      if (cont.complete) {
        // Started as complete; bump to next screen
        this.loadAllExistingProse().then(numPassagesLoaded => {
          loading.dismiss();
          this.otherPassages.reverse();
          this.proseDisplayState = 'FINISHED';        
        });
        // this.next();
      }
      else {
        loading.dismiss();
        this.loadAllExistingProse(); 
        let prompt = cont.next;
        this.activePassage = { 
          activePrompt: prompt,
          hasSelectableValues: !!prompt.setting.selectableValues,
          selectableValues: prompt.setting.selectableValues || null
        };
        this.proseDisplayState = 'STARTED';
      }
    }).catch(err => {
      loading.dismiss();
      this.showLoadingError = true;
      console.error(err);
    });
  }
  private loadAllExistingProse(): Promise<number> {
    return this.goalService.getExistingGoalProse(this.goalTypeIdentifier).then(prompts => {
      // Repeatedly map each prompt into consolidatePassage()
      let passages = prompts.map(prompt => {
        return <ProseDisplay> { activePrompt: prompt };
      });
      passages.forEach(passage => {
        this.consolidatePassage(passage);
      });
      return passages.length;
    });
  }
}