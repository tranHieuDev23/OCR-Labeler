import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NzContextMenuService,
  NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ImageComparationOption } from 'src/app/models/image-compare-funcs';
import ImageStatus, {
  getAllImageStatuses,
  getImageStatusString,
} from 'src/app/models/image-status';
import UploadedImage from 'src/app/models/uploaded-image';
import User from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { BackendService } from 'src/app/services/backend.service';
import { ImageFilterOptions } from 'src/app/models/image-filter-options';
import { JsonCompressService } from 'src/app/services/json-compress.service';

// const DEFAULT_SORT_OPTION = ImageComparationOption.UPLOAD_LATEST_FIRST;
const DEFAULT_IMAGES_PER_PAGE: number = 12;

@Component({
  selector: 'app-my-images',
  templateUrl: './my-images.component.html',
  styleUrls: ['./my-images.component.scss'],
})
export class MyImagesComponent implements OnInit {
  @ViewChild('contextMenu') contextMenu: NzDropdownMenuComponent;

  private user: User;
  public currentPage: number = null;
  public imagesPerPage: number = DEFAULT_IMAGES_PER_PAGE;
  public imagesCount: number = null;
  public uploadedImages: UploadedImage[] = [];
  public loading: boolean = true;
  public filterOptions: ImageFilterOptions;
  private selectedImages: UploadedImage[] = [];

  // public sortOptions: { label: string; value: ImageComparationOption }[] = [
  //   {
  //     label: 'Upload date (Latest first)',
  //     value: ImageComparationOption.UPLOAD_LATEST_FIRST,
  //   },
  //   {
  //     label: 'Upload date (Oldest first)',
  //     value: ImageComparationOption.UPLOAD_OLDEST_FIRST,
  //   },
  //   { label: 'Status (Asc.)', value: ImageComparationOption.STATUS_ASC },
  //   { label: 'Status (Desc.)', value: ImageComparationOption.STATUS_DESC },
  // ];
  // public selectedSortOption: ImageComparationOption = DEFAULT_SORT_OPTION;

  // public filterStatusOptions: { label: string; value: ImageStatus }[] =
  //   getAllImageStatuses().map((item) => {
  //     return { label: getImageStatusString(item), value: item };
  //   });
  // public filteredStatuses: ImageStatus[] = [];
  public isDeleteModalVisible: boolean = false;

  constructor(
    private auth: AuthService,
    private backend: BackendService,
    private router: Router,
    private route: ActivatedRoute,
    private contextService: NzContextMenuService,
    private notificationService: NzNotificationService,
    private readonly jsonCompress: JsonCompressService
  ) {}

  ngOnInit(): void {
    (async () => {
      this.user = await this.auth.getCurrentUser();
      this.route.queryParams.subscribe((params) => {
        const pageId: number = params.page || 1;
        const imagePerPage: number = params.pageSize || DEFAULT_IMAGES_PER_PAGE;
        const filter: string = params.filter;
        const filterOptions: ImageFilterOptions = filter
          ? ImageFilterOptions.parseFromJson(
              this.jsonCompress.decompress(filter)
            )
          : ImageFilterOptions.getDefaultOptions();
        this.loadPage(pageId, imagePerPage, filterOptions);
      });
    })().then(
      () => {},
      (error) => {
        this.notificationService.error('Failed to initialize page', error);
        this.router.navigateByUrl('/');
      }
    );
  }

  changeFilterOptions(filterOptions: ImageFilterOptions): void {
    filterOptions.filteredUsers = [this.user.username];
    this.filterOptions = filterOptions;
    this.refresh();
  }

  private refresh(): void {
    const queryParams: any = {};
    queryParams.filter = this.jsonCompress.compress(
      this.filterOptions.getJson()
    );
    if (this.currentPage > 1) {
      queryParams.page = this.currentPage;
    }
    if (this.imagesPerPage !== DEFAULT_IMAGES_PER_PAGE) {
      queryParams.pageSize = this.imagesPerPage;
    }
    this.router.navigate(['/my-images'], { queryParams });
  }

  private loadPage(
    pageId: number,
    imagePerPage: number,
    filterOptions: ImageFilterOptions
  ): void {
    this.loading = true;
    this.currentPage = pageId;
    filterOptions.filteredUsers = [this.user.username];
    this.filterOptions = filterOptions;
    this.imagesPerPage = imagePerPage;
    this.backend
      .loadUserImages(
        imagePerPage * (pageId - 1),
        imagePerPage,
        this.filterOptions
      )
      .then(
        (result) => {
          this.currentPage = result.pageId;
          this.imagesCount = result.imagesCount;
          this.uploadedImages = result.images;
          this.loading = false;
        },
        (reason) => {
          this.notificationService.error(
            'An error happened while loading page',
            `Reason: ${reason}`
          );
          this.router.navigateByUrl('/');
        }
      );
  }

  onImageClicked(id: number): void {
    this.router.navigate([`/manage-image/${this.uploadedImages[id].imageId}`], {
      queryParams: {
        filter: this.jsonCompress.compress(this.filterOptions),
      },
    });
  }

  onImagesSelected(images: UploadedImage[]): void {
    this.selectedImages = images;
  }

  showDeleteModal(): void {
    this.isDeleteModalVisible = true;
  }

  onDeleteModalOk(): void {
    this.backend
      .deleteImageList(this.selectedImages.map((item) => item.imageId))
      .then(
        () => {
          this.isDeleteModalVisible = false;
          this.loadPage(
            this.currentPage,
            this.imagesPerPage,
            this.filterOptions
          );
        },
        (reason) => {
          this.notificationService.error(
            'Failed to delete images',
            `Reason: ${reason}`
          );
        }
      );
  }

  onDeleteModalCancel(): void {
    this.isDeleteModalVisible = false;
  }

  onContextMenu(event: MouseEvent): boolean {
    if (this.selectedImages.length === 0) {
      return false;
    }
    this.contextService.create(event, this.contextMenu);
    return false;
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
