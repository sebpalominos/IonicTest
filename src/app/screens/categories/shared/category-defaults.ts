import { SegmentButtonType } from '../../misc/types/segment-button-type';
import { TimeScaleType } from '../../../core/data/shared/constant-types';

export namespace CategoryListDefaults {
  export enum FilterTransactionType {
    All,
    Income,
    Expenses
  }
  export const segmentButtons: SegmentButtonType[] = [
    <SegmentButtonType> {
      label: 'Both',
      value: FilterTransactionType.All
    },
    <SegmentButtonType> {
      label: 'Income',
      value: FilterTransactionType.Income
    },
    <SegmentButtonType> {
      label: 'Expenses',
      value: FilterTransactionType.Expenses
    }
  ];
}