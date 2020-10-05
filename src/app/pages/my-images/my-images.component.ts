import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import TextRegion from 'src/app/models/text-region';
import { BackendService } from 'src/app/services/backend.service';

const IMAGE_PER_PAGE: number = 10;

@Component({
  selector: 'app-my-images',
  templateUrl: './my-images.component.html',
  styleUrls: ['./my-images.component.scss']
})
export class MyImagesComponent implements OnInit {
  public textRegions: TextRegion[] = [];
  public images: string[] = [];
  public selectedId: number = 0;
  public selectedRegion: TextRegion = null;
  public isVisible: boolean = false;

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const pageId: number = params['id'] || 1;
      this.loadPage(pageId);
    });
  }

  loadPage(pageId: number): void {
    this.images = [];
    this.backend.loadUserImages('123', IMAGE_PER_PAGE * (pageId - 1), IMAGE_PER_PAGE).then((result) => {
      this.textRegions = result;
      this.images = this.textRegions.map((value) => value.thumbnailUrl);
    }, (reason) => {

    });
  }

  onImageClicked(id: number): void {

  }
}
