import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelComponent } from './label.component';
import { LabelRoutingModule } from './label-routing.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [LabelComponent],
  imports: [
    CommonModule,
    LabelRoutingModule,
    NzButtonModule,
    NzCheckboxModule,
    NzSkeletonModule,
    NzInputModule,
    NzGridModule,
    NzModalModule,
    NzEmptyModule,
    FormsModule
  ],
  exports: [
    LabelComponent
  ]
})
export class LabelModule { }
