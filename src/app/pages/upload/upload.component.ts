import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Region } from 'src/app/models/text-region';
import { BackendService } from 'src/app/services/backend.service';
import { ThumbnailService } from 'src/app/services/thumbnail.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  public errorMessage: String;
  public displayTools: boolean;
  public imageChangedEvent: any;
  public croppedRegions: Region[];
  public croppedRegionImages: string[];
  public croppedRegionThumbnails: string[];
  public currentRegion: Region;
  public currentRegionImage: string;

  constructor(
    private thumbnail: ThumbnailService,
    private backend: BackendService,
    private router: Router
  ) {
    this.initialize();
  }

  initialize() {
    this.errorMessage = null;
    this.displayTools = false;
    this.imageChangedEvent = null;
    this.croppedRegions = [];
    this.croppedRegionImages = [];
    this.croppedRegionThumbnails = [];
    this.currentRegion = null;
    this.currentRegionImage = null;
  }

  fileChangeEvent(event: any): void {
    this.initialize();
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.currentRegion = new Region(
      event.cropperPosition.x1,
      event.cropperPosition.x2,
      event.cropperPosition.y1,
      event.cropperPosition.y2,
    );
    this.currentRegionImage = event.base64;
  }

  imageLoaded() {
    this.errorMessage = null;
  }

  cropperReady() {
    this.displayTools = true;
  }

  loadImageFailed() {
    this.errorMessage = "File cannot be loaded into image cropper!";
  }

  addSelected() {
    this.thumbnail.generateThumbnail(this.currentRegionImage, 160, 90).then((thumbnail) => {
      const newRegion = new Region(
        this.currentRegion.x1,
        this.currentRegion.x2,
        this.currentRegion.y1,
        this.currentRegion.y2,
      );
      this.croppedRegions.push(newRegion);
      this.croppedRegionImages.push(this.currentRegionImage);
      this.croppedRegionThumbnails.push(thumbnail);
    });
  }

  resetRegions() {
    this.croppedRegions = [];
  }

  deleteRegion(id: number) {
    this.croppedRegions.splice(id, 1);
    this.croppedRegionImages.splice(id, 1);
    this.croppedRegionThumbnails.splice(id, 1);
  }

  upload() {
    this.backend.uploadImage("123", this.imageChangedEvent.srcElement.files[0], this.croppedRegions)
      .then(() => {
        this.router.navigateByUrl('/');
      });
  }
}
