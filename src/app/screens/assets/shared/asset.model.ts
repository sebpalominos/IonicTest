import { AssetResponse, AssetListResponse } from '../../../core/data/asset/asset-response';
import { AssetClass } from './asset-type';

export interface AssetShape {
  id: number;
  assetClass: AssetClass;
  currentValue: number;
  currentValueDate: Date;
  future?: boolean;
}

export class Asset implements AssetShape {
  constructor(...props: any[]){
    Object.assign(this, ...props);
  }
  id: number;
  assetClass: AssetClass = AssetClass.Cash;
  currentValue: number;
  currentValueDate: Date;
  future?: boolean;
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