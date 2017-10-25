// This is what the OPICA Core API defines to be a link
export interface Link {
  name: string;     // some kind of URL path, must be interpreted contextually. 
  method: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE';    // have omitted other HTTP because unlikely
  body: any;      // Some kind of post payload 
}