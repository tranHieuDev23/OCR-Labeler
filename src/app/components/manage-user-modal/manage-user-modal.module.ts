import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManageUserModalComponent } from './manage-user-modal.component';
import { NzGridModule } from 'ng-zorro-antd/grid';



@NgModule({
  declarations: [
    ManageUserModalComponent
  ],
  imports: [
    CommonModule,
    NzStatisticModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzCheckboxModule,
    NzButtonModule,
    NzGridModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    ManageUserModalComponent
  ]
})
export class ManageUserModalModule { }
