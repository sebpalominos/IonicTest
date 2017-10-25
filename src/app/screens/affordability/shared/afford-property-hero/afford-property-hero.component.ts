import { Component, Input } from '@angular/core';
import { ModalController, Events } from 'ionic-angular';

import { AffordabilityGoal } from '../affordability-goal.model';
import { CreateAffordabilityComponent } from '../../create-afford/create-afford.component';
import { PropertyService } from '../../../../core/services/property/property.service';

@Component({
  selector: 'afford-property-hero',
  templateUrl: 'afford-property-hero.component.html',
  host: {
    class: 'afford-property-hero'
  }
})
export class AffordabilityPropertyHeroComponent {
  @Input() goal: AffordabilityGoal;
  showPropertiesLoaded: boolean;
  constructor(
    protected modalCtrl: ModalController,
    protected events: Events,
    protected propertyService: PropertyService
  ) {}
  ngOnInit() {
    this.loadProperties().then(wasLoaded => {
      if (wasLoaded) {
        setTimeout(() => {
          this.events.publish('slider:init', ['slider-afford-property']);
        }, 1000);
      }
    });
  }
  private loadProperties(): Promise<boolean> {
    this.showPropertiesLoaded = false;
    let retrieveProperties = [];
    // Load target property 
    if (this.goal.targetPropertyId) {
      let retrieveTargetProperty = this.propertyService.getProperty(this.goal.targetPropertyId).then(property => {
        this.goal.targetProperty = property;
      });
      retrieveProperties.push(retrieveTargetProperty);
    }
    if (this.goal.existingPropertyIds) {
      this.goal.existingProperties = Array.isArray(this.goal.existingProperties) ? this.goal.existingProperties : [];
      let retrieveExistingProperties = this.goal.existingPropertyIds.map((existingPropertyId, index) => {
        return this.propertyService.getProperty(existingPropertyId).then(property => {
          this.goal.existingProperties[index] = property;
        });
      });
      retrieveProperties.concat.apply([], retrieveExistingProperties);
    }
    console.log(retrieveProperties);
    return Promise.all(retrieveProperties).then(() => {
      this.showPropertiesLoaded = true;
      return true;
    }).catch(err => {
      console.error(err);
      return false;
    });
  }
}