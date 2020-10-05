import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { BackendService } from 'src/app/services/backend.service';
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
  selector: 'app-manage-image',
  templateUrl: './manage-image.component.html',
  styleUrls: ['./manage-image.component.scss']
})
export class ManageImageComponent implements OnInit {
  public errorMessage: String;
  public displayTools: boolean;
  public imageUrl: string;
  public croppedRegions: Region[];
  public currentRegion: Region;

  constructor(
    private thumbnail: ThumbnailService,
    private backend: BackendService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.initialize();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.initialize();
      const id: string = params["id"];
      this.fileChangeEvent(id);
    });
  }

  initialize() {
    this.errorMessage = null;
    this.displayTools = false;
    this.imageUrl = null;
    this.croppedRegions = [];
    this.currentRegion = null;
  }

  fileChangeEvent(imageId: string): void {
    this.initialize();
    this.backend.loadImage("123", imageId).then((result) => {
      console.log(result);
      this.imageUrl = result.imageUrl;
      this.croppedRegions = result.textRegions.map((item) => new Region(
        item.left,
        item.right,
        item.top,
        item.bottom,
        item.imageUrl,
        item.thumbnailUrl));
    }, (reason) => {
      this.errorMessage = "Cannot load image!";
    });
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
