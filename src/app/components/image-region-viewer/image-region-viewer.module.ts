import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageRegionViewerComponent } from './image-region-viewer.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';



@NgModule({
  declarations: [ImageRegionViewerComponent],
  imports: [
    CommonModule,
    NzPopoverModule
  ],
  exports: [
    ImageRegionViewerComponent
  ]
})
export class ImageRegionViewerModule { }
