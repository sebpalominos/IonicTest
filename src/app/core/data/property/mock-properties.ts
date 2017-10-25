import { PropertyShape, PropertyFeaturesShape } from '../../../screens/property-centre/shared/property.model';
import { AddressShape } from '../../../screens/misc/shapes/geography';
import { PropertyType, PropertySaleType } from '../../../screens/property-centre/shared/property-data-maps';

// ~~~ Verbosity kills ~~~ Use factories instead
let id = 0;
function propertyFactory(address: AddressShape, features: PropertyFeaturesShape, currentValue: number, saleType: PropertySaleType, salePrice?: number, images?: string[]){
  return <PropertyShape> { id: ++id, address, features, currentValue, saleType, salePrice, images };
}
function addressFactory(full, street, townSuburb, state, postcode){
  return <AddressShape> { full, street, townSuburb, state, postcode };
}
function featuresFactory(buildingType: PropertyType, bed: number, bath: number, car: number, landSize?: number, floorSize?: number, yearBuilt?: number){
  return <PropertyFeaturesShape> { buildingType, bed, bath, car, landSize, floorSize, yearBuilt };
}

export const PROPERTIES: PropertyShape[] = [
  propertyFactory(
    addressFactory('7/268 Penshurst Street Willoughby NSW 2068', '7/268 Penshurst Street', 'Willoughby', 'NSW', '2068'),
    featuresFactory(PropertyType.Unit, 2, 1, 1, 0, 99, 1985),
    760000, PropertySaleType.ForSale, 800000,
    [ 
      'https://alansfyeung-public.s3.amazonaws.com/opc-poc-prop/w1.jpg',
      'https://alansfyeung-public.s3.amazonaws.com/opc-poc-prop/w2.jpg'
    ]
  ),
  propertyFactory(
    addressFactory('4 Fairfield Glade Craigieburn Vic 3064', '4 Fairfield Glade', 'Craigieburn', 'Vic', '3064'),
    featuresFactory(PropertyType.House, 3, 2, 1, 600, 320, 2005),    
    1200500, PropertySaleType.ForSale, null,
    [ 
      'https://alansfyeung-public.s3.amazonaws.com/opc-poc-prop/vic1.jpg',
      'https://alansfyeung-public.s3.amazonaws.com/opc-poc-prop/vic2.jpg',
      'https://alansfyeung-public.s3.amazonaws.com/opc-poc-prop/vic3.jpg'
    ]
  ),
  propertyFactory(
    addressFactory('15 Dampier Street Beachlands WA 6530', '15 Dampier Street', 'Beachlands', 'WA', '6530'),
    featuresFactory(PropertyType.House, 3, 1, 0, 758, 400, 1990),
    350000, PropertySaleType.NotForSale, 258000,
    [ 
      'https://alansfyeung-public.s3.amazonaws.com/opc-poc-prop/wa1.jpg',
      'https://alansfyeung-public.s3.amazonaws.com/opc-poc-prop/wa2.jpg',
      'https://alansfyeung-public.s3.amazonaws.com/opc-poc-prop/wa3.jpg'
    ]
  ),
  propertyFactory(
    addressFactory('16 Aitchandar Road Ryde NSW 2112', '16 Aitchandar Road', 'Ryde', 'NSW', '2112'),
    featuresFactory(PropertyType.House, 5, 2, 2, 548, 300, 1990),
    1100000, PropertySaleType.NotForSale, 1395000,
    [ 
      'https://alansfyeung-public.s3.amazonaws.com/opc-poc-prop/a1.jpg',
      'https://alansfyeung-public.s3.amazonaws.com/opc-poc-prop/a2.jpg'
    ]
  ),
];