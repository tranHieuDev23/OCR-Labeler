import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageImageComponent } from './manage-image.component';
import { ManageImageRoutingModule } from './manage-image-routing.module';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule, NZ_ICONS } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FormsModule } from '@angular/forms';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { IconDefinition } from '@ant-design/icons-angular';
import { PlusOutline, DeleteOutline, UploadOutline } from '@ant-design/icons-angular/icons';

const icons: IconDefinition[] = [PlusOutline, DeleteOutline, UploadOutline];

@NgModule({
  declarations: [ManageImageComponent],
  imports: [
    CommonModule,
    ManageImageRoutingModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzPopoverModule,
    NzTypographyModule,
    NzPopconfirmModule,
    NzNotificationModule,
    ImageCropperModule,
    FormsModule
  ],
  exports: [
    ManageImageComponent
  ],
  providers: [
    { provide: NZ_ICONS, useValue: icons }
  ]
})
export class ManageImageModule { }
