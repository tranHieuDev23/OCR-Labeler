import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ImageComparationOption } from 'src/app/models/image-compare-funcs';
import ImageStatus, { getAllImageStatuses, getImageStatusString } from 'src/app/models/image-status';
import UploadedImage from 'src/app/models/uploaded-image';
import { AuthService } from 'src/app/services/auth.service';
import { BackendService } from 'src/app/services/backend.service';

const DEFAULT_SORT_OPTION = ImageComparationOption.UPLOAD_LATEST_FIRST;
const DEFAULT_IMAGES_PER_PAGE: number = 12;

@Component({
  selector: 'app-all-image',
  templateUrl: './all-image.component.html',
  styleUrls: ['./all-image.component.scss']
})
export class AllImageComponent implements OnInit {
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
    { label: 'Status (Desc.)', value: ImageComparationOption.STATUS_DESC },
    { label: 'User (Asc.)', value: ImageComparationOption.USER_ASC },
    { label: 'User (Desc.)', value: ImageComparationOption.USER_DESC }
  ];
  public selectedSortOption: ImageComparationOption = DEFAULT_SORT_OPTION;

  public filterStatusOptions: { label: string, value: ImageStatus }[] = getAllImageStatuses().map(item => {
    return { label: getImageStatusString(item), value: item };
  });
  public filteredStatuses: ImageStatus[] = [];

  public filterUserOptions: { label: string, value: string }[] = [];
  public filteredUsers: string[] = [];

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
    this.auth.getAllUser().then((users) => {
      this.filterUserOptions = users.map(item => { return { label: item.displayName, value: item.username } });
    });
    this.route.queryParams.subscribe((params) => {
      const pageId: number = params['page'] || 1;
      const sortOption: ImageComparationOption = params['sort'] as ImageComparationOption || ImageComparationOption.UPLOAD_LATEST_FIRST;
      const statuses: string = params['statuses'] || '';
      const filteredStatuses: ImageStatus[] = statuses.split(',').map(item => item.trim()).filter(item => item.length > 0).map(item => item as ImageStatus);
      const users: string = params['users'] || '';
      const filteredUsers: string[] = users.split(',').map(item => item.trim()).filter(item => item.length > 0);
      const imagePerPage: number = params['pageSize'] || DEFAULT_IMAGES_PER_PAGE;
      this.loadPage(pageId, sortOption, filteredStatuses, filteredUsers, imagePerPage);
    });
  }

  refresh(): void {
    const queryParams = {};
    if (this.currentPage > 1) {
      queryParams['page'] = this.currentPage;
    }
    if (this.selectedSortOption !== DEFAULT_SORT_OPTION) {
      queryParams['page'] = this.selectedSortOption;
    }
    if (this.filteredStatuses.length > 0) {
      queryParams['statuses'] = this.filteredStatuses;
    }
    if (this.filteredUsers.length > 0) {
      queryParams['users'] = this.filteredUsers;
    }
    if (this.imagesPerPage !== DEFAULT_IMAGES_PER_PAGE) {
      queryParams['pageSize'] = this.imagesPerPage;
    }
    this.router.navigate(['/my-images'], { queryParams });
  }

  loadPage(pageId: number, sortOption: ImageComparationOption, filteredStatuses: ImageStatus[], filteredUsers: string[], imagesPerPage: number): void {
    this.loading = true;
    this.currentPage = pageId;
    this.selectedSortOption = sortOption;
    this.filteredStatuses = filteredStatuses;
    this.filteredUsers = filteredUsers;
    this.imagesPerPage = imagesPerPage;
    this.backend.loadAllUserImages(
      imagesPerPage * (pageId - 1),
      imagesPerPage,
      sortOption,
      filteredStatuses,
      filteredUsers)
      .then((result) => {
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
        users: this.filteredUsers.join(',')
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
      this.loadPage(this.currentPage, this.selectedSortOption, this.filteredStatuses, this.filteredUsers, this.imagesPerPage);
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
}
