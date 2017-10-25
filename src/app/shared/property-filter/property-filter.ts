export interface PropertyFilterShape {
    propertyTypes: PropertyTypesSortShape[];
    sortBy: PropertyTypesSortShape[];
    sort: boolean;
    otm?: boolean;
    page?: number;
}

export interface PropertyTypesSortShape {
    name: string;
    param: string;
    selected: boolean;
}

export interface FilterEndpoint {
    // { otm: data.filter.otm, types: propertyType, sort: sortByData, page: data.filter.page };
    otm: boolean;
    types: string;
    sort: string;
    page: number;
}

// {
//     propertyTypes: //default if omitted is all types
//       // [{ name: 'All', param: 'all', selected: false },
//       [{ name: 'Unit', param: 'unit', selected: false },
//       { name: 'Flats', param: 'flats', selected: false },
//       { name: 'Commercial', param: 'commercial', selected: false },
//       { name: 'House', param: 'house', selected: false },
//       { name: 'Land', param: 'land', selected: false },
//       { name: 'Business', param: 'business', selected: false },
//       { name: 'Community', param: 'community', selected: false },
//       { name: 'Farm', param: 'farm', selected: false },
//       { name: 'Storage Unit', param: 'storage_Unit', selected: false },
//       { name: 'Other', param: 'other', selected: false}],
//     sortBy: //Default is by address
//       [{ name: 'Address', param: 'address', selected: true },
//       { name: 'Price', param: 'price', selected: false },
//       { name: 'Beds', param: 'beds', selected: false },
//       { name: 'Baths', param: 'baths', selected: false },
//       { name: 'Car Spaces', param: 'carSpaces', selected: false },
//       { name: 'Land Area', param: 'landArea', selected: false }],
//     sort: 'asc', // desc, asc      
//     otm: true //If true, only properties that are on the market will be returned
//   }