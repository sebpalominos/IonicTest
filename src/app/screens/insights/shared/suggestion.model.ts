import { SuggestionsResponse } from '../../../core/data/insight/insight-response';

export interface SuggestionShape {
  title: string;
  description: string;
  callToActionLabel?: string;
  dateStartOn: Date;
  dateEndBefore: Date;
  backgroundImageUrl?: string;
  foregroundImageUrl?: string;
  actionComponent?: string;         // Similar scheme to notification
  actionData?: any;
  tags?: string[];
}

export class Suggestion implements SuggestionShape {
  /** Create Category object array from ICategory array */
  static createSuggestionsFromResponse(resp: SuggestionsResponse): Suggestion[] {
    return resp.suggestions.map(sug => new Suggestion(sug));
  }
  constructor(...props: any[]){
    Object.assign(this, ...props);
  }
  title: string;
  description: string;
  callToActionLabel?: string;
  dateStartOn: Date;
  dateEndBefore: Date;
  backgroundImageUrl?: string;
  foregroundImageUrl?: string;
  actionComponent?: string;         // Similar scheme to notification
  actionData?: any;
  tags?: string[];
}