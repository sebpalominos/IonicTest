import { Component, Input } from '@angular/core';
import { Events, NavController, ModalController, ActionSheetController, ActionSheet } from 'ionic-angular';

import { Account } from '../../../accounts/shared/account.model';
import { SavingsGoal } from '../../../goal-centre/shared/savings-goal.model';
import { AccountService } from '../../../../core/services/account/account.service';
import { Category } from '../../../categories/shared/category.model';
import { CategoryService } from '../../../../core/services/category/category.service';

type AccountDisplay = {
  account: Account; 
  categories: Category[];
  iconStyles: { [cssProp: string]: string }
};
type AccountInfo = { 
  account: Account; 
  categories: Category[];
};
type ActionSheetButton = {text: string; role?: string; handler: Function};

@Component({
  selector: 'home-accounts',
  templateUrl: 'home-accounts.html',
  host: {
    class: 'opc-home-accounts card-slider'
  }
})
export class HomeAccountsComponent {
  @Input() screens: { [screenName: string]: any };
  accounts: AccountDisplay[];
  constructor(
    public events: Events,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public actionSheetCtrl: ActionSheetController,
    private accountService: AccountService,
    private categoryService: CategoryService,
  ){}
  ngOnInit(){
    let loadAccounts = this.accountService
      .getAccounts()
      .then(this.mapCategories.bind(this))      
      .then(this.mapDisplay.bind(this))
      .then(() => {
      setTimeout(() => {
        // This will execute outside of current digest cycle (or whatever its called in Angular 2)
        this.events.publish('slider:init', ['slider-home-accounts']);
      }, 0);
    });
  }
  /** Show options for an account with variable buttons in the list */
  showOptions(account: Account){
    let actionSheet = this.actionSheetCtrl.create();
    actionSheet.addButton({
      text: 'View account',
      handler: () => {
        actionSheet.dismiss().then(() => this.navCtrl.push(this.screens['account'], { account }) );
        return false;
      }
    });
    actionSheet.addButton({
      text: 'Create saving target',
      handler: () => { 
        let goalType = 'saving';
        actionSheet.dismiss().then(() => this.modalCtrl.create(this.screens['createGoal'], { goalType }).present() );
        return false;
      }
    });
    if (account.type === 'OPC_AC_MORT'){      // && TODO: is not already linked to a mortgage
      actionSheet.addButton({
        text: 'Link your property',
        handler: () => { console.log('LP clicked') }
      });
    }
    actionSheet.addButton({
      text: 'Cancel',
      role: 'cancel'
    });
    actionSheet.present();
  }
  private mapCategories(accounts: Account[]): Promise<AccountInfo[]> {
    // let categories: Promise<Category[]>[] = accounts.map(ac => {
    //   return this.categoryService.getCategoriesForAccount(ac.id);
    // });
    // return Promise.all(categories).then(cties => {
    //   return accounts.map((ac, index) => ({
    //     account: ac,
    //     categories: cties[index]
    //   }));
    // });
    return Promise.resolve([]);
  }
  private mapDisplay(accountInfo: AccountInfo[]){
    this.accounts = accountInfo.map(info => {
      let logoUrl = info.account.institution ? info.account.institution.logoUrl : '';      
      let iconStyles = logoUrl ? { 'background-image': `url('${logoUrl}')` } : { 'background-image': `url('../assets/img/logos/opica.png')` }; 

      return {
        account: info.account,
        categories: info.categories,
        iconStyles
      };
    });
  }
}