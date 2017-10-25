import { Property } from './property.model';
import { PropertySearchSummary, PropertySearchSuggestionShape } from './property-search.model';
import { PropertyFilterShape } from '../../../shared/property-filter/property-filter';
import { PageResponseShape } from '../../../core/data/property/property-response';

export namespace PropertyEvents {
  export type PropertySearchResult = {
    results: PropertySearchSummary[];
    filter?: PropertyFilterShape;
    page?: PageResponseShape;
    suggestion?: PropertySearchSuggestionShape;
    description?: string; 
    hasNoResults?: boolean;
    isUserCancelled?: boolean;
    // Inform receiving screen that there is a single property result, 
    // ready for display.
    isPropertySingleResult: boolean;
    propertySingleResult: Property;
  };
}