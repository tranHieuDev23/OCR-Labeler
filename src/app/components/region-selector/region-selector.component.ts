import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Coordinate, Region } from 'src/app/models/text-region';
import { ThumbnailService } from 'src/app/services/thumbnail.service';

export class RegionSelectedEvent {
  constructor(
    public readonly region: Region,
    public readonly imageBase64: string
  ) { }
}

@Component({
  selector: 'app-region-selector',
  templateUrl: './region-selector.component.html',
  styleUrls: ['./region-selector.component.scss']
})
export class RegionSelectorComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  @Input('imageSrc') imageSrc: string;
  @Output('imageCropped') public imageCropped: EventEmitter<RegionSelectedEvent> = new EventEmitter<RegionSelectedEvent>();
  private imageElement = new Image();
  private isImageLoaded: boolean = false;

  private selectedCoordinates: Coordinate[] = [];

  constructor(
    private thumbnail: ThumbnailService
  ) { }

  ngOnInit(): void {
    this.imageElement.onload = () => {
      this.isImageLoaded = true;
      this.drawCanvas();
    };
    if (window) {
      window.onresize = () => {
        this.drawCanvas();
      };
    }
    this.imageElement.src = this.imageSrc;
    this.canvas.nativeElement.addEventListener('mousedown', (event) => {
      this.handleMouseOnCanvas(this.getCanvasPosition(event.clientX, event.clientY));
    });
    this.canvas.nativeElement.addEventListener('touchstart', (event) => {
      this.handleMouseOnCanvas(this.getCanvasPosition(event.touches[0].clientX, event.touches[0].clientY));
    });
  }

  private getCanvasPosition(clientX: number, clientY: number): Coordinate {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = (clientX - rect.left) / this.canvas.nativeElement.offsetWidth;
    const y = (clientY - rect.top) / this.canvas.nativeElement.offsetHeight;
    return new Coordinate(x, y);
  }

  private handleMouseOnCanvas(coordinate: Coordinate) {
    if (this.selectedCoordinates.length == 4) {
      this.selectedCoordinates = [];
    }
    this.selectedCoordinates.push(coordinate);
    if (this.selectedCoordinates.length == 4) {
      this.thumbnail.generatePolygonImage(this.imageSrc, this.selectedCoordinates)
        .then((result) => {
          this.imageCropped.emit(new RegionSelectedEvent(
            new Region(this.selectedCoordinates),
            result
          ));
        });
    }
    this.drawCanvas();
  }

  private drawCanvas(): void {
    const ctx = this.canvas.nativeElement.getContext('2d');
    const canvasWidth = this.canvas.nativeElement.width;
    const canvasHeight = this.canvas.nativeElement.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (!this.isImageLoaded) {
      return;
    }
    this.canvas.nativeElement.style.width = '100%';
    const newCanvasWidth = this.canvas.nativeElement.offsetWidth;
    const newCanvasHeight = Math.ceil(this.imageElement.height * newCanvasWidth / this.imageElement.width);
    this.canvas.nativeElement.style.height = newCanvasHeight.toString() + 'px';
    this.canvas.nativeElement.width = newCanvasWidth;
    this.canvas.nativeElement.height = newCanvasHeight;

    ctx.drawImage(this.imageElement, 0, 0, newCanvasWidth, newCanvasHeight);
    if (this.selectedCoordinates.length == 0) {
      return;
    }
    let lastItem: Coordinate = this.selectedCoordinates[this.selectedCoordinates.length - 1];
    for (let item of this.selectedCoordinates) {
      this.drawCircle(newCanvasWidth, newCanvasHeight, ctx, item, 3);
      this.drawLine(newCanvasWidth, newCanvasHeight, ctx, lastItem, item);
      lastItem = item;
    }
  }

  private drawCircle(width: number, height: number, ctx: CanvasRenderingContext2D, center: Coordinate, radius: number): void {
    ctx.beginPath();
    ctx.arc(center.x * width, center.y * height, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'red';
    ctx.stroke();
  }

  private drawLine(width: number, height: number, ctx: CanvasRenderingContext2D, start: Coordinate, end: Coordinate): void {
    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'red';
    ctx.stroke();
  }
}
