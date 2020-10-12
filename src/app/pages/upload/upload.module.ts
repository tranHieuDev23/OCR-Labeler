import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './upload.component';
import { UploadRoutingModule } from './upload-routing.module';
import { NzIconModule, NZ_ICONS } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { IconDefinition } from '@ant-design/icons-angular';
import { InboxOutline } from '@ant-design/icons-angular/icons';

const icons: IconDefinition[] = [InboxOutline];

@NgModule({
  declarations: [UploadComponent],
  imports: [
    CommonModule,
    UploadRoutingModule,
    NzIconModule,
    NzTypographyModule,
    NzNotificationModule,
    NzUploadModule,
  ],
  exports: [
    UploadComponent
  ],
  providers: [
    { provide: NZ_ICONS, useValue: icons }
  ]
})
export class UploadModule { }
