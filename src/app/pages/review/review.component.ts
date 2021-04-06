import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Coordinate, TextRegion } from 'src/app/models/text-region';
import { BackendService } from 'src/app/services/backend.service';
import { ActivatedRoute, Router } from '@angular/router';

const DEFAULT_IMAGES_PER_PAGE: number = 12;
@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
})
export class ReviewComponent implements OnInit {
  public listRegions: { imageUrl: string; region: TextRegion }[] = [];
  public highlightImage: string = null;
  public highlightRegion: Coordinate[] = null;
  public currentPage: number = null;
  public imagesPerPage: number = DEFAULT_IMAGES_PER_PAGE;
  public imagesCount: number = null;
  public loading: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private backend: BackendService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const pageId: number = params['page'] || 1;
      const imagePerPage: number =
        params['pageSize'] || DEFAULT_IMAGES_PER_PAGE;
      this.loadRegion(pageId, imagePerPage);
    });
  }

  loadRegion(pageId: number, imagePerPage: number): void {
    this.loading = true;
    this.currentPage = pageId;
    this.imagesPerPage = imagePerPage;
    this.backend
      .loadRegionForLabeled(imagePerPage * (pageId - 1), imagePerPage)
      .then(
        (result) => {
          window.scrollTo(0, 0);
          if (!result) {
            this.listRegions = [];
            this.highlightImage = null;
            this.highlightRegion = null;
            return;
          }
          this.loading = false;
          this.currentPage = result.pageId;
          this.imagesCount = result.imagesCount;
          this.listRegions = result.items;
        },
        (reason) => {
          this.notification.error(
            'Failed to load the text region',
            `Reason: ${reason}`
          );
        }
      );
  }
  refresh(): void {
    const queryParams = {};
    if (this.currentPage > 1) {
      queryParams['page'] = this.currentPage;
    }
    if (this.imagesPerPage !== DEFAULT_IMAGES_PER_PAGE) {
      queryParams['pageSize'] = this.imagesPerPage;
    }
    this.router.navigate(['/review'], { queryParams });
  }

  relabel(region: TextRegion, isHidden: boolean): void {
    this.backend.reviewLabel(region.regionId, isHidden, region.label).then(
      () => {
        this.notification.success('Text region changed successfully', '');
        for (let index = 0; index < this.listRegions.length; index++) {
          const element = this.listRegions[index];
          if (element.region.regionId === region.regionId) {
            element.region = region;
          }
        }
      },
      (reason) => {
        this.notification.error(
          'Failed to change the text region',
          `Reason: ${reason}`
        );
      }
    );
  }

  hide(region: TextRegion, isHidden: boolean): void {
    this.backend.reviewLabel(region.regionId, isHidden, region.label).then(
      () => {
        this.notification.success('Text region reviewed successfully', '');
        this.loadRegion(this.currentPage, this.imagesPerPage);
      },
      (reason) => {
        this.notification.error(
          'Failed to review the text region',
          `Reason: ${reason}`
        );
      }
    );
  }
  save(event): void {
    console.log('You entered: ', event.target.value);
  }

  changePage(event: number): void {
    if (event === this.currentPage) {
      return;
    }
    this.currentPage = event;
    this.refresh();
  }

  changePageSize(event: number): void {
    if (event === this.imagesPerPage) {
      return;
    }
    this.imagesPerPage = event;
    this.refresh();
  }
}
