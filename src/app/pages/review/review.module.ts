import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewComponent } from './review.component';
import { ReviewRoutingModule } from './review-routing.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule} from 'ng-zorro-antd/icon';
import { ImageGridModule } from 'src/app/components/image-grid/image-grid.module';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ZoomableImageModule } from 'src/app/components/zoomable-image/zoomable-image.module';


@NgModule({
  declarations: [ReviewComponent],
  imports: [
    CommonModule,
    ReviewRoutingModule,
    NzButtonModule,
    NzTypographyModule,
    NzNotificationModule,
    NzEmptyModule,
    NzGridModule,
    FormsModule,
    ImageGridModule,
    ZoomableImageModule,
    NzCardModule,
    NzIconModule,
  ],
  exports: [
    ReviewComponent
  ]
})
export class ReviewModule { }
