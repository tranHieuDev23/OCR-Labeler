import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyImagesComponent } from './my-images.component';
import { MyImagesRoutingModule } from './my-images-routing.module';
import { ImageGridModule } from 'src/app/components/image-grid/image-grid.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [MyImagesComponent],
  imports: [
    CommonModule,
    MyImagesRoutingModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    NzTypographyModule,
    NzPaginationModule,
    FormsModule,
    ImageGridModule
  ]
})
export class MyImagesModule { }
