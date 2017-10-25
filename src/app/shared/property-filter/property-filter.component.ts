import { Component } from '@angular/core';
import { NavController, AlertController, ViewController, NavParams } from 'ionic-angular';
import { PropertySearchComponent } from '../../screens/property-centre/property-search/property-search.component';
import { PropertyFilterShape } from './property-filter';

@Component({
  selector: 'property-filter',
  templateUrl: 'property-filter.component.html',
  host: {
    class: 'property-filter'
  }
})
export class PropertyFilterComponent {

  filters: PropertyFilterShape;
  propertyType: string = 'All';
  sortBy: string = 'Address';
  sort: string;
  otm: string;
  
  constructor(
    protected navCtrl: NavController,
    protected alertCtrl: AlertController,
    protected navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    
    if(this.navParams.get('filter')){//set filter according params from parent view
      console.log('filter',this.navParams.get('filter'));
      
      this.filters = this.navParams.get('filter');
      // this.isFiltered = true;

      this.toggleSort();
      this.toggleOTM2();
      
      let propTypeData = [];
      this.filters.propertyTypes.forEach((elem) => {
        if(elem.selected){
          propTypeData.push(elem.name);
        }
      });
      if(propTypeData.length > 0){
        this.propertyType = '';
        propTypeData.forEach((elem,index) =>{
          if(index === propTypeData.length - 1){
            this.propertyType += elem;
          }else{
            this.propertyType += elem + ', ';
          }
        });
      }else{
        this.propertyType = 'All';
      }
      
      this.filters.sortBy.forEach(elem => {
        if(elem.selected){
          this.sortBy = elem.name;
        }
      });
    }else{
      //Create and set filter first time of invocation
      this.createDefaultFilters();
      this.toggleSort();
      this.toggleOTM2();
    }
  }

  createDefaultFilters(){
    this.filters = {
      propertyTypes: //default if omitted is all types
        // [{ name: 'All', param: 'all', selected: false },
        [{ name: 'Unit', param: 'unit', selected: false },
        { name: 'Flats', param: 'flats', selected: false },
        { name: 'Commercial', param: 'commercial', selected: false },
        { name: 'House', param: 'house', selected: false },
        { name: 'Land', param: 'land', selected: false },
        { name: 'Business', param: 'business', selected: false },
        { name: 'Community', param: 'community', selected: false },
        { name: 'Farm', param: 'farm', selected: false },
        { name: 'Storage Unit', param: 'storage_unit', selected: false },
        { name: 'Other', param: 'other', selected: false}],
      sortBy: //Default is by address
        [{ name: 'Address', param: 'address', selected: true },
        { name: 'Beds', param: 'beds', selected: false },
        { name: 'Baths', param: 'baths', selected: false },
        { name: 'Car Spaces', param: 'carSpaces', selected: false },
        { name: 'Land Area', param: 'landArea', selected: false }],
      sort: false, // where true=desc, false=asc(default)      
      otm: false, //If true, only properties that are on the market will be returned
      page: 0
    };  
  }

  defaultPropertyTypeFilters(){
    this.filters.propertyTypes= [];
    this.filters.propertyTypes= //default if omitted is all types
      // [ { name: 'All', param: 'all', selected: false },
        [{ name: 'Unit', param: 'unit', selected: false },
        { name: 'Flats', param: 'flats', selected: false },
        { name: 'Commercial', param: 'commercial', selected: false },
        { name: 'House', param: 'house', selected: false },
        { name: 'Land', param: 'land', selected: false },
        { name: 'Business', param: 'business', selected: false },
        { name: 'Community', param: 'community', selected: false },
        { name: 'Farm', param: 'farm', selected: false },
        { name: 'Storage Unit', param: 'storage_unit', selected: false },
        { name: 'Other', param: 'other', selected: false}];  
  }

  defaultOtmFilters(){
    this.filters.otm= false; //If true, only properties that are on the market will be returned
  }

  defaultSortByFilters(){
    this.filters.sortBy= [];
    this.filters.sortBy= //Default is by address
      [ { name: 'Address', param: 'address', selected: false },
        { name: 'Beds', param: 'beds', selected: false },
        { name: 'Baths', param: 'baths', selected: false },
        { name: 'Car Spaces', param: 'carSpaces', selected: false },
        { name: 'Land Area', param: 'landArea', selected: false }];
  }

  defaultSortByOTMFilters(){
    this.filters.sortBy= [];
    this.filters.sortBy= //Default is by address
      [ { name: 'Address', param: 'address', selected: false },        
        { name: 'Beds', param: 'beds', selected: false },
        { name: 'Baths', param: 'baths', selected: false },
        { name: 'Car Spaces', param: 'carSpaces', selected: false },
        { name: 'Land Area', param: 'landArea', selected: false },
        { name: 'Price', param: 'price', selected: false },
        { name: 'Date', param: 'date', selected: false },
        { name: 'Method', param: 'method', selected: false }];
  }

  defaultSortFilters(){
    this.filters.sort= false; // where true=desc, false=asc(default) 
  }

  toggleSort(){
    if(this.filters.sort){
      this.sort = 'Desc';
    }else{
      this.sort = 'Asc';
    }
  }

  toggleOTM(){
    if(this.filters.otm){
      this.otm = 'Only properties "On The Market" will be returned';
      this.defaultSortByOTMFilters();
      this.filters.sortBy.forEach(elem =>{
        if(elem.name === this.sortBy){
          elem.selected = true;
          // return;
        }
      });
    }else{
      this.otm = 'Any property will be returned';
      this.filters.sortBy.forEach(elem =>{
        if(elem.param === 'price' || elem.param === 'date' || elem.param === 'method'){
          this.defaultSortByFilters();
          if(elem.selected){
            this.setDefaultSortBy();
          }            
          // return;
        }
        
      });
      this.filters.sortBy.forEach(elem =>{
        // console.log('filter sortBy');
        if(elem.name === this.sortBy){
          elem.selected = true;
          return;
        }
      });
      
    }
  }

  toggleOTM2(){
    if(this.filters.otm){
      this.otm = 'Only properties "On The Market" will be returned';
    }else{
      this.otm = 'Any property will be returned';
      
    }
  }

  setDefaultSortBy(){
    this.filters.sortBy.forEach(other =>{
      if(other.param === 'address'){
        other.selected = true;
        this.sortBy = other.name;
        return;
      }
    });
  }

  cancel(){
    this.viewCtrl.dismiss();
  }

  propertyTypeFilter() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Property Type');

    this.filters.propertyTypes.forEach(elem => {
      alert.addInput({
        type: 'checkbox',
        label: elem.name,
        value: elem.param,
        checked: elem.selected
      });        
    });
    
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Okay',
      handler: data => {
        // console.log('data',data);
        if(data){
          if(data.length > 0){
            this.propertyType = '';
            this.defaultPropertyTypeFilters();
            this.filters.propertyTypes.forEach(elem => {
              data.forEach((subelem,index) => {                       
                if(elem.param === subelem){
                  elem.selected = true;
                  if(index === data.length - 1){
                    this.propertyType += elem.name;
                  }else{
                    this.propertyType += elem.name + ', ';
                  } 
                }            
              });
            });
          }else{
            this.propertyType = 'All';
            this.filters.propertyTypes.forEach((elem) => {
              elem.selected = false;            
            });
          }
        }
        // console.log('filters.propertyTypes:', this.filters.propertyTypes);
      }
    });
    alert.present();
  }

  sortByFilter() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Sort By');

    // console.log('this.filters.sortBy',this.filters.sortBy);

    this.filters.sortBy.forEach(elem => {
      alert.addInput({
        type: 'radio',
        label: elem.name,
        value: elem.param,
        checked: elem.selected
      });        
    });    

    alert.addButton('Cancel');
    alert.addButton({
      text: 'Okay',
      handler: data => {
        console.log('sortByFilter',data);
        if(data){
          if(this.filters.otm){
            this.defaultSortByOTMFilters();
          }else{
            this.defaultSortByFilters();
          }        
          this.filters.sortBy.forEach(elem => {
            if(elem.param === data){
              elem.selected = true;
              this.sortBy = elem.name;
            }
          });
        }
        // this.sortByOut.emit(this.filters.sortBy);
        // console.log('sortBy:', this.filters.sortBy);
      }
    });
    alert.present();
  }

  search(){
    // console.log(this.filters);
    this.viewCtrl.dismiss({filter:this.filters});
  }
}