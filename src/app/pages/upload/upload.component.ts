import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NzNotificationData, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';

const NOTIFICATION_DURATION: number = 6000;
const NOTIFCATION_SHOW_LIMIT: number = 8;

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @ViewChild('imageNotification', { static: false }) imageNotificationTemplate: TemplateRef<{}>;
  @ViewChild('briefSuccessNotification', { static: false }) successTemplate: TemplateRef<{}>;
  @ViewChild('briefFailureNotification', { static: false }) failureTemplate: TemplateRef<{}>;
  public successCount: number = 0;
  public failureCount: number = 0;

  private notificationCount: number = 0;
  private exceedSuccessCount: number = 0;
  private exceedFailureCount: number = 0;
  private successRef: NzNotificationData = null;
  private failureRef: NzNotificationData = null;

  constructor(
    private notification: NzNotificationService
  ) { }

  handleChange({ file }: NzUploadChangeParam): void {
    const status = file.status;
    if (status === 'done') {
      this.showSuccessNotification(file);
    } else if (status === 'error') {
      this.showFailureNotification();
    }
  }

  private showSuccessNotification(file: any): void {
    this.successCount++;
    if (this.notificationCount <= NOTIFCATION_SHOW_LIMIT) {
      this.notificationCount++;
      const reader: FileReader = new FileReader();
      reader.onloadend = () => {
        const ref = this.notification.template(this.imageNotificationTemplate, {
          nzDuration: NOTIFICATION_DURATION,
          nzData: {
            imgSrc: reader.result
          }
        });
        ref.onClose.subscribe(() => { this.notificationCount--; });
      };
      reader.readAsDataURL(file.originFileObj);
    } else {
      this.exceedSuccessCount++;
      if (!this.successRef) {
        this.notificationCount++;
        this.successRef = this.notification.template(this.successTemplate, { nzDuration: 0 });
        this.successRef.onClose.subscribe(() => { this.notificationCount--; });
      }
      setTimeout(() => {
        this.exceedSuccessCount--;
        if (this.exceedSuccessCount === 0) {
          this.notification.remove(this.successRef.messageId);
          this.successRef = null;
        }
      }, NOTIFICATION_DURATION);
    }
  }

  private showFailureNotification(): void {
    this.failureCount++;
    this.exceedFailureCount++;
    if (!this.failureRef) {
      this.notificationCount++;
      this.failureRef = this.notification.template(this.failureTemplate, { nzDuration: 0 });
      this.failureRef.onClose.subscribe(() => { this.notificationCount--; })
    }
    setTimeout(() => {
      this.exceedFailureCount--;
      if (this.exceedFailureCount === 0) {
        this.notification.remove(this.failureRef.messageId);
        this.failureRef = null;
      }
    }, NOTIFICATION_DURATION);
  }
}
