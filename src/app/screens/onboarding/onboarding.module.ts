import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SharedModule } from '../../shared/shared.module';

import { ConnectionModalComponent } from './connection-modal/connection-modal.component';
import { ExplainConnectionHelpComponent } from './explain-connection-help/explain-connection-help.component';
import { FinishedConnectionComponent } from './finished-connection/finished-connection.component';
import { ProvideCredentialsComponent } from './provide-credentials/provide-credentials.component';
import { SelectInstitutionComponent } from './select-institution/select-institution.component';
import { CaptureProfileModalComponent } from './capture-profile-modal/capture-profile-modal.component';
import { CaptureNameComponent } from './capture-name/capture-name.component';

@NgModule({
  declarations: [ 
    ConnectionModalComponent,
    ExplainConnectionHelpComponent,
    FinishedConnectionComponent,
    ProvideCredentialsComponent,
    SelectInstitutionComponent,
    CaptureProfileModalComponent,
    CaptureNameComponent
  ],
  imports: [
    IonicModule,
    SharedModule
  ],
  exports: [ 
    ConnectionModalComponent,
    ExplainConnectionHelpComponent,
    FinishedConnectionComponent,
    ProvideCredentialsComponent,
    SelectInstitutionComponent,
    CaptureProfileModalComponent,
    CaptureNameComponent
  ],
  entryComponents: [ 
    ConnectionModalComponent,
    ExplainConnectionHelpComponent,
    FinishedConnectionComponent,
    ProvideCredentialsComponent,
    SelectInstitutionComponent,
    CaptureProfileModalComponent,
    CaptureNameComponent
  ]
})
export class OnboardingModule {}
