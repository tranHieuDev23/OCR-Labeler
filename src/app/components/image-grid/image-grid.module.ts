import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageGridComponent } from './image-grid.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';

@NgModule({
  declarations: [ImageGridComponent],
  imports: [
    CommonModule,
    NzGridModule,
    NzTypographyModule,
    NzCardModule,
    NzTagModule
  ],
  exports: [
    ImageGridComponent
  ]
})
export class ImageGridModule { }
