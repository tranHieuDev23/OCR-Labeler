import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NzContextMenuService,
  NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown';
import ImageStatus from 'src/app/models/image-status';
import UploadedImage from 'src/app/models/uploaded-image';
import { AuthService } from 'src/app/services/auth.service';
import { BackendService } from 'src/app/services/backend.service';
import { ImageFilterOptions } from 'src/app/models/image-filter-options';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ExportDatasetService } from 'src/app/services/export-dataset.service';
const DEFAULT_IMAGES_PER_PAGE: number = 12;

@Component({
  selector: 'app-all-image',
  templateUrl: './all-image.component.html',
  styleUrls: ['./all-image.component.scss'],
})
export class AllImageComponent implements OnInit {
  @ViewChild('contextMenu') contextMenu: NzDropdownMenuComponent;

  public currentPage: number = null;
  public imagesPerPage: number = DEFAULT_IMAGES_PER_PAGE;
  public imagesCount: number = null;
  public images: UploadedImage[] = [];
  public isLoadingImage = false;
  public filterOptions: ImageFilterOptions = null;
  public isDeleteModalVisible: boolean = false;
  private selectedImages: UploadedImage[] = [];

  constructor(
    private backend: BackendService,
    private router: Router,
    private contextService: NzContextMenuService,
    private notification: NzNotificationService,
    private exportDatasetService: ExportDatasetService
  ) {}
  ngOnInit(): void {
    const filterOptions = ImageFilterOptions.getDefaultOptions();
    filterOptions.filteredStatuses = [ImageStatus.Processing];
    this.loadPage(1, DEFAULT_IMAGES_PER_PAGE, filterOptions).then();
  }

  async changeFilterOptions(filterOptions: ImageFilterOptions) {
    this.filterOptions = filterOptions;
    await this.reloadCurrentPage();
  }

  async changePage(event: number) {
    if (event === this.currentPage) {
      return;
    }
    this.currentPage = event;
    await this.reloadCurrentPage();
  }

  async changePageSize(event: number) {
    if (event === this.imagesPerPage) {
      return;
    }
    this.imagesPerPage = event;
    await this.reloadCurrentPage();
  }

  private async loadPage(
    pageId: number,
    imagesPerPage: number,
    filterOptions: ImageFilterOptions
  ) {
    this.isLoadingImage = true;
    this.currentPage = pageId;
    this.filterOptions = filterOptions;
    this.imagesPerPage = imagesPerPage;
    try {
      const result = await this.exportDatasetService.getExportableImage(
        imagesPerPage * (pageId - 1),
        imagesPerPage,
        this.filterOptions
      );
      this.currentPage = result.pageId;
      this.imagesCount = result.imagesCount;
      this.images = result.images;
      this.isLoadingImage = false;
    } catch (error) {
      this.notification.error(
        'An error happened while loading page',
        `${error}`
      );
      this.router.navigateByUrl('/');
    }
  }

  private async reloadCurrentPage() {
    await this.loadPage(
      this.currentPage,
      this.imagesPerPage,
      this.filterOptions
    );
  }

  onImageClicked(id: number): void {
    this.router.navigate([`/manage-image/${this.images[id].imageId}`]);
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
          this.notification.error(
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
}
