import { Component, Output, EventEmitter } from '@angular/core';
import { Config, ActionSheetController, AlertController } from 'ionic-angular';

import { OpicaHttpService } from './core/services/insights-http/insights-http.service';

export type EndpointOption = {
  label: string;
  value: string;
};

@Component({
  selector: 'endpoint-switcher',
  template: `
    <button ion-button block outline color="light" (tap)="selectEndpoint()">
      Environment: {{apiPrefix?.label || 'Default'}} 
      <span class="endpoint-switcher-subtitle">{{apiPrefix?.value}}</span>
    </button>
  `,
  host: { class: 'endpoint-switcher' }
})
export class EndpointSwitcherComponent {
  @Output() endpointSelected = new EventEmitter();
  apiPrefix: EndpointOption;
  endpointOptions: EndpointOption[];
  constructor(
    protected config: Config,
    protected actionSheetCtrl: ActionSheetController,
    protected alertCtrl: AlertController,
  ) {}
  ngOnInit() {
    // Load these from configuration
    let endpointOptions = this.config.get('availableEndpoints', [
      { label: 'prod-au-defaulted', value: 'https://app.opicagroup.com.au/api/' },
      { label: 'dev-ie-defaulted', value: 'https://34.249.211.199/api/' },
    ]);
    this.endpointOptions = endpointOptions;
    let currentEndpointBaseUrl = this.config.get('apiEndpointBaseUrl');
    if (currentEndpointBaseUrl) {
      this.apiPrefix = { label: 'Default', value: currentEndpointBaseUrl };      
    }
  }
  selectEndpoint() {
    let actionSheet = this.actionSheetCtrl.create({
      // title: 'Select an environment',
      title: 'The app will connect to this environment, for the duration of the logged-in session.'
    });
    this.endpointOptions.forEach(endpointOption => {
      actionSheet.addButton({
        text: endpointOption.label,
        handler: () => {
          this.apiPrefix = endpointOption;
          this.endpointSelected.emit(endpointOption.value);
        }
      });
    });
    actionSheet.addButton({
      text: 'Custom endpoint...',
      handler: () => {
        let alert = this.alertCtrl.create({
          title: 'Custom endpoint',
          message: 'Enter the endpoint base URL, including the /api/ prefix if any, and ending with a trailing slash',
          inputs: [{
            name: 'baseEndpointUrl',
            placeholder: 'https://example.com/api/'
          }]
        });
        alert.addButton({
          text: 'Cancel',
          role: 'cancel'
        });
        alert.addButton({
          text: 'Submit',
          handler: data => {
            // Test whatever
            let baseEndpointUrl: string = data.baseEndpointUrl;
            if (baseEndpointUrl.match(/^https?:\/\/.+?\/$/)) {       // NOTE TRAILING SLASH
              this.apiPrefix = { label: 'Custom', value: data.baseEndpointUrl };
              this.endpointSelected.emit(data.baseEndpointUrl);
            }
            else {
              alert.dismiss().then(() => {
                this.alertCtrl.create({
                  title: 'Invalid base URL',
                  message: 'Must conform to PCRE: /^https?:\/\/.+?\/$/',
                  buttons: [ 'OK' ]
                }).present();
              });
              return false;
            }
          }
        });
        alert.present();
      }
    });
    actionSheet.addButton({
      role: 'cancel',
      text: 'Cancel'
    });
    actionSheet.present();
  }
}
