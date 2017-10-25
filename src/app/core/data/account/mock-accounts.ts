import { AccountShape } from '../../../screens/accounts/shared/account.model';
import { InstitutionShape } from '../../../screens/onboarding/shared/institution.model';
import { History, HistoryDataPoint } from '../../../screens/misc/shapes/history';
import { TimeScaleType } from '../../../core/data/shared/constant-types';

export const ACCOUNTS: AccountShape[] = [{ 
    id: 3, 
    name: 'Fixed rate home loan', 
    nickname: 'Our Mortgage',
    bsb: '032285', 
    accountNumber: '2XXXX6', 
    holder: 'James Chen and Jessica J Li', 
    type: 'OPC_AC_MORT', 
    balanceId: 3,
    institutionId: 121,
    isDisconnected: false,
    isSyncing: false,
}, { 
    id: 1, 
    name: 'Westpac Choice', 
    nickname: 'Choice Account',
    bsb: '732285', 
    accountNumber: '2XXXX6', 
    holder: 'James Chen', 
    type: 'OPC_AC_TXNL', 
    balanceId:  1,
    institutionId: 121,
    isDisconnected: false,
    isSyncing: false,
}, { 
    id: 2, 
    name: 'Westpac eSaver', 
    nickname: 'James\'s Savings',
    bsb: '032285', 
    accountNumber: '1XXXX6', 
    holder: 'James Chen', 
    type: 'OPC_AC_SVNG',
    balanceId:  4,
    institutionId: 121,
    isDisconnected: false,
    isSyncing: false,
}, { 
    id: 4, 
    name: 'Term Deposit', 
    nickname: 'Term Deposit',
    bsb: '062246',
    accountNumber: '23XXXX16',
    holder: 'James X Chen and Jessica J Li', 
    type: 'OPC_AC_SVNG', 
    balanceId: 5,
    institutionId: 28,
    isDisconnected: false,
    isSyncing: false,
}];

export const BALANCES: {[id: string]: History} = {
  Weekly: <History> { 
    timeScale: TimeScaleType.Weekly, 
    dataPoints: [
      <HistoryDataPoint> { valueActual: 2200, date: new Date('2016-12-04T00:00:00+11:00'), label: 'Week starting 4th Dec 2016' },
      <HistoryDataPoint> { valueActual: 2100, date: new Date('2016-12-11T00:00:00+11:00'), label: 'Week starting 11th Dec 2016' },
      <HistoryDataPoint> { valueActual: 2151, date: new Date('2016-12-18T00:00:00+11:00'), label: 'Week starting 18th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1800, date: new Date('2016-12-25T00:00:00+11:00'), label: 'Week starting 25th Dec 2016' },
    ],
  },
  Daily: <History>{
    timeScale: TimeScaleType.Weekly, 
    dataPoints: [
      <HistoryDataPoint> { valueActual: 1120.00, date: new Date('2016-12-04T00:00:00+11:00'), label: '4th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1120.00, date: new Date('2016-12-05T00:00:00+11:00'), label: '5th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1120.00, date: new Date('2016-12-06T00:00:00+11:00'), label: '6th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1160.00, date: new Date('2016-12-07T00:00:00+11:00'), label: '7th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1160.00, date: new Date('2016-12-08T00:00:00+11:00'), label: '8th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1460.00, date: new Date('2016-12-09T00:00:00+11:00'), label: '9th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1900.00, date: new Date('2016-12-10T00:00:00+11:00'), label: '10th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1921.50, date: new Date('2016-12-11T00:00:00+11:00'), label: '11th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1700.00, date: new Date('2016-12-12T00:00:00+11:00'), label: '12th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1700.00, date: new Date('2016-12-13T00:00:00+11:00'), label: '13th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1600.00, date: new Date('2016-12-14T00:00:00+11:00'), label: '14th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1600.00, date: new Date('2016-12-15T00:00:00+11:00'), label: '15th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1800.00, date: new Date('2016-12-16T00:00:00+11:00'), label: '16th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1900.00, date: new Date('2016-12-17T00:00:00+11:00'), label: '17th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1940.00, date: new Date('2016-12-18T00:00:00+11:00'), label: '18th Dec 2016' },
      <HistoryDataPoint> { valueActual: 1912.10, date: new Date('2016-12-19T00:00:00+11:00'), label: '19th Dec 2016' },
      <HistoryDataPoint> { valueActual: 2600.00, date: new Date('2016-12-20T00:00:00+11:00'), label: '20th Dec 2016' },
      <HistoryDataPoint> { valueActual: 2600.00, date: new Date('2016-12-21T00:00:00+11:00'), label: '21st Dec 2016' },
      <HistoryDataPoint> { valueActual: 2600.00, date: new Date('2016-12-22T00:00:00+11:00'), label: '22nd Dec 2016' },
    ],
  }
};