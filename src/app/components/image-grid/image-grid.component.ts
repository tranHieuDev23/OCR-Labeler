import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SelectContainerComponent } from 'ngx-drag-to-select';
import ImageStatus, { getImageStatusColor, getImageStatusString } from 'src/app/models/image-status';
import UploadedImage from 'src/app/models/uploaded-image';

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.scss']
})
export class ImageGridComponent implements OnInit {
  @ViewChild(SelectContainerComponent) selectContainer: SelectContainerComponent;
  @Input('images') public images: UploadedImage[];
  @Input('emptyText') public emptyText: string = "There is no image";
  @Input('loading') public loading: boolean = true;
  @Output('imageClicked') public imageClicked = new EventEmitter<number>();
  @Output('imagesSelected') public imagesSelected = new EventEmitter<UploadedImage[]>();

  public selectedImages: UploadedImage[] = [];

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

  onDbClick(id: number) {
    this.imageClicked.emit(id);
  }

  onSelected() {
    this.imagesSelected.emit(this.selectedImages);
  }

  onContextSelect(image: UploadedImage): void {
    if (this.selectedImages.length < 2) {
      this.selectContainer.clearSelection();
      this.selectContainer.selectItems((item: UploadedImage) => item.imageId === image.imageId);
    }
  }
}
