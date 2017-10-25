import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SharedModule } from '../../shared/shared.module';
import { TruncateModule } from 'ng2-truncate';

import { CategoriesComponent } from './categories.component';
import { CategoryComponent } from './category/category.component';
import { EditCategoryComponent } from './edit-category/edit-category.component';
import { CategoriesLoadingComponent } from './shared/categories-loading/categories-loading.component';
import { CategoryPopupComponent } from './shared/category-popup/category-popup.component';

@NgModule({
  declarations: [ 
    CategoriesComponent, 
    CategoryComponent,
    EditCategoryComponent,
    CategoriesLoadingComponent,
    CategoryPopupComponent
  ],
  imports: [
    IonicModule,
    SharedModule,
    TruncateModule
  ],
  exports: [ 
    CategoriesComponent, 
    CategoryComponent,
    EditCategoryComponent
  ],
  entryComponents: [ 
    CategoriesComponent, 
    CategoryComponent,
    EditCategoryComponent,
    CategoryPopupComponent
  ]
})
export class CategoriesModule {}
