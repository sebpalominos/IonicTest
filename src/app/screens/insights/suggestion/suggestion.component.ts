import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, AlertController } from 'ionic-angular';

import { Suggestion } from '../shared/suggestion.model';

// A suggestion could end up calling any one of these components...
import { AccountComponent } from '../../accounts/account/account.component';
import { CategoryComponent } from '../../categories/category/category.component';
import { CreateGoalComponent } from '../../goal-centre/create-goal/create-goal.component';
import { PropertyComponent } from '../../property-centre/property/property.component';
import { PropertyShortlistComponent } from '../../property-centre/property-shortlist/property-shortlist.component';
import { TransactionsComponent } from '../../transactions/transactions.component';

@Component({
  selector: 'modal-suggestion',
  templateUrl: 'suggestion.html'
})
export class SuggestionComponent {
  suggestion: Suggestion;
  screens: { [screenName: string]: any } = {
    account: AccountComponent,
    category: CategoryComponent,
    createGoal: CreateGoalComponent,
    property: PropertyComponent,
    propertyShortlist: PropertyShortlistComponent,
    transactionList: TransactionsComponent
  };
  constructor(public params: NavParams, public navCtrl: NavController, public viewCtrl: ViewController, public alertCtrl: AlertController) {}
  ngOnInit(){
    this.retrieveSuggestion()
      .then((sug: Suggestion) => {
        this.suggestion = sug;
      });
  }
  followSuggestion(){
    if (this.suggestion.actionComponent && this.screens.hasOwnProperty(this.suggestion.actionComponent)){
      this.navCtrl.push(this.screens[this.suggestion.actionComponent], this.suggestion.actionData || {});
    }
    else {
      let alert = this.alertCtrl.create({ 
        title: 'Watch this space', 
        message: 'Thanks for your interest! This functionality is only available in our closed beta.'
      });
      alert.addButton('OK');
      alert.addButton({
        text: 'Close',
        handler: () => this.viewCtrl.dismiss() && true
      });
      alert.present();
    }
  }
  private retrieveSuggestion() : Promise<Suggestion> {
    if (this.params.get('suggestion')) {
      return Promise.resolve(this.params.get('suggestion'));
    }
    else {
      // Go look it up...
      // STUB:
      return Promise.resolve(new Suggestion());
    }
  }
}
