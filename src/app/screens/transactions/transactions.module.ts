import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SharedModule } from '../../shared/shared.module';

import { TransactionsComponent } from './transactions.component';
import { TransactionComponent } from './transaction/transaction.component';
import { EditTransactionComponent } from './edit-transaction/edit-transaction.component';
import { EditTransactionCategoryComponent } from './edit-transaction-category/edit-transaction-category.component';
import { SimilarCategoryComponent } from './similar-category/similar-category.component';


@NgModule({
  declarations: [ 
    TransactionsComponent, 
    TransactionComponent,
    EditTransactionComponent,
    EditTransactionCategoryComponent,
    SimilarCategoryComponent
  ],
  imports: [
    IonicModule,
    SharedModule
  ],
  exports: [ 
    TransactionsComponent, 
    TransactionComponent,
    EditTransactionComponent,
    EditTransactionCategoryComponent,
    SimilarCategoryComponent
  ],
  entryComponents: [ 
    TransactionsComponent, 
    TransactionComponent,
    EditTransactionComponent,
    EditTransactionCategoryComponent,
    SimilarCategoryComponent
  ]
})
export class TransactionsModule {}
