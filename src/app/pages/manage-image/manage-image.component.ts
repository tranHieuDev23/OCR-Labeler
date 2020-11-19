import { Location } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  RegionClickedEvent,
  RegionCroppedEvent,
  RegionSelectorComponent,
} from 'src/app/components/region-selector/region-selector.component';
import { ImageComparationOption } from 'src/app/models/image-compare-funcs';
import ImageStatus, { isPublishedStatus } from 'src/app/models/image-status';
import { TextRegion, Region } from 'src/app/models/text-region';
import UploadedImage from 'src/app/models/uploaded-image';
import { BackendService } from 'src/app/services/backend.service';
import { ThumbnailService } from 'src/app/services/thumbnail.service';

@Component({
  selector: 'app-manage-image',
  templateUrl: './manage-image.component.html',
  styleUrls: ['./manage-image.component.scss'],
})
export class ManageImageComponent implements OnInit {
  @ViewChild(RegionSelectorComponent, { static: false }) regionSelector: RegionSelectorComponent;
  @ViewChild('regionContextMenu', { static: false }) regionContextMenu: NzDropdownMenuComponent;

  public imageUrl: string;
  public croppedRegions: TextRegion[];
  public croppedRegionImages: string[];
  public status: ImageStatus;
  public isPublishing: boolean;

  public selectedRegion: Region;
  public selectedRegionImage: string;

  public modalRegionId: number = null;
  public modalRegion: TextRegion = null;
  public modalRegionImage: string = null;

  public contextMenuRegionId: number = -1;
  public contextMenuShowAdd: boolean = false;

  private imageId: string;
  private imageComparator: ImageComparationOption;
  private filteredStatuses: ImageStatus[];
  private filteredUsers: string[];
  private keyPressed: boolean = false;

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private location: Location,
    private notification: NzNotificationService,
    private thumbnail: ThumbnailService,
    private router: Router,
    private contextService: NzContextMenuService
  ) {
    this.initialize();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      this.route.params.subscribe((params) => {
        this.initialize();
        this.imageId = params['id'];
        this.imageComparator =
          (queryParams['sort'] as ImageComparationOption) ||
          ImageComparationOption.UPLOAD_LATEST_FIRST;
        const statuses: string = queryParams['statuses'] || '';
        this.filteredStatuses = statuses.split(',').map(item => item.trim()).filter(item => item.length > 0).map(item => item as ImageStatus);
        const users: string = queryParams['users'] || '';
        this.filteredUsers = users.split(',').map(item => item.trim()).filter(item => item.length > 0);
        this.fileChangeEvent(this.imageId);
      });
    });
  }

  initialize(): void {
    this.imageUrl = '';
    this.croppedRegions = [];
    this.croppedRegionImages = [];
    this.status = null;
    this.isPublishing = false;
    this.selectedRegion = null;
    this.selectedRegionImage = null;
  }

  fileChangeEvent(imageId: string): void {
    this.initialize();
    this.backend.loadImage(imageId).then(
      (result) => {
        this.imageUrl = result.imageUrl;
        this.status = result.status;
        Promise.all(
          result.textRegions.map((item) => {
            return this.thumbnail.generatePolygonImage(
              this.imageUrl,
              item.region.vertices
            );
          })
        ).then(
          (regionImages) => {
            this.croppedRegions = result.textRegions;
            this.croppedRegionImages = regionImages;
            this.regionSelector.highlight(
              result.textRegions.map((item) => item.region.vertices)
            );
          },
          (reason) => {
            this.notification.error('Failed to load file', `Reason: ${reason}`);
            this.location.back();
          }
        );
      },
      (reason) => {
        this.notification.error('Failed to load file', `Reason: ${reason}`);
        this.location.back();
      }
    );
  }

  onRegionCropped(event: RegionCroppedEvent): void {
    this.selectedRegion = event.region;
    this.selectedRegionImage = event.imageBase64;
  }

  @HostListener('document: keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.keyPressed || this.modalRegion) {
      return;
    }
    this.keyPressed = true;
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.addSelected();
        return;
      case 'ArrowLeft':
        event.preventDefault();
        this.nextImage();
        return;
      case 'ArrowRight':
        event.preventDefault();
        this.prevImage();
        return;
    }
  }

  @HostListener('document: keyup')
  onKeyUp(): void {
    this.keyPressed = false;
  }

  addSelected(): void {
    if (!this.selectedRegion) {
      return;
    }
    this.backend
      .addTextRegion(this.imageId, this.selectedRegion)
      .then((newTextRegion) => {
        this.notification.success('Text region added successfully', '');
        this.thumbnail
          .generatePolygonImage(this.imageUrl, newTextRegion.region.vertices)
          .then((regionImage) => {
            this.croppedRegions.push(newTextRegion);
            this.croppedRegionImages.push(regionImage);
            this.regionSelector.clearSelected();
            this.regionSelector.highlight(
              this.croppedRegions.map((item) => item.region.vertices)
            );
            this.selectedRegion = null;
            this.selectedRegionImage = null;
          });
      });
  }

  onRegionDbClicked(event: RegionClickedEvent): void {
    if (event.id !== null && event.id !== RegionClickedEvent.SELECTION_ID) {
      this.showModal(event.id);
    }
  }

  onRegionRightClicked(event: RegionClickedEvent): void {
    if (event.id === null) {
      this.contextService.close(true);
    }
    if (event.id !== RegionClickedEvent.SELECTION_ID) {
      this.contextMenuRegionId = event.id;
      this.contextMenuShowAdd = false;
    } else {
      this.contextMenuRegionId = null;
      this.contextMenuShowAdd = true;
    }
    this.contextService.create(event.event, this.regionContextMenu);
  }

  changeCroppingOption(): void {
    this.regionSelector.changeCroppingOption();
  }

  showModal(regionId: number): void {
    this.modalRegionId = regionId;
    this.modalRegion = this.croppedRegions[regionId];
    this.modalRegionImage = this.croppedRegionImages[regionId];
  }

  closeModal(): void {
    this.modalRegionId = null;
    this.modalRegion = null;
    this.modalRegionImage = null;
  }

  deleteRegion(id: number) {
    this.backend.deleteTextRegion(this.croppedRegions[id].regionId).then(
      () => {
        this.notification.success('Text region deleted successfully', '');
        this.croppedRegions.splice(id, 1);
        this.croppedRegionImages.splice(id, 1);
        this.regionSelector.highlight(
          this.croppedRegions.map((item) => item.region.vertices)
        );
        this.closeModal();
      },
      (reason) => {
        this.notification.error(
          'Failed to delete text region',
          `Reason: ${reason}`
        );
      }
    );
  }

  publishImage() {
    this.isPublishing = true;
    this.backend.publishImage(this.imageId).then(
      () => {
        this.notification.success('Image published successfully', '');
        this.status = ImageStatus.PrePublished;
        this.isPublishing = false;
      },
      (reason) => {
        this.notification.error('Failed to publish image', `Reason: ${reason}`);
        this.isPublishing = false;
      }
    );
  }

  deleteImage() {
    this.backend.deleteImage(this.imageId).then(
      () => {
        this.notification.success('Image deleted successfully', '');
        this.location.back();
      },
      (reason) => {
        this.notification.error('Failed to delete image', `Reason: ${reason}`);
      }
    );
  }

  isPublishedStatus(): boolean {
    return isPublishedStatus(this.status);
  }

  loadOtherImage(image: Promise<UploadedImage>): void {
    image.then(
      (nextImage) => {
        window.scrollTo(0, 0);
        this.router.navigate([`/manage-image/${nextImage.imageId}`], {
          queryParams: {
            sort: this.imageComparator,
            statuses: this.filteredStatuses.join(','),
            users: this.filteredUsers.join(',')
          },
        });
      },
      (reason) => {
        this.notification.error(
          'Failed to load next image',
          `Reason: ${reason}`
        );
      }
    );
  }

  nextImage(): void {
    this.loadOtherImage(
      this.backend.loadNextImage(
        this.imageId,
        this.imageComparator,
        this.filteredStatuses,
        this.filteredUsers
      )
    );
  }

  prevImage(): void {
    this.loadOtherImage(
      this.backend.loadPrevImage(
        this.imageId,
        this.imageComparator,
        this.filteredStatuses,
        this.filteredUsers
      )
    );
  }
}
