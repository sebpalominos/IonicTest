import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { AssetMockService } from './asset-mock.service';
import { AssetShape, Asset } from '../../../screens/assets/shared/asset.model';
import { PropertyShapeAsset, PropertyAsset } from '../../../screens/goal-centre/shared/property-asset';
import { StateChangeResponse } from '../../data/shared/state-change-response';
import { AssetListResponse, AssetResponse, PropertyAssetResponse } from '../../data/asset/asset-response';

// Mocks
import { ASSETS, PROPERTY_ASSETS } from '../../data/asset/mock-assets';

@Injectable()
export class AssetService extends AssetMockService {
  constructor(http: Http){
    super(http);
  }
}