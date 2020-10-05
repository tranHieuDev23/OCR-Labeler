import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import UploadedImage from 'src/app/models/uploaded-image';
import { BackendService } from 'src/app/services/backend.service';

const IMAGES_PER_PAGE: number = 10;

@Component({
  selector: 'app-my-images',
  templateUrl: './my-images.component.html',
  styleUrls: ['./my-images.component.scss']
})
export class MyImagesComponent implements OnInit {
  public currentPage: number = null;
  public imagesPerPage: number = IMAGES_PER_PAGE;
  public imagesCount: number = null;
  public uploadedImages: UploadedImage[] = [];
  public images: string[] = [];
  public selectedId: number = 0;
  public selectedRegion: UploadedImage = null;
  public isVisible: boolean = false;

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const pageId: number = params['id'] || 1;
      this.loadPage(pageId);
    });
  }

  loadPage(pageId: number): void {
    this.currentPage = pageId;
    this.images = [];
    this.backend.loadUserImages('123', IMAGES_PER_PAGE * (pageId - 1), IMAGES_PER_PAGE).then((result) => {
      this.imagesCount = result.imagesCount;
      this.uploadedImages = result.images;
      this.images = this.uploadedImages.map((value) => value.thumbnailUrl);
    }, (reason) => {

    });
  }

  onImageClicked(id: number): void {
    this.router.navigateByUrl(`/manage-image/${this.uploadedImages[id].imageId}`);
  }

  changePage(event: any): void {
    if (event == this.currentPage) {
      return;
    }
    this.router.navigateByUrl(`/my-images/${event}`);
  }
}
