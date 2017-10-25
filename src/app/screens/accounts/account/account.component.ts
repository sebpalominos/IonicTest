import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NavParams, NavController, ModalController, ActionSheetController, LoadingController, ToastController, AlertController, Events } from 'ionic-angular';

import { LineChartUtil }  from '../../../shared/line-chart/line-chart-util';
import { Account, AccountShape } from '../shared/account.model';
import { AccountLocalInfo } from '../shared/account-data-maps';
import { SavingsGoal, SavingsGoalShape } from '../../goal-centre/shared/savings-goal.model';
import { AccountService } from '../../../core/services/account/account.service';
import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../../core/services/category/category.service';
import { CreateGoalComponent } from '../../goal-centre/create-goal/create-goal.component';
import { EditAccountComponent } from '../edit-account/edit-account.component';
import { EditGoalComponent } from '../../goal-centre/edit-goal/edit-goal.component';
import { GoalTrafficLight } from '../../goal-centre/shared/goal-misc';
import { History, HistoryDataPoint } from '../../misc/shapes/history';
import { Transaction, TransactionShape } from '../../transactions/shared/transaction.model';
import { TransactionComponent } from '../../transactions/transaction/transaction.component';
import { TransactionsComponent } from '../../transactions/transactions.component';
import { TransactionMetric } from '../../transactions/shared/transaction-metric.model';
import { TransactionService } from '../../../core/services/transaction/transaction.service';
import { INSTITUTION_COLORS } from '../../../core/data/institution/institution-color';

@Component({
    selector: 'account',
    templateUrl: 'account.component.html',
    host: {
      class: 'account-single'
    }
})
export class AccountComponent {
  account: Account;
  accountGoal: SavingsGoal;
  accountGoalTrafficLight: { [className: string]: boolean };
  categories: Category[];
  transactions: Transaction[];
  completionMetric: TransactionMetric;
  localInfo: AccountLocalInfo;
  historyDataPoints: HistoryDataPoint[];
  chartLines: LineChartUtil.DatasetInput[];
  chartLabels: (string|string[])[];
  chartOptions: any;
  hideAccountDetails: boolean;
  colorSchemeClassName: string[] = [];
  screens: { [screenName: string]: any } = { 
    createGoal: CreateGoalComponent,
    editAccount: EditAccountComponent,
    editGoal: EditGoalComponent,
    transactionList: TransactionsComponent, 
    transaction: TransactionComponent 
  };
  constructor(
    protected datePipe: DatePipe,
    protected params: NavParams, 
    protected navCtrl: NavController, 
    protected modalCtrl: ModalController,
    protected loadingCtrl: LoadingController,
    protected actionSheetCtrl: ActionSheetController,
    protected toastCtrl: ToastController,
    protected alertCtrl: AlertController,
    protected events: Events,
    protected accountService: AccountService, 
    protected categoryService: CategoryService,
    protected txnService: TransactionService ){}
  ionViewWillLoad(){
    this.hideAccountDetails = true;
    this.listenEvents();
    this.loadAccount();
  }
  showEditActionSheet(){
    let removeAccount = {
      text: 'Remove this account',
      role: 'destructive',
      handler: () => {
        this.removeAccount().then(success => {
          if (success) {
            this.toastCtrl.create({
              message: 'Account removed',
              duration: 2000,
              position: 'top'
            }).present();
          }
          else {
            let toast = this.toastCtrl.create({
              message: 'Cannot remove account',
              closeButtonText: 'Options'
            });
            toast.onDidDismiss(() => {
              let alert = this.alertCtrl.create({ 
                title: 'Saving error', 
                message: `We couldn't remove that account.`
              });
              alert.addButton({ text: 'Ignore', role: 'cancel' });
              alert.addButton({ text: 'Try again', handler: data => this.removeAccount() && true });
              alert.present();
            });
            toast.present();
          }
        })
        this.navCtrl.pop();
      }
    };
    let editAccount = {
      text: 'Edit account',
      handler: () => {
        actionSheet.dismiss().then(() => {
          this.navCtrl.push(this.screens['editAccount'], { account: this.account });
        });
        return false;
      }
    };
    let cancel = {
      text: 'Cancel',
      role: 'cancel'
    };
    let actionSheet = this.actionSheetCtrl.create({
      title: this.account.preferredName(),
      buttons: [removeAccount, editAccount, cancel]
    });
    actionSheet.present();
  }
  private loadAccount() {
    this.retrieveAccount().then((account: Account) => {
      this.account = account;
      if (account.institution) {
        this.colorSchemeClassName.push(`insto-colorscheme-${account.institution.slug}`);
      }
      this.retrieveMetric().then((metric: TransactionMetric) => {
        this.completionMetric = metric;
      });
      this.retrieveLocalInfo().then((info: AccountLocalInfo) => {
        this.localInfo = info;
      });
      // this.retrieveCategories(account);
      // this.retrieveBalanceHistory(account);
    }).catch(err => {
      console.error(err);
      debugger;
    });
  }
  private retrieveAccount(): Promise<Account>{
    // NavParams should have the requested account ID
    // Or even better, the account object itself
    if (this.params.get('account')){
      this.account = this.params.get('account');
      return Promise.resolve(this.account);
    }
    else if (this.params.get('id')){
      let loading = this.loadingCtrl.create({ content: 'Loading Account' });
      loading.present();
      let accountId = this.params.get('id');
      return this.accountService.getAccount(accountId).then(account => {
        loading.dismiss();
        return account;
      });
    }
  }
  private removeAccount(): Promise<boolean> {
    let accountId = this.account.id;
    return this.accountService.removeAccount(accountId).then(resp => {
      if (resp.success) {
        this.events.publish('accounts:removedAccount', accountId);
      }
      return resp.success;
    }).catch(err => {
      console.error(err);
      return false;
    });
  }
  private retrieveMetric(): Promise<TransactionMetric> {
    return this.accountService.getCategorisationMetric(this.account.id).catch(err => {
      console.error(err);
    });
  }
  private retrieveLocalInfo(): Promise<AccountLocalInfo> {
    return this.accountService.getAccountLocalInformation(this.account.id).catch(err => {
      console.error(err);
    });
  }
  private listenEvents() {
    this.events.subscribe('accounts:savedLocalInfo', accountId => {
      if (this.account.id === accountId) {
        this.retrieveLocalInfo().then(info => {
          this.localInfo = info;
        });
      }
    });
  }
  /** Set data for the line chart – from this.historyDataPoints */
  private setChartData(history: History){
    let chartDataBalance = <LineChartUtil.DatasetInput> {
      label: 'Account Balance',
      data: history.dataPoints.map((dataPoint, index) => dataPoint.valueActual),
      borderColor: '#3498db',
      pointBackgroundColor: '#fff',
      borderCapStyle: 'round',
      pointRadius: 1,
      pointHitRadius: 10,
    };
    // X-axis labels are generated corresponding to months; There is only a single trend
    this.chartLabels = history.dataPoints.map(dataPoint => this.datePipe.transform(dataPoint.date, 'd/M'));
    this.chartLines = [ chartDataBalance ];
  }
  /** Set options for the line chart */
  private setChartOptions(history: History){
    let yTickConfig = LineChartUtil.calculateYAxisTicks(history.dataPoints);
    this.chartOptions = {
      scales: {
        yAxes: [{ type: 'linear', ticks: yTickConfig }]
      }
    }
  }
}