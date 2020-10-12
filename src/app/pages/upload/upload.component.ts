import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @ViewChild('imageNotification', { static: false }) imageNotificationTemplate: TemplateRef<{}>;

  constructor(
    private notification: NzNotificationService
  ) { }

  handleChange({ file }: NzUploadChangeParam): void {
    const status = file.status;
    if (status === 'done') {
      const reader: FileReader = new FileReader();
      reader.onloadend = () => {
        this.notification.template(this.imageNotificationTemplate, {
          nzDuration: 6000,
          nzData: {
            title: 'File uploaded sucessfully',
            description: 'Text regions will be automatically detected. You can edit them via My Images page.',
            imgSrc: file.thumbUrl
          }
        });
      };
    } else if (status === 'error') {
      this.notification.error('Failed to upload file', '');
    }
  }
}
