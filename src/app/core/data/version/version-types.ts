// https://opicagroup.atlassian.net/wiki/display/OP1/Cookiecutter+data+model
export interface VersionInfo {
  version: string;
  versionDate: string;
  versionDateHuman: string;
}
export interface CapabilityDefinitionItem {
  identifier: WhiteLabel.CapabilityMatrixKey; 
  designation?: WhiteLabel.WLCapabilityTypeStagedTesting | WhiteLabel.WLCapabilityTypeOnOff;
  [ otherKeys: string ]: any;
}
export namespace WhiteLabel {
  export interface Definition {
    theme?: Partial<ThemeDefinition>;
    capabilities?: Partial<CapabilityMatrixDefinitions>
  }
  export interface ThemeDefinition {
    logo: string;
    color: string;
    bgColor: string;
    fgColor: string;
    title: string;
    subtitle: string;
  };
  export type WLCapabilityTypeStagedTesting = 'hidden' | 'disabled' | 'alpha' | 'beta' | 'release';
  export type WLCapabilityTypeOnOff = 'on' | 'off';
  export type CapabilityMatrixKey = keyof CapabilityMatrixDefinitions;
  export interface CapabilityMatrixDefinitions {
    CAP_DASHBOARD: string | WLCapabilityTypeStagedTesting;
    CAP_ACCOUNTS: string | WLCapabilityTypeStagedTesting;       // If accounts is available on the home page and from side menu
    CAP_BREAKDOWN: string | WLCapabilityTypeStagedTesting;     // If breakdown is available on the home page
    CAP_AFFORDABILITY: string | WLCapabilityTypeStagedTesting;     // 
    CAP_GOAL_CENTRE: string | WLCapabilityTypeStagedTesting; 
    CAP_PROPERTY_CENTRE: string | WLCapabilityTypeStagedTesting;
    CAP_EXPLORE_PROFILE: string | WLCapabilityTypeOnOff;
    CAP_NOTIFICATION_CENTRE: string | WLCapabilityTypeOnOff;
    CAP_UNIVSEARCH: string | WLCapabilityTypeStagedTesting;      // If universal search is enabled in the home page header and/or summoned from the side menu
    CAP_IMMORTAL_LOGIN: string | WLCapabilityTypeOnOff;
    CAP_CREATE_USER: string | WLCapabilityTypeOnOff;
    CAP_USE_PIN: string | WLCapabilityTypeOnOff;
    CAP_OTHER: string | WLCapabilityTypeOnOff;
  };
}