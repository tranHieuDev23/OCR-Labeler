import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ExportProgress } from 'src/app/models/export-progress';
import { ExportResult } from 'src/app/models/export-result';
import { ImageFilterOptions } from 'src/app/models/image-filter-options';
import ImageStatus from 'src/app/models/image-status';
import UploadedImage from 'src/app/models/uploaded-image';
import { BackendService } from 'src/app/services/backend.service';

// const DEFAULT_IMAGES_PER_PAGE = 12;

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
})
export class ExportComponent implements OnInit {
  public exported: boolean = false;
  public state: string = 'READY';
  public lastExported: Date = null;

  constructor(
    // private readonly router: Router,
    private backend: BackendService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.backend.getExportStatus().then(
      (status) => {
        this.exported = status.exported;
        this.state = status.state;
        this.lastExported = new Date(status.timestamp);
      },
      (reason) => {
        this.notification.error(
          'Failed to load export status',
          `Reason: ${reason}`
        );
      }
    );
  }

  requestExport(): void {
    this.backend.requestExport().then(
      () => {
        this.state = 'EXPORTING';
      },
      (reason) => {
        this.notification.error(
          'Failed to request export',
          `Reason: ${reason}`
        );
      }
    );
  }

  download(): void {
    this.backend.downloadExport();
  }
}
