import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewComponent } from './review.component';
import { ReviewRoutingModule } from './review-routing.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormsModule } from '@angular/forms';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ZoomableImageModule } from 'src/app/components/zoomable-image/zoomable-image.module';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

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
    ZoomableImageModule,
    NzPaginationModule,
  ],
  exports: [ReviewComponent],
})
export class ReviewModule {}
