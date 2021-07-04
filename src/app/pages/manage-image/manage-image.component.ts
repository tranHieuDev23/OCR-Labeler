import { Location } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NzContextMenuService,
  NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  RegionClickedEvent,
  RegionSelectorComponent,
} from 'src/app/components/region-selector/region-selector.component';
import { ImageComparationOption } from 'src/app/models/image-dao-util';
import ImageStatus, { isPublishedStatus } from 'src/app/models/image-status';
import { TextRegion, Region, Coordinate } from 'src/app/models/text-region';
import UploadedImage from 'src/app/models/uploaded-image';
import { BackendService } from 'src/app/services/backend.service';
import { ThumbnailService } from 'src/app/services/thumbnail.service';
import { ImageFilterOptions } from 'src/app/models/image-filter-options';
import { AuthService } from 'src/app/services/auth.service';
import { JsonCompressService } from 'src/app/services/json-compress.service';
import { PlatformService } from 'src/app/services/platform.service';
import User from 'src/app/models/user';
@Component({
  selector: 'app-manage-image',
  templateUrl: './manage-image.component.html',
  styleUrls: ['./manage-image.component.scss'],
})
export class ManageImageComponent implements OnInit {
  @ViewChild(RegionSelectorComponent, { static: false })
  regionSelector: RegionSelectorComponent;
  @ViewChild('regionContextMenu', { static: false })
  regionContextMenu: NzDropdownMenuComponent;

  public imageUrl: string;
  public croppedRegions: TextRegion[];
  public croppedRegionImages: string[];
  public croppedRegionRegions: Coordinate[][];
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
  private keyPressed: boolean = false;
  private filterOptions: ImageFilterOptions;

  constructor(
    private readonly auth: AuthService,
    private backend: BackendService,
    private route: ActivatedRoute,
    private location: Location,
    private notification: NzNotificationService,
    private thumbnail: ThumbnailService,
    private router: Router,
    private contextService: NzContextMenuService,
    private readonly jsonCompress: JsonCompressService,
    private readonly platformService: PlatformService
  ) {
    this.initialize();
  }

  ngOnInit(): void {
    (async () => {
      const user = await this.auth.getCurrentUser();
      this.route.queryParams.subscribe((queryParams) => {
        this.route.params.subscribe((params) => {
          this.imageId = params.id;
          const filter: string = queryParams.filter;
          this.filterOptions = filter
            ? ImageFilterOptions.parseFromJson(
                this.jsonCompress.decompress(filter)
              )
            : this.getDefaultFilterOptions(user);
          this.fileChangeEvent(this.imageId);
        });
      });
    })().then(
      () => {},
      (e) => {
        this.notification.error('Cannot initialize page', e);
        if (this.platformService.isBrowser()) {
          this.location.back();
        }
      }
    );
  }

  private getDefaultFilterOptions(user: User): ImageFilterOptions {
    return new ImageFilterOptions(
      ImageComparationOption.UPLOAD_LATEST_FIRST,
      [],
      [user.username],
      []
    );
  }

  initialize(): void {
    this.imageUrl = '';
    this.croppedRegions = [];
    this.croppedRegionImages = [];
    this.croppedRegionRegions = [];
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
            this.croppedRegionRegions = this.croppedRegions.map(
              (item) => item.region.vertices
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

  onRegionCropped(event: Coordinate[]): void {
    this.thumbnail.generatePolygonImage(this.imageUrl, event).then((image) => {
      this.selectedRegion = new Region(event);
      this.selectedRegionImage = image;
    });
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
        this.prevImage();
        return;
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage();
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
            this.croppedRegionRegions = this.croppedRegions.map(
              (item) => item.region.vertices
            );
            this.regionSelector.clearSelected();
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
        this.croppedRegionRegions = this.croppedRegions.map(
          (item) => item.region.vertices
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
            filter: this.jsonCompress.compress(this.filterOptions.getJson()),
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
      this.backend.loadNextImage(this.imageId, this.filterOptions)
    );
  }

  prevImage(): void {
    this.loadOtherImage(
      this.backend.loadPrevImage(this.imageId, this.filterOptions)
    );
  }
}
