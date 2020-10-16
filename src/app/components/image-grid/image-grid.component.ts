import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import UploadedImage from 'src/app/models/uploaded-image';

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.scss']
})
export class ImageGridComponent implements OnInit {
  @Input('images') public images: UploadedImage[];
  @Input('emptyText') public emptyText: string = "There is no image";
  @Output('imageClicked') public imageClicked = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  dateTimeString(date: Date): string {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  onClick(id: number) {
    this.imageClicked.emit(id);
  }
}
