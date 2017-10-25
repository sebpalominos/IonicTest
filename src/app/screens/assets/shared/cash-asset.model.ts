import { Asset, AssetShape } from './asset.model';
import { AssetClass } from './asset-type';
import { AssetResponse, AssetListResponse } from '../../../core/data/asset/asset-response';

export interface ICashAsset {
  id: number;
  assetClass: AssetClass;
  currentValue: number;
  currentValueDate: Date;
}

export class CashAsset extends Asset {
  id: number;
  assetClass: AssetClass = AssetClass.Cash;
  currentValue: number;
  currentValueDate: Date;
  name(): string {
    return this.toString();
  }
  toString(): string {
    switch (this.assetClass){
      case AssetClass.Cash:
        var assetClass = 'Cash';
        break;
      case AssetClass.FixedInterest:
        var assetClass = 'Fixed interest';
        break;
      case AssetClass.Property:
        var assetClass = 'Property';
        break;
      case AssetClass.Shares:
        var assetClass = 'Share';
        break;
    }
    return `${assetClass} asset worth ${this.currentValue} as at ${this.currentValueDate.toDateString()}`;
  }
}