import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageImageComponent } from './manage-image.component';
import { ManageImageRoutingModule } from './manage-image-routing.module';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FormsModule } from '@angular/forms';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@NgModule({
  declarations: [ManageImageComponent],
  imports: [
    CommonModule,
    ManageImageRoutingModule,
    NzGridModule,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzPopoverModule,
    NzTypographyModule,
    NzPopconfirmModule,
    ImageCropperModule,
    FormsModule
  ],
  exports: [
    ManageImageComponent
  ]
})
export class ManageImageModule { }
