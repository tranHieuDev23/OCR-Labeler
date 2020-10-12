import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TextRegion } from 'src/app/models/text-region';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent implements OnInit {
  public textRegions: TextRegion[] = [];
  public images: string[] = [];
  public selectedId: number = 0;
  public selectedRegion: TextRegion = null;
  public selectedLabel: string = '';
  public isVisible: boolean = false;

  constructor(
    private backend: BackendService,
    private notification: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.backend.loadRegionsForLabeling('123', 10).then((result) => {
      this.textRegions = result;
      // this.images = this.textRegions.map((value) => value.thumbnailUrl);
    }, (reason) => {

    });
  }

  showModal(id: number): void {
    this.selectedId = id;
    this.selectedRegion = this.textRegions[id];
    this.selectedLabel = '';
    this.isVisible = true;
  }

  hideModal(): void {
    this.selectedId = 0;
    this.selectedRegion = null;
    this.selectedLabel = '';
    this.isVisible = false;
  }

  submit(canLabel: boolean): void {
    this.backend.labelRegion(this.selectedRegion.regionId, canLabel, this.selectedLabel).then(() => {
      this.notification.success('Label text region sucessfully', '');
      this.backend.loadRegionsForLabeling('123', 1).then((result) => {
        this.textRegions[this.selectedId] = result[0];
        // this.images[this.selectedId] = result[0].thumbnailUrl;
        this.hideModal();
      }, (reason) => {
        this.textRegions.splice(this.selectedId, 1);
        this.images.splice(this.selectedId, 1);
        this.hideModal();
        this.notification.error('Failed to load new text region', `Reason: ${reason}`);
      });
    }, (reason) => {
      this.notification.error('Failed to label text region', `Reason: ${reason}`);
    });
  }
}
