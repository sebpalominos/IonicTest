import { Component } from '@angular/core';
import { NavParams, NavController, ViewController, LoadingController, Events } from 'ionic-angular';

import { CreateAffordabilityPropertyComponent } from '../create-afford-property/create-afford-property.component';
import { CreateAffordabilityHubComponent } from '../create-afford-hub/create-afford-hub.component';
import { AffordabilityUtils } from '../shared/affordability-utils';
import { Property } from '../../property-centre/shared/property.model';
import { UserProfileService } from '../../../core/services/user/user-profile.service';

@Component({
  selector: 'create-afford-intro',
  templateUrl: 'create-afford-intro.component.html',
  host: {
    class: 'create-afford-intro'
  }
})
export class CreateAffordabilityIntroComponent {
  preferredName: string;
  isInitial: boolean;
  existingProperty: Property;
  initialSelectionType = AffordabilityUtils.SelectionType;
  screens = {
    property: CreateAffordabilityPropertyComponent,
    hub: CreateAffordabilityHubComponent
  };
  constructor(
    protected params: NavParams,
    protected navCtrl: NavController,
    protected viewCtrl: ViewController,
    protected loadingCtrl: LoadingController,
    protected events: Events,
    protected profileService: UserProfileService
  ) {}
  ionViewWillLoad() {
    this.existingProperty = this.params.get('existingProperty');
    this.profileService.getLocalProfile().then(profile => {
      this.preferredName = profile.preferredName;
    });
  }
  ionViewWillEnter() {
    // Hide the back button if this is an 'Initial Select Existing'
    if (this.params.get('isInitial')) {
      this.isInitial = !!this.params.get('isInitial');
      this.viewCtrl.showBackButton(!this.isInitial);
    }
  }
  setNone() {
    this.events.publish('afford:existingPropertySelectNone');
    this.navCtrl.popToRoot({ animate: true, direction: 'forward' });
    // [navPush]="screens.hub" [navParams]="{ selectionType: initialSelectionType.NONE }"
  }
  closeAll() {
    this.navCtrl.parent.getActive().dismiss();
  }
}