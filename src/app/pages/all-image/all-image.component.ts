import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ImageComparationOption } from 'src/app/models/image-compare-funcs';
import ImageStatus, { getImageStatusString } from 'src/app/models/image-status';
import UploadedImage from 'src/app/models/uploaded-image';
import { AuthService } from 'src/app/services/auth.service';
import { BackendService } from 'src/app/services/backend.service';

const IMAGES_PER_PAGE: number = 10;

@Component({
  selector: 'app-all-image',
  templateUrl: './all-image.component.html',
  styleUrls: ['./all-image.component.scss']
})
export class AllImageComponent implements OnInit {
  public currentPage: number = null;
  public imagesPerPage: number = IMAGES_PER_PAGE;
  public imagesCount: number = null;
  public uploadedImages: UploadedImage[] = [];
  public loading: boolean = true;

  public sortOptions: { label: string, value: ImageComparationOption }[] = [
    { label: 'Upload date (Latest first)', value: ImageComparationOption.UPLOAD_LATEST_FIRST },
    { label: 'Upload date (Oldest first)', value: ImageComparationOption.UPLOAD_OLDEST_FIRST },
    { label: 'Status (Asc.)', value: ImageComparationOption.STATUS_ASC },
    { label: 'Status (Desc.)', value: ImageComparationOption.STATUS_DESC },
    { label: 'User (Asc.)', value: ImageComparationOption.STATUS_DESC },
    { label: 'User (Desc.)', value: ImageComparationOption.STATUS_DESC }
  ];
  public selectedSortOption: ImageComparationOption = ImageComparationOption.UPLOAD_LATEST_FIRST;

  public filterStatusOptions: { label: string, value: ImageStatus }[] = [
    { label: getImageStatusString(ImageStatus.Uploaded), value: ImageStatus.Uploaded },
    { label: getImageStatusString(ImageStatus.Processed), value: ImageStatus.Processed },
    { label: getImageStatusString(ImageStatus.NotProcessed), value: ImageStatus.NotProcessed },
    { label: getImageStatusString(ImageStatus.Published), value: ImageStatus.Published }
  ];
  public filteredStatuses: ImageStatus[] = [];

  public filterUserOptions: { label: string, value: string }[] = [];
  public filteredUsers: string[] = [];

  constructor(
    private auth: AuthService,
    private backend: BackendService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.auth.getAllUser().then((users) => {
      this.filterUserOptions = users.map(item => { return { label: item.displayName, value: item.username } });
    });
    this.loadPage(1, this.selectedSortOption, this.filteredStatuses, this.filteredUsers);
  }

  refresh(): void {
    this.loadPage(this.currentPage, this.selectedSortOption, this.filteredStatuses, this.filteredUsers);
  }

  loadPage(pageId: number, sortOption: ImageComparationOption, filteredStatuses: ImageStatus[], filteredUsers: string[]): void {
    this.loading = true;
    this.currentPage = pageId;
    this.selectedSortOption = sortOption;
    this.filteredStatuses = filteredStatuses;
    this.filteredUsers = filteredUsers;
    this.backend.loadAllUserImages(
      IMAGES_PER_PAGE * (pageId - 1),
      IMAGES_PER_PAGE,
      sortOption,
      filteredStatuses,
      filteredUsers)
      .then((result) => {
        this.currentPage = result.pageId;
        this.imagesCount = result.imagesCount;
        this.uploadedImages = result.images;
        this.loading = false;
      }, (reason) => {

      });
  }

  onImageClicked(id: number): void {
    this.router.navigateByUrl(`/manage-image/${this.uploadedImages[id].imageId}`);
  }

  changePage(event: number): void {
    if (event === this.currentPage) {
      return;
    }
    this.loadPage(event, this.selectedSortOption, this.filteredStatuses, this.filteredUsers);
  }
}
