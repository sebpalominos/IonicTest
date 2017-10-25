import { Component, Input } from '@angular/core';
import { ModalController, Events } from 'ionic-angular';

import { OpiconParams, OpiconSize } from '../../../../shared/opc-icon/opc-icon-type';
import { Suggestion } from '../../../insights/shared/suggestion.model';
import { UserService } from '../../../../core/services/user/user.service';

type SuggestionDisplayItem = {
  suggestion: Suggestion;
  opicon?: OpiconParams;
  ionicon?: string;
  thumbnail?: string;     // URL to image
};

@Component({
  selector: 'home-suggestions',
  templateUrl: 'home-suggestions.html',
  host: {
    class: 'opc-home-suggestions card-slider'
  }
})
export class HomeSuggestionsComponent {
  @Input() screens: { [screenName: string]: any };
  suggestionItems: SuggestionDisplayItem[];
  constructor(
    public events: Events,
    public modalCtrl: ModalController, 
    private userService: UserService
  ){}
  ngOnInit(){
    // this.userService
    //   .getSuggestions()
    //   .then((suggestions: Suggestion[]) => {
    //     this.suggestionItems = suggestions.map(suggestion => {
    //       let { opicon, ionicon, thumbnail } = this.getAssignedIcon(suggestion);
    //       return { suggestion, opicon, ionicon, thumbnail };
    //     });
    //   })
    //   .then(() => {
    //     setTimeout(() => {
    //       // This will execute outside of current digest cycle (or whatever its called in Angular 2)
    //       this.events.publish('slider:init', ['slider-home-suggestions']);
    //     }, 0);
    //   });
  }
  viewSuggestion(suggestion: Suggestion){
    this.modalCtrl.create(this.screens['suggestion'], { suggestion }).present();
  }
  hideSuggestion(suggestionItem: SuggestionDisplayItem) {
    debugger;
    let index = this.suggestionItems.findIndex(item => suggestionItem === item);
    if (index) {
      this.suggestionItems.splice(index, 1);
    }
  }
  /**
   * Find the most appropriate icon to display against the suggestion
   * THE ICONATOR
   */
  private getAssignedIcon(suggestion: Suggestion) : { opicon?: OpiconParams; ionicon?: string; thumbnail?: string } {
    // Step 1: If this is a targeted suggestion, possibly it has a thumbnail 
    // e.g. Existing property goal or personal goal
    if (suggestion.actionData) {
      if (suggestion.actionData.hasOwnProperty('personalGoal')) {
        return { thumbnail: suggestion.foregroundImageUrl };
      }
    }
    // Step 2: See if the action has a directly corresponding icon
    if (suggestion.actionComponent) {
      switch (suggestion.actionComponent) {
        case 'CreateGoal':
        case 'AcquireInsuranceTPD':
          return { opicon: { set: 'job', name: '037-target-1' } };
        case 'CreateSpendingLimitTactic':
        case 'CreateSurplusTactic':
          return { opicon: { set: 'business', name: 'graph-4' } };
        case 'NewBankingTransfer':
          return { opicon: { set: 'business', name: 'get-money' } };
        case 'ReviewConsolidateDebt':
          return { opicon: { set: 'business', name: 'stamp-1' } };
        case 'ReviewRetirementStrategy':
          return { opicon: { set: 'business', name: 'presentation-14' } };
        case 'ReviewSuperPayments':
          return { opicon: { set: 'essential', name: 'map-location' } };
        case 'NewInsuranceTPD':
          return { opicon: { set: 'essential', name: 'umbrella' } };
        case 'CreateLumpSumStrategy':
          return { opicon: { set: 'business', name: 'coin' } };
        case 'ConsolidateSuper':
          return { opicon: { set: 'essential', name: 'layers-1' } };	
      }
    }
    // Step 3: Wade through any tags to dredge out any useful icons
    if (suggestion.tags) {
      for (let tag of suggestion.tags) {
        switch (tag) {
          case 'offset':
            return { opicon: { set: 'business', name: 'time-passing' } };
          case 'retirement':
            return { opicon: { set: 'business', name: 'presentation-14' } };
          case 'insurance':
          case 'tpd':
            return { opicon: { set: 'essential', name: 'umbrella' } };
        }
      }
    }
    return {};
  }
}