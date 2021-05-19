import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportComponent } from './export.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { ExportRoutingModule } from './export-routing.module';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ImageFilterOptionsSelectorModule } from 'src/app/components/image-filter-options-selector/image-filter-options-selector.module';
import { ImageGridModule } from 'src/app/components/image-grid/image-grid.module';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzListModule } from 'ng-zorro-antd/list';
import { EmptyStringOnMobileModule } from 'src/app/pipes/empty-string-on-mobile/empty-string-on-mobile.module';


@NgModule({
  declarations: [ExportComponent],
  imports: [
    CommonModule,
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    NzNotificationModule,
    NzTabsModule,
    NzPaginationModule,
    NzListModule,
    ImageFilterOptionsSelectorModule,
    ImageGridModule,
    ExportRoutingModule,
    EmptyStringOnMobileModule
  ],
  exports: [ExportComponent],
})
export class ExportModule {}
