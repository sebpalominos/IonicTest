/**
 * Describes a region of the world such as a suburb or urban 
 * geographical region (e.g. Inner West Sydney)
 */
export interface LocalityShape {
  regionalName?: string;     // e.g. Inner West sydney
  townSuburb?: string;     // Suburb or town
  postcode?: string;   
  state: string;      // three letter acro eg. NSW
  country?: string;      // 2-letter ISO code eg. AU, IE
}

/**
 * Contains fields that represent a street address. 
 * @export
 * @interface AddressShape
 */
export interface AddressShape {
  full: string;
  number?: string;     // Dwelling number
  street?: string;     // Would include dwelling name, addr line 1 and line 2
  numberStreet?: string;
  townSuburb?: string;     // Suburb or town
  state?: string;      // three letter acro eg. NSW
  postcode?: string;   
  country?: string;      // 2-letter ISO code eg. AU, IE
}
