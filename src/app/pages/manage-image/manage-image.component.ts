import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { TextRegion, Region } from 'src/app/models/text-region';
import { BackendService } from 'src/app/services/backend.service';
import { ThumbnailService } from 'src/app/services/thumbnail.service';

@Component({
  selector: 'app-manage-image',
  templateUrl: './manage-image.component.html',
  styleUrls: ['./manage-image.component.scss']
})
export class ManageImageComponent implements OnInit {
  public errorMessage: String;
  public displayTools: boolean;
  public imageUrl: string;
  public croppedRegions: TextRegion[];
  public currentRegion: Region;
  public currentRegionImage: string;

  private imageId: string;

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
      this.imageId = params["id"];
      this.fileChangeEvent(this.imageId);
    });
  }

  initialize() {
    this.errorMessage = null;
    this.displayTools = false;
    this.imageUrl = null;
    this.croppedRegions = [];
    this.currentRegion = null;
    this.currentRegionImage = null;
  }

  fileChangeEvent(imageId: string): void {
    this.initialize();
    this.backend.loadImage("123", imageId).then((result) => {
      this.imageUrl = result.imageUrl;
      this.croppedRegions = result.textRegions;
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
    const newRegion = new Region(
      this.currentRegion.x1,
      this.currentRegion.x2,
      this.currentRegion.y1,
      this.currentRegion.y2,
    );
    this.backend.addTextRegion("123", this.imageId, newRegion).then((newTextRegion) => {
      this.thumbnail.generateThumbnail(this.currentRegionImage, 160, 90).then((thumbnail) => {
        this.croppedRegions.push(newTextRegion);
      });
    });
  }

  deleteRegion(id: number) {
    this.backend.deleteTextRegion("123", this.croppedRegions[id].id).then(() => {
      this.croppedRegions.splice(id, 1);
    });
  }

  deleteImage() {
    this.backend.deleteImage("123", this.imageId).then(() => {
      this.router.navigateByUrl("/");
    });
  }
}
