export namespace TelemetryPayload {
  export interface Standard {
    user: string;
    env: string;
    app: {
      version: string;
      platform: string;
    };
    timestamp: {
      logged: number;
      received?: number;
    };
    context: any;
  }
  export interface ApiException extends Standard {
    apiException: Partial<ApiExceptionParams>;
  }
  export interface ApiExceptionParams {
    requestMethod: string;
    requestEndpoint: string;
    requestPayload: string;      // OBJECTS MUST BE STRINGIFIED
    requestAuthType: 'immortal' | 'cred' | 'none';
    responseCode: number;
    responseMessage: string;
    responseTime: number;        // in millisecs
    isRemoteEndpointTimeout: boolean;
  }
}