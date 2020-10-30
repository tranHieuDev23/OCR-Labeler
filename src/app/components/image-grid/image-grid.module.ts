import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageGridComponent } from './image-grid.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@NgModule({
  declarations: [ImageGridComponent],
  imports: [
    CommonModule,
    NzGridModule,
    NzTypographyModule,
    NzCardModule,
    NzTagModule,
    NzSkeletonModule,
    NzEmptyModule
  ],
  exports: [
    ImageGridComponent
  ]
})
export class ImageGridModule { }
