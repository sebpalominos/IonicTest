import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';

import { CategoryShape, Category } from '../shared/category.model';
import { CategoryService } from '../../../core/services/category/category.service';

@Component({
  selector: 'scr-edit-category',
  templateUrl: 'edit-category.html'
})
export class EditCategoryComponent {
  category: Category;
  validParentCategories: CategoryShape[];
  screenTitle: string = 'Edit category';
  isNewCategory: boolean = false;
  constructor(public params: NavParams, public navCtrl: NavController, public categoryService: CategoryService) {}
  ionViewWillLoad(){
    // Expect navParams to have dumped the category shape into the data.
    // If no params then assume new category being created
    let isNew = !this.params.data;
    this.isNewCategory = isNew;
    this.category = isNew ? new Category() : Object.assign(new Category, this.params.data);
    this.screenTitle = isNew ? 'Add category' : 'Edit category';
    // Fetch all the possible parent categories
    this.categoryService.getAvailableCategories().then((categories: Category[]) => {
      this.validParentCategories = categories;
    });
  }
  createCategory(){
    console.log('To be created', this.category);
    // this.categoryService.createCategory(this.category)
    //   .then(resp => {
    //     console.log('created', resp);
    //     this.navCtrl.pop();
    //   });
  }
  updateCategory(){
    // Todo: isolate the dirty fields only 
    console.log('To be updated', this.category);
    // this.categoryService.updateCategory(this.category)
    //   .then(resp => {
    //     console.log('updated', resp);
    //     this.navCtrl.pop();
    //   });
  }
  deleteCategory(){
    // Todo: Warning alert about dissociating all transactions categorised against this category
    // this.categoryService.deleteCategory(this.category.id)
    //   .then(resp => {
    //     console.log('deleted', resp);
    //     this.navCtrl.pop();
    //   });
  }
}
