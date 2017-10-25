import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NavController, ActionSheetController, ModalController } from 'ionic-angular';

import { MortgageAccount } from '../../screens/affordability/shared/mortgage-account.model';
import { PropertySearchSummary } from '../../screens/property-centre/shared/property-search.model';
import { PropertyType } from '../../screens/property-centre/shared/property-data-maps';
import { PropertyUtils } from '../../screens/property-centre/shared/property-utils';
import { GoogleMapModalComponent } from '../google-map-modal/google-map-modal.component';

@Component({
  selector: 'property-summary',
  templateUrl: 'property-summary.component.html',
  host: {
    class: 'opc-property-summary'
  }
})
export class PropertySummaryComponent {
  @Input() property: PropertySearchSummary;
  @Input() mortgage: MortgageAccount;
  @Input('searchResult') isSearchResult: boolean;
  @Input('placeholder') isPlaceholder: boolean;
  @Input('favourite') isFavourite: boolean;
  @Output() propertySelected = new EventEmitter<PropertySearchSummary>();
  @Output() propertyFavourited = new EventEmitter<PropertySearchSummary>();
  propertyTypes: any = PropertyType;
  // private cardClassNames: string[]; 
  moneyShortener = PropertyUtils.moneyShortener;
  constructor(
    public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController
  ) {}
  ngOnInit() {
    //  console.log(this.property.coverImage(true));
  }
  ngOnChanges(changes: SimpleChanges){
    // Expect when starred, card face becomes changed, etc.
    // console.log(changes);
  }
  selectProperty() {
    this.propertySelected.emit(this.property);
  }
  showPropertyOptions() {
    let buttons = [{
      text: this.isFavourite ? 'Remove from shortlist' : 'Add to shortlist',
      role: this.isFavourite ? 'destructive' : null,
      handler: () => {
        this.isFavourite = !this.isFavourite;
        actionSheet.dismiss().then(() => this.propertyFavourited.emit(this.property));
        return false;
      }
    }, {
      text: 'Cancel',
      role: 'cancel',
      handler: () => { console.log('Cancel clicked') }
    }];
    let actionSheet = this.actionSheetCtrl.create({ 
      title: this.property.address.full,
      buttons,
    });
    actionSheet.present();
  }

  showGoogleMap(){
    // let googleMapModal = this.modalCtrl.create(GoogleMapModalComponent, {coordinates: this.property.coordinates, address: this.property.address.full});
    // googleMapModal.present();
    this.navCtrl.push(GoogleMapModalComponent, {coordinates: this.property.coordinates, address: this.property.address.full});
  }
}