import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ImageComparationOption } from 'src/app/models/image-compare-funcs';
import ImageStatus, { getAllImageStatuses, getImageStatusString } from 'src/app/models/image-status';
import UploadedImage from 'src/app/models/uploaded-image';
import User from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { BackendService } from 'src/app/services/backend.service';

const DEFAULT_SORT_OPTION = ImageComparationOption.UPLOAD_LATEST_FIRST;
const DEFAULT_IMAGES_PER_PAGE: number = 12;

@Component({
  selector: 'app-my-images',
  templateUrl: './my-images.component.html',
  styleUrls: ['./my-images.component.scss']
})
export class MyImagesComponent implements OnInit {
  @ViewChild("contextMenu") contextMenu: NzDropdownMenuComponent;

  public currentPage: number = null;
  public imagesPerPage: number = DEFAULT_IMAGES_PER_PAGE;
  public imagesCount: number = null;
  public uploadedImages: UploadedImage[] = [];
  public loading: boolean = true;

  public sortOptions: { label: string, value: ImageComparationOption }[] = [
    { label: 'Upload date (Latest first)', value: ImageComparationOption.UPLOAD_LATEST_FIRST },
    { label: 'Upload date (Oldest first)', value: ImageComparationOption.UPLOAD_OLDEST_FIRST },
    { label: 'Status (Asc.)', value: ImageComparationOption.STATUS_ASC },
    { label: 'Status (Desc.)', value: ImageComparationOption.STATUS_DESC }
  ];
  public selectedSortOption: ImageComparationOption = DEFAULT_SORT_OPTION;

  public filterStatusOptions: { label: string, value: ImageStatus }[] = getAllImageStatuses().map(item => {
    return { label: getImageStatusString(item), value: item };
  });
  public filteredStatuses: ImageStatus[] = [];
  private user: User;

  public isDeleteModalVisible: boolean = false;
  private selectedImages: UploadedImage[] = [];

  constructor(
    private auth: AuthService,
    private backend: BackendService,
    private router: Router,
    private route: ActivatedRoute,
    private contextService: NzContextMenuService,
    private notificationService: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.auth.getCurrentUser().then((user) => {
      this.user = user;
      this.route.queryParams.subscribe((params) => {
        const pageId: number = params['page'] || 1;
        const sortOption: ImageComparationOption = params['sort'] as ImageComparationOption || DEFAULT_SORT_OPTION;
        const statuses: string = params['statuses'] || '';
        const filteredStatuses: ImageStatus[] = statuses.split(',').map(item => item.trim()).filter(item => item.length > 0).map(item => item as ImageStatus);
        const imagePerPage: number = params['pageSize'] || DEFAULT_IMAGES_PER_PAGE;
        this.loadPage(pageId, sortOption, filteredStatuses, imagePerPage)
      });
    });
  }

  refresh(): void {
    const queryParams = {};
    if (this.currentPage > 1) {
      queryParams['page'] = this.currentPage;
    }
    if (this.selectedSortOption !== DEFAULT_SORT_OPTION) {
      queryParams['sort'] = this.selectedSortOption;
    }
    if (this.filteredStatuses.length > 0) {
      queryParams['statuses'] = this.filteredStatuses.join(',');
    }
    if (this.imagesPerPage !== DEFAULT_IMAGES_PER_PAGE) {
      queryParams['pageSize'] = this.imagesPerPage;
    }
    this.router.navigate(['/my-images'], { queryParams });
  }

  loadPage(pageId: number, sortOption: ImageComparationOption, filteredStatuses: ImageStatus[], imagePerPage: number): void {
    this.loading = true;
    this.currentPage = pageId;
    this.selectedSortOption = sortOption;
    this.filteredStatuses = filteredStatuses;
    this.imagesPerPage = imagePerPage;
    this.backend.loadUserImages(imagePerPage * (pageId - 1), imagePerPage, sortOption, filteredStatuses).then((result) => {
      this.currentPage = result.pageId;
      this.imagesCount = result.imagesCount;
      this.uploadedImages = result.images;
      this.loading = false;
    }, (reason) => {
      this.notificationService.error('An error happened while loading page', `Reason: ${reason}`);
      this.router.navigateByUrl('/');
    });
  }

  onImageClicked(id: number): void {
    this.router.navigate([`/manage-image/${this.uploadedImages[id].imageId}`], {
      queryParams: {
        sort: this.selectedSortOption,
        statuses: this.filteredStatuses.join(','),
        users: this.user.username
      }
    });
  }

  onImagesSelected(images: UploadedImage[]): void {
    this.selectedImages = images;
  }

  showDeleteModal(): void {
    this.isDeleteModalVisible = true;
  }

  onDeleteModalOk(): void {
    this.backend.deleteImageList(this.selectedImages.map(item => item.imageId)).then(() => {
      this.isDeleteModalVisible = false;
      this.loadPage(this.currentPage, this.selectedSortOption, this.filteredStatuses, this.imagesPerPage);
    }, (reason) => {
      this.notificationService.error('Failed to delete images', `Reason: ${reason}`);
    });
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
