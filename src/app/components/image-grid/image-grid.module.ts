import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageGridComponent } from './image-grid.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@NgModule({
  declarations: [ImageGridComponent],
  imports: [
    CommonModule,
    NzGridModule,
    NzTypographyModule,
  ],
  exports: [
    ImageGridComponent
  ]
})
export class ImageGridModule { }
