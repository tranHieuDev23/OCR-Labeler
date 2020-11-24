import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ZoomableImageComponent } from 'src/app/components/zoomable-image/zoomable-image.component';
import { Coordinate, TextRegion } from 'src/app/models/text-region';
import { AuthService } from 'src/app/services/auth.service';
import { BackendService } from 'src/app/services/backend.service';
import { ThumbnailService } from 'src/app/services/thumbnail.service';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent implements OnInit {
  @ViewChild('zoomableImage') zoomableImage: ZoomableImageComponent;
  public highlightImage: string;
  public highlightRegion: Coordinate[];
  public label: string;
  public sameUser: boolean = false;
  public region: TextRegion;

  constructor(
    private auth: AuthService,
    private backend: BackendService,
    private thumbnail: ThumbnailService,
    private notification: NzNotificationService
  ) {
    this.initializeEmpty();
  }

  initializeEmpty(): void {
    this.highlightImage = null;
    this.highlightRegion = null;
    this.label = '';
    this.region = null;
  }

  ngOnInit(): void {
    this.loadRegion();
  }

  loadRegion(): void {
    this.backend.loadRegionForLabeling(this.sameUser).then((result) => {
      this.initializeEmpty();
      if (!result) {
        return;
      }
      this.label = result.region.suggestion || '';
      this.region = result.region;
      this.thumbnail.generateHighlightedImage(result.imageUrl, result.region.region.vertices).then((highlightImage) => {
        this.highlightImage = highlightImage;
        this.highlightRegion = result.region.region.vertices;
        this.zoomableImage.resetZoom();
      });
    }, (reason) => {
      this.notification.error('Failed to load the text region', `Reason: ${reason}`);
    });
  }

  changeSameUser(): void {
    if (this.sameUser) {
      this.auth.getCurrentUser().then((user) => {
        if (this.region.uploadedBy.username !== user.username) {
          this.loadRegion();
        }
      });
    }
  }

  submit(cantLabel: boolean): void {
    const label = cantLabel ? '' : this.label;
    this.backend.labelRegion(this.region.regionId, cantLabel, label).then(() => {
      this.notification.success('Text region labeled successfully', '');
      this.loadRegion();
    }, (reason) => {
      this.notification.error('Failed to label the text region', `Reason: ${reason}`);
    });
  }

  @HostListener('document: keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (this.label.length == 0) {
          break;
        }
        this.submit(false);
        break;
      case 'Tab':
        event.preventDefault();
        this.loadRegion();
        break;
    }
  }
}
