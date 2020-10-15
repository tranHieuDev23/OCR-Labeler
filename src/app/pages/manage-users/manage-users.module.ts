import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageUsersComponent } from './manage-users.component';
import { ManageUsersRoutingModule } from './manage-image-routing.module';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ManageUserModalModule } from 'src/app/components/manage-user-modal/manage-user-modal.module';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ManageUsersComponent],
  imports: [
    CommonModule,
    ManageUsersRoutingModule,
    NzTypographyModule,
    NzNotificationModule,
    NzListModule,
    NzSelectModule,
    NzGridModule,
    NzStatisticModule,
    ManageUserModalModule,
    FormsModule
  ], exports: [
    ManageUsersComponent
  ]
})
export class ManageUsersModule { }
