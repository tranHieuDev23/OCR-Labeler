import { Component } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ThumbnailService } from 'src/app/services/thumbnail.service';

class Region {
  constructor(
    public x1: number,
    public x2: number,
    public y1: number,
    public y2: number,
    public fullImage: string,
    public thumbnail: string
  ) { }
}

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
  public currentRegion: Region;

  constructor(
    private thumbnail: ThumbnailService
  ) {
    this.initialize();
  }

  initialize() {
    this.errorMessage = null;
    this.displayTools = false;
    this.imageChangedEvent = null;
    this.croppedRegions = [];
    this.currentRegion = null;
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
      event.base64,
      event.base64
    );
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
    this.thumbnail.generateThumbnail(this.currentRegion.thumbnail, 160, 90).then((result) => {
      const newRegion = new Region(
        this.currentRegion.x1,
        this.currentRegion.x2,
        this.currentRegion.y1,
        this.currentRegion.y2,
        this.currentRegion.fullImage,
        result
      );
      this.croppedRegions.push(newRegion);
    });
  }

  resetRegions() {
    this.croppedRegions = [];
  }

  deleteRegion(id: number) {
    this.croppedRegions.splice(id, 1);
  }

  upload() {

  }
}
