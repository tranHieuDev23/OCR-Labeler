import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.scss']
})
export class ImageGridComponent implements OnInit {
  @Input("images") public images: string[];
  @Input("emptyText") public emptyText: string = "There is no image";
  @Output("imageClicked") public imageClicked = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  onClick(id: number) {
    this.imageClicked.emit(id);
  }
}
