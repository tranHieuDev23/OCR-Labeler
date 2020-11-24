import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZoomableImageComponent } from './zoomable-image.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';


@NgModule({
  declarations: [ZoomableImageComponent],
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule
  ],
  exports: [
    ZoomableImageComponent
  ]
})
export class ZoomableImageModule { }
