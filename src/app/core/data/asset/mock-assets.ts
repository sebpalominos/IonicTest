import { AssetShape, Asset } from '../../../screens/assets/shared/asset.model';
import { PropertyShapeAsset, PropertyAsset } from '../../../screens/assets/shared/property-asset.model';
import { AssetClass } from '../../../screens/assets/shared/asset-type';

export const ASSETS: AssetShape[] = [
  { 
    id: 1,
    assetClass: AssetClass.Cash,
    currentValue: 10200.00,
    currentValueDate: new Date('2017-01-28T00:00:00Z'),
  }, {
    id: 4,
    assetClass: AssetClass.Cash,
    currentValue: 2100.00,
    currentValueDate: new Date('2017-01-28T00:00:00Z'),
  }, {
    id: 5,
    assetClass: AssetClass.Cash,
    currentValue: 2000.00,
    currentValueDate: new Date('2017-01-28T00:00:00Z'),
  }
];

export const PROPERTY_ASSETS: AssetShape[] = [
  {
    id: 2,
    assetClass: AssetClass.Property,
    currentValue: 800.00,
    currentValueDate: new Date('2017-01-13T00:00:00Z'),
  }, {
    id: 3,
    assetClass: AssetClass.Liability,
    currentValue: -300000.00,
    currentValueDate: new Date('2017-01-13T00:00:00Z'),
  }
];