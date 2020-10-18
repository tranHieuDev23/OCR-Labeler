import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportComponent } from './export.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { ExportRoutingModule } from './export-routing.module';



@NgModule({
  declarations: [ExportComponent],
  imports: [
    CommonModule,
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    NzNotificationModule,
    ExportRoutingModule
  ],
  exports: [
    ExportComponent
  ]
})
export class ExportModule { }
