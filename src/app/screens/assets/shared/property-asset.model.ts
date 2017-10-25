import { AssetResponse, AssetListResponse } from '../../../core/data/asset/asset-response';
import { AssetShape, Asset } from './asset.model';
import { AssetClass } from './asset-type';

export interface PropertyShapeAsset extends AssetShape {
  propertyId: number;                 // The property listing related to this asset 
  isUnderMortgage: boolean;           // Whether or not this property is on a mortgage
  mortgageAccountId?: number;         // Bank account which tracks the mortgage
}

export class PropertyAsset extends Asset implements PropertyShapeAsset {
  /** Retrieve instantiated Asset */
  static createAssetFromResponse(resp: AssetResponse): PropertyAsset {
    return Object.assign(new PropertyAsset, resp.asset);
  }
  propertyId: number;
  mortgageAccountId: number;
  isUnderMortgage: boolean = false;
}