import { SuggestionShape } from '../../../screens/insights/shared/suggestion.model';

let expiryDate1 = new Date();
expiryDate1.setDate(expiryDate1.getDate() + 3);
let expiryDate2 = new Date();
expiryDate2.setDate(expiryDate2.getDate() + 7);

export const SUGGESTIONS: SuggestionShape[] = [
  {
    title: 'Consolidate your Debts',
    description: 'You should consider consolidating all of your debts into one.',
    callToActionLabel: 'View options',
    dateStartOn: new Date(),
    dateEndBefore: expiryDate2,
    foregroundImageUrl: "assets/img/demo/opica-ipad-3.jpg",
    actionComponent: 'ReviewConsolidateDebt',
    tags: ['debt', 'consolidate']
  }, { 
    title: 'Make use of surplus income', 
    description: 'You should consider using this surplus income as super contributions.', 
    callToActionLabel: 'Review super payments',
    dateStartOn: new Date(),
    dateEndBefore: expiryDate2,
    foregroundImageUrl: "assets/img/demo/consider.jpg",
    actionComponent: 'ReviewSuperPayments',
    tags: ['surplus', 'super']
  }, { 
    title: 'Consider Life Insurance and TPD',
    description: 'Protect your family from unforeseen circumstances such as death, injury or illness.',
    callToActionLabel: 'View options',
    dateStartOn: new Date(),
    dateEndBefore: expiryDate2,
    foregroundImageUrl: "assets/img/demo/family-at-home.jpg",
    actionComponent: 'NewInsuranceTPD',
    tags: ['insurance', 'tpd']
  }, {
    title: 'Make use of your wealth', 
    description: 'What are you planning to do with this money? Save for something, invest, or seek advice?',
    callToActionLabel: 'Set a strategy',
    dateStartOn: new Date(),
    dateEndBefore: expiryDate2,
    foregroundImageUrl: "assets/img/demo/clients-working-on-tablet.jpg",
    actionComponent: 'CreateLumpSumStrategy',
    tags: ['surplus', 'strategy']
  }, { 
    title: 'Are you saving for something?', 
    description: 'See whether your current saving behaviour will meet your expected target.',
    callToActionLabel: 'Set a goal',
    dateStartOn: new Date(),
    dateEndBefore: expiryDate2,
    foregroundImageUrl: "assets/img/demo/opica-ipad-3.jpg",
    actionComponent: 'CreateGoal',
    tags: ['saving', 'goal']
  }, { 
    title: 'Plan for your Retirement', 
    description: 'Nominate your target retirement income and see how long your super will last.',
    callToActionLabel: 'Explore retirement funds',
    dateStartOn: new Date(),
    dateEndBefore: expiryDate2,
    foregroundImageUrl: "assets/img/demo/468807003.jpg",
    actionComponent: 'ReviewRetirementStrategy',
    tags: ['retirement', 'super']
  }, { 
    title: 'Maximise your Retirement Wealth', 
    description: 'You should consider a Transition to Retirement strategy. It could add $30,000 to your Super at Retirement.',
    callToActionLabel: 'Explore TTR strategy',
    dateStartOn: new Date(),
    dateEndBefore: expiryDate2,
    foregroundImageUrl: "assets/img/demo/retirement.jpg",
    actionComponent: 'ReviewRetirementStrategy',
    tags: ['retirement', 'super']
  }, { 
    title: 'Consolidate your Super Funds', 
    description: 'You could save fees and improve your retirement by Consolidating your Super Funds into one.',
    callToActionLabel: 'Find out more',
    dateStartOn: new Date(),
    dateEndBefore: expiryDate2,
    foregroundImageUrl: "assets/img/demo/convergence.jpg",
    actionComponent: 'ConsolidateSuper',
    tags: ['consolidate', 'super']
  }, { 
    title: 'Add an offset account', 
    description: 'Your mortgage is eligible for an offset account.', 
    callToActionLabel: 'Find out more', 
    dateStartOn: new Date(),
    dateEndBefore: expiryDate2,
    foregroundImageUrl: 'assets/img/demo/wbc-clp_p_home-loans_solutions_buying-my-first-home_356x200.jpg',
    tags: ['offset', 'mortgage'],
    actionComponent: 'WebViewer',
    actionData: { url: 'https://www.westpac.com.au/personal-banking/home-loans/variable/mortgage-offset-accounts/' }
  }, { 
    title: 'Consider Life Insurance', 
    description: 'You should protect yourself given your new Home Loan.', 
    callToActionLabel: 'Find out more', 
    dateStartOn: new Date(),
    dateEndBefore: expiryDate2,
    foregroundImageUrl: 'assets/img/demo/lifeins.jpg',
    tags: ['offset', 'mortgage'],
    actionComponent: 'WebViewer',
    actionData: { url: 'https://www.westpac.com.au/personal-banking/home-loans/variable/mortgage-offset-accounts/' }
  }, { 
    title: 'Adjust your personal goal', 
    description: "You can afford to increase some of the spending limits on your goal 'USA Holiday'.", 
    callToActionLabel: 'Adjust goal', 
    dateStartOn: new Date(),
    dateEndBefore: null,
    foregroundImageUrl: 'assets/img/demo/disneyland.jpg',
    actionComponent: 'ViewGoal',
    actionData: { personalGoal: 60 }
  }, { 
    title: 'Reduce your spending on takeaway dining', 
    description: 'Limit your spending on dining and takeaway, and you could save 2 months off your mortgage.', 
    callToActionLabel: 'Create a limit',
    dateStartOn: new Date(),
    dateEndBefore: expiryDate1,
    foregroundImageUrl: "assets/img/demo/kitchen.jpg",
    actionComponent: 'CreateSpendingLimitTactic',
    actionData: { id: 45 }
  }
];