import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerifyComponent } from './verify.component';
import { VerifyRoutingModule } from './verify-routing.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormsModule } from '@angular/forms';
import { ImageGridModule } from 'src/app/components/image-grid/image-grid.module';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ZoomableImageModule } from 'src/app/components/zoomable-image/zoomable-image.module';


@NgModule({
  declarations: [VerifyComponent],
  imports: [
    CommonModule,
    VerifyRoutingModule,
    NzButtonModule,
    NzTypographyModule,
    NzNotificationModule,
    NzEmptyModule,
    NzGridModule,
    FormsModule,
    ImageGridModule,
    ZoomableImageModule
  ],
  exports: [
    VerifyComponent
  ]
})
export class VerifyModule { }
