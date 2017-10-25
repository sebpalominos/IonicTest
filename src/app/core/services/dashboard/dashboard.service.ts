import { Injectable } from '@angular/core';
import { InsightsHttpService } from '../insights-http/insights-http.service';
import { Storage } from '@ionic/storage';

import { CashflowListResponse } from '../../data/dashboard/dashboard-response';
import { CashflowInfo } from '../../../screens/categories/shared/cashflow-data-maps';

@Injectable()
export class DashboardService {
  constructor(
    protected http: InsightsHttpService,
    protected storage: Storage
  ) {}
  getCashflow(): Promise<CashflowInfo[]> {
    let endpoint = [ 'dashboard', 'cashflow' ];
    return this.http.get(endpoint).toPromise().then(resp => {
      let body: CashflowListResponse = resp.json();
      return Object.keys(body).map(keyName => (<CashflowInfo>{
        identifier: body[keyName].identifier,
        value: body[keyName].value.amount,
        isCredit: body[keyName].flow === 'CREDIT'
      }));
    });
  }
}