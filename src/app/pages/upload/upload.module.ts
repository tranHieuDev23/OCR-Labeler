import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './upload.component';
import { UploadRoutingModule } from './upload-routing.module';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [UploadComponent],
  imports: [
    CommonModule,
    UploadRoutingModule,
    NzInputModule,
    NzGridModule,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzPopoverModule,
    ImageCropperModule,
    FormsModule
  ],
  exports: [
    UploadComponent
  ]
})
export class UploadModule { }
