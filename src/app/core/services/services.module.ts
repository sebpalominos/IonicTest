import { NgModule, Optional, SkipSelf  } from '@angular/core';

import { AccountService } from './account/account.service';
import { AssetService } from './asset/asset.service';
import { AuthService } from './auth/auth.service';
import { CategoryService } from './category/category.service';
import { CategoryLocalService } from './category/category-local.service';
import { DashboardService } from './dashboard/dashboard.service';
import { GoalService } from './goal/goal.service';
import { InstitutionService } from './institution/institution.service';
import { InstitutionCacheService } from './institution/institution-cache.service';
import { NotificationService } from './notification/notification.service'
import { OnboardingService } from './onboarding/onboarding.service';
import { InsightsHttpService } from './insights-http/insights-http.service';
import { PropertyService } from './property/property.service'
import { SearchService } from './search/search.service'
import { TaskService } from './task/task.service'
import { TaskManagerService } from './task/task-manager.service'
import { TelemetryService } from './telemetry/telemetry.service'
import { TransactionService } from './transaction/transaction.service'
import { TransactionLocalService } from './transaction/transaction-local.service'
import { UserService } from './user/user.service'
import { UserProfileService } from './user/user-profile.service';
import { VersionService } from './version/version.service';
import { VersionMigrationService } from './version/version-migration.service';
import { throwIfAlreadyLoaded } from '../module-import-guard';

@NgModule({
  providers: [ 
    AccountService,
    AssetService,
    AuthService,
    CategoryService,
    CategoryLocalService,
    DashboardService,
    GoalService,
    InstitutionService,
    InstitutionCacheService,
    NotificationService,
    OnboardingService,
    InsightsHttpService,
    PropertyService,
    SearchService,
    TaskService,
    TaskManagerService,
    TelemetryService,
    TransactionService,
    TransactionLocalService,
    UserProfileService,
    UserService,
    VersionService,
    VersionMigrationService
  ]
})
export class ServicesModule {
  constructor( 
    @Optional() @SkipSelf() parentModule: ServicesModule,
    insightsHttpService: InsightsHttpService,      // Force instantiation
    userProfileService: UserProfileService,    // Force instantiation
    telemetryService: TelemetryService,     // Force instantiation
  ) {
    throwIfAlreadyLoaded(parentModule, 'ServicesModule');
  }
}