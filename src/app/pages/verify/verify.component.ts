import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TextRegion } from 'src/app/models/text-region';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-label',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
  public textRegions: TextRegion[] = [];
  public images: string[] = [];
  public selectedId: number = 0;
  public selectedRegion: TextRegion = null;
  public isVisible: boolean = false;

  constructor(
    private backend: BackendService,
    private router: Router,
    private notification: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.backend.loadRegionsForVerifying('123', 10).then((result) => {
      this.textRegions = result;
      this.images = this.textRegions.map((value) => value.thumbnailUrl);
    }, (reason) => {
      this.notification.error('Failed to load text regions', `Reason: ${reason}`);
      this.router.navigateByUrl('/');
    });
  }

  showModal(id: number): void {
    this.selectedId = id;
    this.selectedRegion = this.textRegions[id];
    this.isVisible = true;
  }

  hideModal(): void {
    this.selectedId = 0;
    this.selectedRegion = null;
    this.isVisible = false;
  }

  submit(isCorrect: boolean): void {
    this.backend.verifyLabel(this.selectedRegion.id, isCorrect).then(() => {
      this.notification.success('Verify text region sucessfully', '');
      this.backend.loadRegionsForVerifying('123', 1).then((result) => {
        this.textRegions[this.selectedId] = result[0];
        this.images[this.selectedId] = result[0].thumbnailUrl;
        this.hideModal();
      }, (reason) => {
        this.textRegions.splice(this.selectedId, 1);
        this.images.splice(this.selectedId, 1);
        this.hideModal();
        this.notification.error('Failed to load new text region', `Reason: ${reason}`);
      });
    }, (reason) => {
      this.notification.error('Failed to verify text region', `Reason: ${reason}`);
    });
  }
}
