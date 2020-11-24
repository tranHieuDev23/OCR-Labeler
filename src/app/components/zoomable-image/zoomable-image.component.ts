import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Coordinate } from 'src/app/models/text-region';
import { CanvasService } from 'src/app/services/canvas.service';

const MAX_ZOOM_LEVEL = 100;
const MIN_ZOOM_LEVEL = 0.01;
const ZOOM_LEVEL_CHANGE = 1.189207115;
const SCROLL_ZOOM_RATE = 0.025;

@Component({
  selector: 'app-zoomable-image',
  templateUrl: './zoomable-image.component.html',
  styleUrls: ['./zoomable-image.component.scss']
})
export class ZoomableImageComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  private _imageElement: HTMLImageElement = null;
  private _region: Coordinate[] = null;
  private _zoom: number = 1;

  @Input('imageSrc')
  public set imageSrc(v: string) {
    this._imageElement = new Image();
    this._imageElement.onload = () => {
      this.drawState();
    };
    this._imageElement.src = v;
  }

  @Input('region')
  public set region(v: Coordinate[]) {
    this._region = v;
    this.drawState();
  }

  @Input('zoom')
  public set zoom(v: number) {
    this._zoom = v;
    this.drawState();
  }

  constructor(private canvasService: CanvasService) { }

  ngOnInit(): void {
    if (window) {
      window.onresize = () => {
        this.drawState();
      };
    }
    this.canvas.nativeElement.addEventListener('wheel', (event) => {
      event.preventDefault();
      let newZoom = this._zoom * Math.pow(ZOOM_LEVEL_CHANGE, event.deltaY * SCROLL_ZOOM_RATE);
      newZoom = Math.min(newZoom, MAX_ZOOM_LEVEL);
      newZoom = Math.max(newZoom, MIN_ZOOM_LEVEL);
      this.zoom = newZoom;
    });
  }

  public zoomIn(): void {
    const newZoom = this._zoom * ZOOM_LEVEL_CHANGE;
    if (newZoom > MAX_ZOOM_LEVEL) {
      return;
    }
    this.zoom = newZoom;
  }

  public zoomOut(): void {
    const newZoom = this._zoom / ZOOM_LEVEL_CHANGE;
    if (newZoom < MIN_ZOOM_LEVEL) {
      return;
    }
    this.zoom = newZoom;
  }

  public resetZoom(): void {
    if (this._zoom === 1.0) {
      return;
    }
    this.zoom = 1.0;
  }

  private drawState(): void {
    requestAnimationFrame(() => {
      const ctx = this.canvas.nativeElement.getContext('2d');
      const canvasWidth = this.canvas.nativeElement.width;
      const canvasHeight = this.canvas.nativeElement.height;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      if (!this.isImageLoaded()) {
        return;
      }
      const imageRatio = this._imageElement.height / this._imageElement.width;
      this.canvasService.resizeMaintainAspectRatio(this.canvas.nativeElement, imageRatio);
      const newCanvasWidth = this.canvas.nativeElement.width;
      const newCanvasHeight = this.canvas.nativeElement.height;
      this.canvasService.drawCheckerboard(newCanvasWidth, newCanvasHeight, ctx, 32, '#fff', '#ccc');
      const drawRegion = this.calculateImageDrawRegion();
      ctx.drawImage(this._imageElement, drawRegion.dx, drawRegion.dy, drawRegion.dw, drawRegion.dh);
    });
  }

  private isImageLoaded(): boolean {
    return this._imageElement !== null && this._region !== null && this._zoom !== null;
  }

  private calculateImageDrawRegion(): { dx: number, dy: number, dw: number, dh: number } {
    const imageWidth = this._imageElement.width;
    const imageHeight = this._imageElement.height;
    const canvasWidth = this.canvas.nativeElement.width;
    const canvasHeight = this.canvas.nativeElement.height;
    const regionBound = this.getRegionBound();

    const canvasRegionRatio = Math.min(
      canvasWidth / regionBound.w,
      canvasHeight / regionBound.h
    ) * this._zoom;
    const dw = imageWidth * canvasRegionRatio;
    const dh = imageHeight * canvasRegionRatio;

    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;
    const regionCenterX = (regionBound.x + regionBound.w / 2) * canvasRegionRatio;
    const regionCenterY = (regionBound.y + regionBound.h / 2) * canvasRegionRatio;
    const dx = canvasCenterX - regionCenterX;
    const dy = canvasCenterY - regionCenterY;
    return { dx, dy, dw, dh };
  }

  private getRegionBound(): { x: number, y: number, w: number, h: number } {
    const minX = Math.min(...this._region.map(item => item.x * this._imageElement.width));
    const minY = Math.min(...this._region.map(item => item.y * this._imageElement.height));
    const maxX = Math.max(...this._region.map(item => item.x * this._imageElement.width));
    const maxY = Math.max(...this._region.map(item => item.y * this._imageElement.height));
    return {
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY
    };
  }
}
