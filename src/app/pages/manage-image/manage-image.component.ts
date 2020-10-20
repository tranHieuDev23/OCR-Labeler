import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RegionSelectedEvent, RegionSelectorComponent } from 'src/app/components/region-selector/region-selector.component';
import ImageStatus from 'src/app/models/image-status';
import { TextRegion, Region } from 'src/app/models/text-region';
import { BackendService } from 'src/app/services/backend.service';
import { ThumbnailService } from 'src/app/services/thumbnail.service';

@Component({
  selector: 'app-manage-image',
  templateUrl: './manage-image.component.html',
  styleUrls: ['./manage-image.component.scss']
})
export class ManageImageComponent implements OnInit {
  @ViewChild(RegionSelectorComponent, { static: false }) regionSelector: RegionSelectorComponent;

  public imageUrl: string;
  public croppedRegions: TextRegion[];
  public croppedRegionImages: string[];
  public status: ImageStatus;
  public isPublishing: boolean;
  public selectedRegion: Region;
  public selectedRegionImage: string;
  private imageId: string;

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private router: Router,
    private notification: NzNotificationService,
    private thumbnail: ThumbnailService,
  ) {
    this.initialize();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.initialize();
      this.imageId = params['id'];
      this.fileChangeEvent(this.imageId);
    });
  }

  initialize(): void {
    this.imageUrl = null;
    this.croppedRegions = [];
    this.croppedRegionImages = [];
    this.status = null;
    this.isPublishing = false;
    this.selectedRegion = null;
    this.selectedRegionImage = null;
  }

  fileChangeEvent(imageId: string): void {
    this.initialize();
    this.backend.loadImage(imageId).then((result) => {
      this.imageUrl = result.imageUrl;
      this.status = result.status;
      Promise.all(result.textRegions.map(item => {
        return this.thumbnail.generatePolygonImage(this.imageUrl, item.region.vertices);
      })).then((regionImages) => {
        this.croppedRegions = result.textRegions;
        this.croppedRegionImages = regionImages;
        this.regionSelector.highlight(result.textRegions.map(item => item.region.vertices));
      }, (reason) => {
        this.notification.error('Failed to load file', `Reason: ${reason}`);
        this.router.navigateByUrl('/');
      });
    }, (reason) => {
      this.notification.error('Failed to load file', `Reason: ${reason}`);
      this.router.navigateByUrl('/');
    });
  }

  cropped(event: RegionSelectedEvent): void {
    this.selectedRegion = event.region;
    this.selectedRegionImage = event.imageBase64;
  }

  addSelected(): void {
    this.backend.addTextRegion(this.imageId, this.selectedRegion).then((newTextRegion) => {
      this.notification.success('Text region added successfully', '');
      this.thumbnail.generatePolygonImage(this.imageUrl, newTextRegion.region.vertices).then((regionImage) => {
        this.croppedRegions.push(newTextRegion);
        this.croppedRegionImages.push(regionImage);
        this.regionSelector.clearSelected();
        this.regionSelector.highlight(this.croppedRegions.map(item => item.region.vertices));
        this.selectedRegion = null;
        this.selectedRegionImage = null;
      });
    });
  }

  regionClicked(id: number): void {

  }

  deleteRegion(id: number) {
    this.backend.deleteTextRegion(this.croppedRegions[id].regionId).then(() => {
      this.notification.success('Text region deleted successfully', '');
      this.croppedRegions.splice(id, 1);
      this.croppedRegionImages.splice(id, 1);
      this.regionSelector.highlight(this.croppedRegions.map(item => item.region.vertices));
    }, (reason) => {
      this.notification.error('Failed to delete text region', `Reason: ${reason}`);
    });
  }

  publishImage() {
    this.isPublishing = true;
    this.backend.publishImage(this.imageId).then(() => {
      this.notification.success('Image published successfully', '');
      this.status = ImageStatus.Published;
      this.isPublishing = false;
    }, (reason) => {
      this.notification.error('Failed to publish image', `Reason: ${reason}`);
      this.isPublishing = false;
    });
  }

  deleteImage() {
    this.backend.deleteImage(this.imageId).then(() => {
      this.notification.success('Image deleted successfully', '');
      this.router.navigateByUrl('/');
    }, (reason) => {
      this.notification.error('Failed to delete image', `Reason: ${reason}`);
    });
  }
}
