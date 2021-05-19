import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportComponent } from './export.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { ExportRoutingModule } from './export-routing.module';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzListModule } from 'ng-zorro-antd/list';
import { ImageGridModule } from 'src/app/components/image-grid/image-grid.module';

@NgModule({
  declarations: [ExportComponent],
  imports: [
    CommonModule,
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    NzNotificationModule,
    ExportRoutingModule,
    NzTabsModule,
    NzPaginationModule,
    NzListModule,
    ImageGridModule,
  ],
  exports: [ExportComponent],
})
export class ExportModule {}
