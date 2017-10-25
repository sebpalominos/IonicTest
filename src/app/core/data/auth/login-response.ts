// TBA: To be standardised and probably moved to a 
// standard OPICA spec (currently on Juggle spec)

export interface LoginResponse {
  type?: string;      // e.g. UserDTO
  id: number|string;
  name: string;
  createdAt: number;       // TBA should be date, currently unix ts
  userToken: {
    csrfToken: string;
  };
  firstName?: string;
  lastName?: string;
  email?: string;
  licensingAction?: string;
};
export interface LoginErrorResponse {
  status: string;
  message: string;
  field: string;
}