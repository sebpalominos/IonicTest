// A map file (think .plist) of icons and where they go
import { OpiconParams, OpiconSize } from '../../../shared/opc-icon/opc-icon-type';

/**
 * Current set of icons is derived from Juggle categories list
 * and represents their Level 1 categories
 */
export const CATEGORY_ICONS: OpiconParams[] = [
  { id: 1, set: 'business', name: 'atm-2'},         // banking debits
  { id: 2, set: 'business', name: 'open'},      // business life
  { id: 3, set: 'business', name: 'check'},         // debt
  { id: 4, set: 'job', name: '037-handshake'},          // Employment
  { id: 5, set: 'job', name: '037-mask'},        // Entertainment
  { id: 6, set: 'business', name: 'money'},        // financial credit (line of credit)
  { id: 7, set: 'essential', name: 'stopwatch-4'},       // Health and fitness
  { id: 8, set: 'essential', name: 'house'},       // Household
  { id: 9, set: 'essential', name: 'umbrella'},       // Insurance
  { id: 10, set: 'job', name: '037-growth'},      // Investments CR
  { id: 11, set: 'job', name: '037-growth'},      // Investments DR
  { id: 12, set: 'essential', name: 'garbage-1'},      // Maintenance
  { id: 13, set: 'essential', name: 'gift'},      // One off
  { id: 14, set: 'business', name: 'time-passing'},      // Pension
  { id: 15, set: 'essential', name: 'users-1'},      // Personal and family
  { id: 16, set: 'business', name: 'calculator'},      // Repayment
  { id: 17, set: 'essential', name: 'price-tag'},      // Shopping
  { id: 18, set: 'business', name: 'get-money'},      // State credits (gov payments)
  { id: 21, set: 'essential', name: 'map-location'},      // Travel (commuting)
  { id: 22, set: 'interaction', name: 'file-5'},      // Miscellaneous debits
  { id: 23, set: 'hotel', name: 'parking-1'},      // Vehicles
  { id: 229, set: 'interaction', name: 'archive-12' },      // admin
  { id: 201, set: 'business', name: 'atm-1' },    // banking credits
  { id: 202, set: 'business', name: 'credit-card-2' },    // credit card
  { id: 203, set: 'job', name: '037-strength' },    // health insurance
  { id: 235, set: 'interaction', name: 'file-6' },    // Misc credots
  { id: 223, set: 'business', name: 'coins' },    // Savings
];