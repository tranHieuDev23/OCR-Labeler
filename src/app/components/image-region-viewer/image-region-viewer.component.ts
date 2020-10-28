import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TextRegion } from 'src/app/models/text-region';
import { ThumbnailService } from 'src/app/services/thumbnail.service';

@Component({
  selector: 'app-image-region-viewer',
  templateUrl: './image-region-viewer.component.html',
  styleUrls: ['./image-region-viewer.component.scss']
})
export class ImageRegionViewerComponent implements OnInit, OnChanges {
  @Input("imageSrc") imageSrc: string = null;
  @Input("region") region: TextRegion = null;
  regionImage: string = null;
  highlightedImage: string = null;

  constructor(
    private thumbnail: ThumbnailService
  ) { }

  ngOnInit(): void {
    this.reloadImage();
  }


  ngOnChanges(changes: SimpleChanges): void {
    this.reloadImage();
  }

  private reloadImage(): void {
    this.thumbnail.generatePolygonImage(this.imageSrc, this.region.region.vertices).then((regionImage) => {
      this.regionImage = regionImage;
      this.thumbnail.generateHighlightedImage(this.imageSrc, this.region.region.vertices).then((highlightedImage) => {
        this.highlightedImage = highlightedImage;
      });
    });
  }
}
