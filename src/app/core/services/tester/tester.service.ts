import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

// import {  } from '../';
import { InsightsHttpService } from '../insights-http/insights-http.service';

@Injectable()
export class TesterService {
  constructor(
    protected events: Events,
    protected http: Http,
    protected opicaHttp: InsightsHttpService
  ) {}
  testHttpGet(endpoint: string): Promise<Response> {
    // let endpoint = ['https://app.opicagroup.com.au/api', 'notifications', 'check', 'WEB'];
    return this.http.get(endpoint).toPromise();
  }
  testOpicaHttpGet(): Promise<Response> {
    let endpoint = ['notifications', 'check', 'WEB'];
    return this.opicaHttp.get(endpoint).toPromise();
  }
  testHttpPostLogin(): Promise<Response> {
    let endpoint = ['https://app.opicagroup.com.au/api', 'access', 'login'];
    return this.http.post(endpoint.join('/'), {
      "username":"alan",
      "password":"Alan1234",
      "digits":["1","1","1",null,null,null],
      "licenceCode":""
    }).toPromise();
  }
  testOpicaHttpPostLogin(): Promise<Response> {
    let endpoint = ['access', 'login'];
    return this.opicaHttp.post(endpoint, {
      "username":"alan",
      "password":"Alan1234",
      "digits":["1","1","1",null,null,null],
      "licenceCode":""
    }).toPromise();
  }
}