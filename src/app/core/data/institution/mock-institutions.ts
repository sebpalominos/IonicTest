import { InstitutionShape } from '../../../screens/onboarding/shared/institution.model';

export const FINANCIAL_INSTITUTIONS: InstitutionShape[] = [
  {
    id: 121,
    name: 'Westpac Banking Corporation',
    commonName: 'Westpac',
    slug: 'westpac',
    // logoClass: 'logo-icon-wbc',
    logoUrl: 'assets/img/res/insto/westpac.png',
  }, {
    id: 28,
    name: 'Commonwealth Bank',
    commonName: 'CommBank',
    slug: 'cba',
    // logoClass: 'logo-icon-cba',
    logoUrl: 'assets/img/res/insto/cba.png',
  }, {
    id: 75,
    name: 'National Austalia Bank',
    commonName: 'NAB',
    slug: 'nab',
    // logoClass: 'logo-icon-nab',
    logoUrl: 'assets/img/res/insto/nab.png',
  }, {
    id: 7,
    name: 'ANZ Bank',
    commonName: 'ANZ',
    slug: 'anz',
    // logoClass: 'logo-icon-nab',
    logoUrl: 'assets/img/res/insto/anz.png',
  }
];