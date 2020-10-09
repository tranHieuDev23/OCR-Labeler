import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Coordinate, Region } from 'src/app/models/text-region';
import { BackendService } from 'src/app/services/backend.service';
import { ThumbnailService } from 'src/app/services/thumbnail.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @ViewChild('imageNotification', { static: false }) imageNotificationTemplate: TemplateRef<{}>;

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
    private router: Router,
    private notification: NzNotificationService
  ) {
    this.initialize();
  }

  initialize() {
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
    const x1: number = event.cropperPosition.x1;
    const x2: number = event.cropperPosition.x2;
    const y1: number = event.cropperPosition.y1;
    const y2: number = event.cropperPosition.y2;
    this.currentRegion = new Region([
      new Coordinate(x1, y1),
      new Coordinate(x1, y2),
      new Coordinate(x2, y2),
      new Coordinate(x2, y1)
    ]);
    this.currentRegionImage = event.base64;
  }

  imageLoaded() {
  }

  cropperReady() {
    this.displayTools = true;
  }

  loadImageFailed() {
    this.notification.error('Failed to load file', 'The selected file may be of incorrect format or corrupted');
  }

  addSelected() {
    this.thumbnail.generateThumbnail(this.currentRegionImage, 160, 90).then((thumbnail) => {
      this.croppedRegions.push(this.currentRegion);
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
    const imageFile: File = this.imageChangedEvent.srcElement.files[0];
    this.backend.uploadImage('123', imageFile, this.croppedRegions)
      .then(() => {
        const reader: FileReader = new FileReader();
        reader.onloadend = () => {
          this.notification.template(this.imageNotificationTemplate, {
            nzDuration: 6000,
            nzData: {
              title: 'File uploaded sucessfully',
              description: 'Text regions will be automatically detected. You can edit them via My Images page.',
              imgSrc: reader.result
            }
          });
          this.router.navigateByUrl('/');
        };
        reader.readAsDataURL(imageFile);
      }, (reason) => {
        this.notification.error('Failed to upload file', `Reason: ${reason}`);
      });
  }
}
