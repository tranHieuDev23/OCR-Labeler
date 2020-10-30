import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import ImageStatus, { getImageStatusColor, getImageStatusString } from 'src/app/models/image-status';
import UploadedImage from 'src/app/models/uploaded-image';

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.scss']
})
export class ImageGridComponent implements OnInit {
  @Input('images') public images: UploadedImage[];
  @Input('emptyText') public emptyText: string = "There is no image";
  @Input('loading') public loading: boolean = true;
  @Output('imageClicked') public imageClicked = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  statusColor(status: ImageStatus): string {
    return getImageStatusColor(status);
  }

  statusString(status: ImageStatus): string {
    return getImageStatusString(status);
  }

  dateTimeString(date: Date): string {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  onClick(id: number) {
    this.imageClicked.emit(id);
  }
}
