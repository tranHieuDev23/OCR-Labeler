import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BackendService } from 'src/app/services/backend.service';

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
