import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import ImageStatus, {
  getAllImageStatuses,
  getImageStatusString,
} from 'src/app/models/image-status';
import User from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ImageFilterOptions } from 'src/app/models/image-filter-options';
import { getImageSortOptionString } from 'src/app/models/image-sort-options';
import { ImageComparationOption } from 'src/app/models/image-dao-util';

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

  public filterStatusOptions: ImageStatus[] = [];
  public filterUserOptions: User[] = [];
  public sortOptions: ImageComparationOption[] = [];

  constructor(
    private readonly router: Router,
    private readonly notificationService: NzNotificationService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.filterOptions) {
      this.filterOptions = ImageFilterOptions.getDefaultOptions();
    }
    (async () => {
      this.filterStatusOptions = getAllImageStatuses();
      this.filterUserOptions = this.canFilterUser
        ? await this.authService.getAllUser()
        : [];
      this.sortOptions = [
        ImageComparationOption.UPLOAD_LATEST_FIRST,
        ImageComparationOption.UPLOAD_OLDEST_FIRST,
        ImageComparationOption.STATUS_ASC,
        ImageComparationOption.STATUS_DESC,
      ];
      if (this.canFilterUser) {
        this.sortOptions = [
          ...this.sortOptions,
          ImageComparationOption.USER_ASC,
          ImageComparationOption.USER_DESC,
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

  public getSortOptionString(option: ImageComparationOption): string {
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
