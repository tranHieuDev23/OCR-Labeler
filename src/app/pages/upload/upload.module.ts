import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './upload.component';
import { UploadRoutingModule } from './upload-routing.module';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule, NZ_ICONS } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FormsModule } from '@angular/forms';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { IconDefinition } from '@ant-design/icons-angular';
import { PlusOutline, DeleteOutline, UploadOutline } from '@ant-design/icons-angular/icons';

const icons: IconDefinition[] = [PlusOutline, DeleteOutline, UploadOutline];

@NgModule({
  declarations: [UploadComponent],
  imports: [
    CommonModule,
    UploadRoutingModule,
    NzInputModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzPopoverModule,
    NzTypographyModule,
    NzNotificationModule,
    ImageCropperModule,
    FormsModule
  ],
  exports: [
    UploadComponent
  ],
  providers: [
    { provide: NZ_ICONS, useValue: icons }
  ]
})
export class UploadModule { }
