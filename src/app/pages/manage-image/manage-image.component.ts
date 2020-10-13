import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RegionSelectedEvent } from 'src/app/components/region-selector/region-selector.component';
import { TextRegion, Region } from 'src/app/models/text-region';
import { BackendService } from 'src/app/services/backend.service';
import { ThumbnailService } from 'src/app/services/thumbnail.service';

@Component({
  selector: 'app-manage-image',
  templateUrl: './manage-image.component.html',
  styleUrls: ['./manage-image.component.scss']
})
export class ManageImageComponent implements OnInit {
  public imageUrl: string;
  public croppedRegions: TextRegion[];
  public croppedRegionImages: string[];
  public currentRegion: Region;
  public currentRegionImage: string;
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

  initialize() {
    this.imageUrl = null;
    this.croppedRegions = [];
    this.croppedRegionImages = [];
    this.currentRegion = null;
    this.currentRegionImage = null;
  }

  fileChangeEvent(imageId: string): void {
    this.initialize();
    this.backend.loadImage(imageId).then((result) => {
      this.imageUrl = result.imageUrl;
      Promise.all(result.textRegions.map(item => {
        return this.thumbnail.generatePolygonImage(this.imageUrl, item.region.vertices);
      })).then((regionImages) => {
        this.croppedRegions = result.textRegions;
        this.croppedRegionImages = regionImages;
      }, (reason) => {
        this.notification.error('Failed to load file', `Reason: ${reason}`);
        this.router.navigateByUrl('/');
      });
    }, (reason) => {
      this.notification.error('Failed to load file', `Reason: ${reason}`);
      this.router.navigateByUrl('/');
    });
  }

  cropped(event: RegionSelectedEvent) {
    this.currentRegion = event.region;
    this.currentRegionImage = event.imageBase64;
  }

  addSelected() {
    this.backend.addTextRegion(this.imageId, this.currentRegion).then((newTextRegion) => {
      this.notification.success('Text region added sucessfully', '');
      this.thumbnail.generatePolygonImage(this.imageUrl, newTextRegion.region.vertices).then((regionImage) => {
        this.croppedRegions.push(newTextRegion);
        this.croppedRegionImages.push(regionImage);
      });
    });
  }

  deleteRegion(id: number) {
    this.backend.deleteTextRegion(this.croppedRegions[id].regionId).then(() => {
      this.notification.success('Text region deleted sucessfully', '');
      this.croppedRegions.splice(id, 1);
      this.croppedRegionImages.splice(id, 1);
    }, (reason) => {
      this.notification.error('Failed to delete text region', `Reason: ${reason}`);
    });
  }

  deleteImage() {
    this.backend.deleteImage(this.imageId).then(() => {
      this.notification.success('Image deleted sucessfully', '');
      this.router.navigateByUrl('/');
    }, (reason) => {
      this.notification.error('Failed to delete image', `Reason: ${reason}`);
    });
  }
}
