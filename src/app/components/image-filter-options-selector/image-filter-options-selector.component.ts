import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import ImageStatus, {
  getAllImageStatuses,
  getImageStatusString,
} from 'src/app/models/image-status';
import User from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
// import { ImageTagService } from 'src/app/services/image-tag.service';
// import { ImageTypeService } from 'src/app/services/image-type-service.service';
import { ImageFilterOptions } from 'src/app/models/image-filter-options';
import {
  getImageSortOptionString,
  ImageSortOption,
} from 'src/app/models/image-sort-options';
import { ImageTagGroup } from 'src/app/models/image-tag';
import { ImageType } from 'src/app/models/image-type';

@Component({
  selector: 'app-image-filter-options-selector',
  templateUrl: './image-filter-options-selector.component.html',
  styleUrls: ['./image-filter-options-selector.component.scss'],
})
export class ImageFilterOptionsSelectorComponent implements OnInit {
  @Input('filterOptions') public filterOptions: ImageFilterOptions = null;
  @Input('canFilterStatus') public canFilterStatus: boolean = true;
  @Input('canFilterUser') public canFilterUser: boolean = true;
  @Input('isVertical') public isVertical: boolean = false;

  @Output('newOptions') public newOptions =
    new EventEmitter<ImageFilterOptions>();

  public filterImageTypeOptions: ImageType[] = [];
  public filterStatusOptions: ImageStatus[] = [];
  public filterUserOptions: User[] = [];
  public filterTagGroupOptions: ImageTagGroup[] = [];
  public sortOptions: ImageSortOption[] = [];

  constructor(
    private readonly router: Router,
    private readonly notificationService: NzNotificationService,
    // private readonly imageTypeService: ImageTypeService,
    private readonly authService: AuthService
  ) // private readonly imageTagService: ImageTagService
  {}

  ngOnInit(): void {
    if (!this.filterOptions) {
      this.filterOptions = ImageFilterOptions.getDefaultOptions();
    }
    (async () => {
      // const options = await Promise.all([
      //   this.imageTypeService.getAllImageTypesWithoutLabel(),
      //   this.imageTagService.getAllImageTagGroups(),
      // ]);
      // this.filterImageTypeOptions = options[0];
      this.filterStatusOptions = getAllImageStatuses();
      this.filterUserOptions = this.canFilterUser
        ? await this.authService.getAllUser()
        : [];
      // this.filterTagGroupOptions = options[1];
      this.sortOptions = [
        ImageSortOption.UPLOAD_LATEST_FIRST,
        ImageSortOption.UPLOAD_OLDEST_FIRST,
        ImageSortOption.STATUS_ASC,
        ImageSortOption.STATUS_DESC,
      ];
      if (this.canFilterUser) {
        this.sortOptions = [
          ...this.sortOptions,
          ImageSortOption.USER_ASC,
          ImageSortOption.USER_DESC,
        ];
      }
    })().then(
      () => {},
      (error) => {
        this.notificationService.error(
          'Error when initializing filter option selector',
          error
        );
        this.router.navigateByUrl('/');
      }
    );
  }

  public getImageStatusString(status: ImageStatus): string {
    return getImageStatusString(status);
  }

  public getSortOptionString(option: ImageSortOption): string {
    return getImageSortOptionString(option);
  }

  public refresh() {
    this.newOptions.emit(this.filterOptions);
  }

  public resetOptions() {
    this.filterOptions = ImageFilterOptions.getDefaultOptions();
    this.refresh();
  }
}
