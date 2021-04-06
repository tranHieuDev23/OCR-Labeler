import { HostListener } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Coordinate, TextRegion } from 'src/app/models/text-region';
import { BackendService } from 'src/app/services/backend.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  public region: TextRegion = null;
  public highlightImage: string = null;
  public highlightRegion: Coordinate[] = null;

  constructor(
    private backend: BackendService,
    private notification: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.loadRegion();
  }

  loadRegion(): void {
    this.backend.loadRegionForLabeled().then((result) => {
      if (!result) {
        this.region = null;
        this.highlightImage = null;
        this.highlightRegion = null;
        return;
      }
      this.region = result.region;
      this.highlightImage = result.imageUrl;
      this.highlightRegion = result.region.region.vertices;
    }, (reason) => {
      this.notification.error('Failed to load the text region', `Reason: ${reason}`);
    });
  }

  submit(isCorrect: boolean): void {
    this.backend.reviewLabel(this.region.regionId, isCorrect).then(() => {
      this.notification.success('Text region reviewed successfully', '');
      this.loadRegion();
    }, (reason) => {
      console.log(this.region.label,"label");
      
      this.notification.error('Failed to review the text region', `Reason: ${reason}`);
    });
  }

  // @HostListener('document: keydown', ['$event'])
  // handleKeyboardEvent(event: KeyboardEvent): void {
  //   switch (event.key) {
  //     case 'y':
  //       event.preventDefault();
  //       this.submit(true);
  //       break;
  //     case 'n':
  //       event.preventDefault();
  //       this.submit(false);
  //       break;
  //     case 'Tab':
  //       event.preventDefault();
  //       this.loadRegion();
  //       break;
  //   }
  // }
}
