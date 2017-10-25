import { ResponseBuildingTypeValue } from './property-response';
import { PropertyType } from '../../../screens/property-centre/shared/property-data-maps';


export class PropertyMapper {
  /** Convert a response buildingType to a propertyType that's usable by the app */
  static mapBuildingTypeResponse(buildingTypeValue: ResponseBuildingTypeValue): PropertyType {
    switch (buildingTypeValue) {
      case 'BUSINESS':
      case 'COMMERCIAL':
        return PropertyType.Commercial;
      case 'FLATS':
      case 'UNIT':
        return PropertyType.Unit;
      case 'HOUSE':
        return PropertyType.House;      
      case 'LAND':
        return PropertyType.Land;
      case 'COMMUNITY':
        return PropertyType.Community;
      case 'FARM':
        return PropertyType.Farm;
      case 'STORAGE_UNIT':
        return PropertyType.StorageUnit;
      case 'OTHER':
      default:
        return PropertyType.Other;
    }
  }
}