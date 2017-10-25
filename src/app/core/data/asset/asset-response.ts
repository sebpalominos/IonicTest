import { AssetShape } from '../../../screens/assets/shared/asset.model';
import { PropertyShapeAsset } from '../../../screens/assets/shared/property-asset.model';

export type AssetListResponse = {
  assets: AssetShape[];
};
export type AssetResponse = {
  asset: AssetShape;
};
export type PropertyAssetResponse = {
  asset: PropertyShapeAsset;
};