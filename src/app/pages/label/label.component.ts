import { Component, HostListener, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TextRegion } from 'src/app/models/text-region';
import { BackendService } from 'src/app/services/backend.service';
import { ThumbnailService } from 'src/app/services/thumbnail.service';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent implements OnInit {
  public regionImage: string = null;
  public label: string = '';
  private region: TextRegion = null;

  constructor(
    private backend: BackendService,
    private thumbnail: ThumbnailService,
    private notification: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.loadRegion();
  }

  loadRegion(): void {
    this.backend.loadRegionForLabeling().then((result) => {
      if (!result) {
        this.regionImage = null;
        this.label = '';
        this.region = null;
        return;
      }
      this.thumbnail.generatePolygonImage(result.imageUrl, result.region.region.vertices)
        .then((image) => {
          this.regionImage = image;
          this.label = '';
          this.region = result.region;
        }, (reason) => {
          this.notification.error('Failed to load the text region', `Reason: ${reason}`);
        });
    }, (reason) => {
      this.notification.error('Failed to load the text region', `Reason: ${reason}`);
    });
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
