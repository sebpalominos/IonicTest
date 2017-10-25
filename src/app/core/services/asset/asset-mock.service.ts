import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { AssetShape, Asset } from '../../../screens/assets/shared/asset.model';
import { PropertyShapeAsset, PropertyAsset } from '../../../screens/goal-centre/shared/property-asset';
import { StateChangeResponse } from '../../data/shared/state-change-response';
import { AssetListResponse, AssetResponse, PropertyAssetResponse } from '../../data/asset/asset-response';

// Mocks
import { ASSETS, PROPERTY_ASSETS } from '../../data/asset/mock-assets';

@Injectable()
export class AssetMockService {
  constructor(http: Http){}

  /** Get a list of all assets */
  getAssets(): Promise<AssetListResponse> {
    return Promise.resolve({
      assets: ASSETS
    });
  }
  
  /** Get a goal by the goal's own ID */
  getAsset(id: number): Promise<AssetResponse> {
    return Promise.resolve({
      asset: ASSETS.find(asset => asset.id === id)
    });
  }

  /** Get a goal by the goal's own ID */
  getPropertyAsset(id: number): Promise<PropertyAssetResponse> {
    return Promise.resolve({
      asset: PROPERTY_ASSETS.find(asset => asset.id === id)
    });
  }
}