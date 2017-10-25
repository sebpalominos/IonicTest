import { SearchResult } from './search-types';

export const SEARCH_RESULTS: SearchResult[] = [
  {
    screen: 'account',
    params: { id: 1 },
    icon: { type: 'opc-icon', name: 'wallet-1', set: 'business' },
    nameLabel: 'Westpac Choice',
    typeLabel: 'Account'
  },
  {
    screen: 'account',
    params: { id: 2 },
    icon: { type: 'opc-icon', name: 'wallet-1', set: 'business' },
    nameLabel: 'Westpac eSaver',
    typeLabel: 'Account'
  },
  {
    screen: 'account',
    params: { id: 3 },
    icon: { type: 'opc-icon', name: 'wallet-1', set: 'business' },
    nameLabel: 'Fixed Rate Mortgage',
    typeLabel: 'Account'
  },
  {
    screen: 'account',
    params: { id: 4 },
    icon: { type: 'opc-icon', name: 'wallet-1', set: 'business' },
    nameLabel: 'Term Deposit',
    typeLabel: 'Account'
  },
  {
    screen: 'profile',
    icon: { type: 'ion-icon', name: 'contact' },
    nameLabel: 'Profile',
    typeLabel: 'Property'
  },
  {
    screen: 'propertyCentre',
    icon: { type: 'ion-icon', name: 'home' },
    nameLabel: 'Property Centre',
    typeLabel: 'Property'
  },
  {
    screen: 'goal',
    params: { goalId: 1 },
    icon: { type: 'ion-icon', name: 'cube' },
    nameLabel: 'Home outdoor extension',
    typeLabel: 'Goal'
  },
  {
    screen: 'goal',
    params: { goalId: 2 },
    icon: { type: 'ion-icon', name: 'cube' },
    nameLabel: 'Extra repayments',
    typeLabel: 'Goal'
  },
  {
    screen: 'goal',
    params: { goalId: 10 },
    icon: { type: 'ion-icon', name: 'cube' },
    nameLabel: 'Buy less furniture',
    typeLabel: 'Goal'
  },{
    screen: 'goal',
    params: { goalId: 11 },
    icon: { type: 'ion-icon', name: 'cube' },
    nameLabel: 'School essentials only',
    typeLabel: 'Goal'
  }
];