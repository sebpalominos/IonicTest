import { Component, Input } from '@angular/core';
import { Events, NavController, ModalController, ActionSheetController, ActionSheet } from 'ionic-angular';

import { GoalBase } from '../../../goal-centre/shared/goal.model';
import { GoalService } from '../../../../core/services/goal/goal.service';
import { GoalCentreComponent } from '../../../goal-centre/goal-centre.component';
// import { Category } from '../../categories/shared/category.model';
// import { CategoryService } from '../../../core/services/category/category.service';

type GoalsDisplay = {
  goal: GoalBase; 
  iconStyles: { [cssProp: string]: string }
};
type ActionSheetButton = {text: string; role?: string; handler: Function};

@Component({
  selector: 'home-goals',
  templateUrl: 'home-goals.html',
  host: {
    class: 'opc-home-goals card-slider'
  }
})
export class HomeGoalsComponent {
  @Input() screens: { [screenName: string]: any };
  goals: GoalsDisplay[];
  constructor(
    public events: Events,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public actionSheetCtrl: ActionSheetController,
    private goalService: GoalService,
    // private categoryService: CategoryService,
  ){}
  ngOnInit(){
  }

  /**
   * Set the navroot to the goal centre
   */
  seeAllAction(){
    this.navCtrl.setRoot(GoalCentreComponent);
  }
  /** Show options for an account with variable buttons in the list */
  showOptions(goal: GoalBase){
    let actionSheet = this.actionSheetCtrl.create();
    actionSheet.addButton({
      text: 'View account',
      handler: () => {
        actionSheet.dismiss().then(() => this.navCtrl.push(this.screens['goal'], { goal }) );
        return false;
      }
    });
    actionSheet.addButton({
      text: 'Cancel',
      role: 'cancel'
    });
    actionSheet.present();
  }
  // private mapCategories(accounts: Account[]): Promise<AccountInfo[]> {
  //   let categories: Promise<Category[]>[] = accounts.map(ac => {
  //     return this.categoryService.getCategoriesForAccount(ac.id);
  //   });
  //   return Promise.all(categories).then(cties => {
  //     return accounts.map((ac, index) => ({
  //       account: ac,
  //       categories: cties[index]
  //     }));
  //   });
  // }
}