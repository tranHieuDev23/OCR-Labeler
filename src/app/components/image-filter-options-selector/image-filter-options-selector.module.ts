import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageFilterOptionsSelectorComponent } from './image-filter-options-selector.component';
import { FormsModule } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@NgModule({
  declarations: [ImageFilterOptionsSelectorComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzSelectModule,
    NzTypographyModule,
    NzButtonModule,
    NzNotificationModule,
    NzDatePickerModule,
  ],
  exports: [ImageFilterOptionsSelectorComponent],
})
export class ImageFilterOptionsSelectorModule {}
