import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelComponent } from './label.component';
import { LabelRoutingModule } from './label-routing.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormsModule } from '@angular/forms';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { ZoomableImageModule } from 'src/app/components/zoomable-image/zoomable-image.module';


@NgModule({
  declarations: [LabelComponent],
  imports: [
    CommonModule,
    LabelRoutingModule,
    NzButtonModule,
    NzInputModule,
    NzTypographyModule,
    NzNotificationModule,
    NzGridModule,
    NzEmptyModule,
    NzSwitchModule,
    FormsModule,
    ZoomableImageModule
  ],
  exports: [
    LabelComponent
  ]
})
export class LabelModule { }
