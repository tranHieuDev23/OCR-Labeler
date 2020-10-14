import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageUsersComponent } from './manage-users.component';
import { ManageUsersRoutingModule } from './manage-image-routing.module';



@NgModule({
  declarations: [ManageUsersComponent],
  imports: [
    CommonModule,
    ManageUsersRoutingModule
  ], exports: [
    ManageUsersComponent
  ]
})
export class ManageUsersModule { }
