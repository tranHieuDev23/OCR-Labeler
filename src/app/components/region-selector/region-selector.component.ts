import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { Coordinate } from 'src/app/models/text-region';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';
import { CanvasService } from 'src/app/services/canvas.service';
import { isPlatformBrowser } from '@angular/common';

const MOUSE_LEFT_BUTTON = 0;
const MOUSE_MIDDLE_BUTTON = 1;

const EPSILON = Math.exp(-5);

const MAX_ZOOM_LEVEL = 100;
const MIN_ZOOM_LEVEL = 0.01;
const ZOOM_LEVEL_CHANGE = 1.189207115;
const SCROLL_ZOOM_RATE = 0.025;

enum CropOption {
  RECTANGULAR,
  POLYGONAL
}

export class RegionClickedEvent {
  public static readonly SELECTION_ID: number = -1;

  constructor(
    public readonly id: number,
    public readonly event: MouseEvent
  ) { }
}

function coordinatesToPolygon(coordinates: Coordinate[]): any {
  if (!coordinates) {
    return null;
  }
  const ply = [];
  for (let v of coordinates) {
    ply.push([v.x, v.y]);
  }
  ply.push([coordinates[0].x, coordinates[0].y]);
  return polygon([ply]);
}

@Component({
  selector: 'app-region-selector',
  templateUrl: './region-selector.component.html',
  styleUrls: ['./region-selector.component.scss']
})
export class RegionSelectorComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  @Output('regionCropped') public regionCropped: EventEmitter<Coordinate[]> = new EventEmitter<Coordinate[]>();
  @Output('regionDbClicked') public regionDbClicked: EventEmitter<RegionClickedEvent> = new EventEmitter<RegionClickedEvent>();
  @Output('regionRightClicked') public regionRightClicked: EventEmitter<RegionClickedEvent> = new EventEmitter<RegionClickedEvent>();

  cropOptions: { label: string, value: CropOption }[] = [
    { label: "Rectangular region", value: CropOption.RECTANGULAR },
    { label: "Polygonal region", value: CropOption.POLYGONAL }
  ];
  selectedCropOption: CropOption = CropOption.RECTANGULAR;

  private readonly isBrowser: boolean;

  private image: HTMLImageElement = null;
  private isImageLoaded: boolean = false;
  @Input('imageSrc') set imageSrc(v: string) {
    if (!v || !this.isBrowser) {
      this.image = null;
      return;
    }
    this.isImageLoaded = false;
    this.image = new Image();
    this.image.onload = () => {
      this.isImageLoaded = true;
      this.origin = new Coordinate(0, 0);
      this.zoom = 1;
      this.drawState();
    }
    this.image.src = v;
    this.drawState();
  }

  private highlightedCoordinates: Coordinate[][];
  private highlightPolygons: any[] = [];
  @Input('regions') set regions(v: Coordinate[][]) {
    this.highlightedCoordinates = v;
    this.highlightPolygons = v.map(item => coordinatesToPolygon(item));
    this.drawState();
  }

  private origin: Coordinate = new Coordinate(0, 0);
  private zoom: number = 1;

  private selectedCoordinates: Coordinate[];
  private selectionPolygon: any = null;
  private set selected(v: Coordinate[]) {
    this.selectedCoordinates = v;
    this.drawState();
  }
  private selectDragStart: Coordinate = null;

  private mouseDownButton: number = null;
  private lastTransformPoint: Coordinate = null;

  constructor(
    @Inject(PLATFORM_ID) platformId: any,
    private canvasService: CanvasService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }
    window.onresize = () => {
      this.drawState();
    };
    this.canvas.nativeElement.addEventListener('dblclick', (event) => {
      if (event.button !== MOUSE_LEFT_BUTTON) {
        return;
      }
      event.preventDefault();
      this.handleDbClick(event, this.mouseToImagePosition(event.clientX, event.clientY));
    });
    this.canvas.nativeElement.addEventListener('mousedown', (event) => {
      if (event.button !== MOUSE_LEFT_BUTTON && event.button !== MOUSE_MIDDLE_BUTTON) {
        return;
      }
      event.preventDefault();
      this.mouseDownButton = event.button;
      switch (this.mouseDownButton) {
        case MOUSE_LEFT_BUTTON:
          this.handleLeftMouseDown(this.mouseToImagePosition(event.clientX, event.clientY));
          break;
        case MOUSE_MIDDLE_BUTTON:
          this.handleMiddleMouseDown(this.mouseToCanvasPosition(event.clientX, event.clientY));
          break;
      }
    });
    window.onmousemove = (event: MouseEvent) => {
      if (this.mouseDownButton === null) {
        return;
      }
      switch (this.mouseDownButton) {
        case MOUSE_LEFT_BUTTON:
          this.handleLeftMouseMove(this.mouseToImagePosition(event.clientX, event.clientY));
          break;
        case MOUSE_MIDDLE_BUTTON:
          this.handleMiddleMouseMove(this.mouseToCanvasPosition(event.clientX, event.clientY));
          break;
      }
    };
    window.onmouseup = (event: MouseEvent) => {
      if (this.mouseDownButton === null) {
        return;
      }
      switch (this.mouseDownButton) {
        case MOUSE_LEFT_BUTTON:
          this.handleLeftMouseUp(this.mouseToImagePosition(event.clientX, event.clientY));
          break;
        case MOUSE_MIDDLE_BUTTON:
          this.handleMiddleMouseUp();
          break;
      }
      this.mouseDownButton = null;
    };
    this.canvas.nativeElement.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      this.handleContextMenu(event, this.mouseToImagePosition(event.clientX, event.clientY));
      return false;
    });
    this.canvas.nativeElement.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.handleWheel(event);
    });
  }

  public changeCroppingOption(): void {
    if (this.selectedCropOption == CropOption.RECTANGULAR) {
      this.selectedCropOption = CropOption.POLYGONAL;
    } else {
      this.selectedCropOption = CropOption.RECTANGULAR;
    }
    this.clearSelected();
  }

  public clearSelected(): void {
    this.selected = null;
    this.selectionPolygon = null;
  }

  public zoomIn(): void {
    const newZoom = this.zoom * ZOOM_LEVEL_CHANGE;
    if (newZoom > MAX_ZOOM_LEVEL) {
      return;
    }
    this.setZoomLevel(newZoom, new Coordinate(0.5, 0.5));
  }

  public zoomOut(): void {
    const newZoom = this.zoom / ZOOM_LEVEL_CHANGE;
    if (newZoom < MIN_ZOOM_LEVEL) {
      return;
    }
    this.setZoomLevel(newZoom, new Coordinate(0.5, 0.5));
  }

  public resetZoom(): void {
    if (this.zoom === 1.0) {
      return;
    }
    this.zoom = 1;
    this.origin = new Coordinate(0, 0);
    this.drawState();
  }

  public setZoomLevel(zoom: number, imagePos: Coordinate): void {
    const canvasPos = this.imageToCanvasPosition(imagePos);
    const originX = canvasPos.x / zoom - imagePos.x;
    const originY = canvasPos.y / zoom - imagePos.y;
    this.zoom = zoom;
    this.origin = new Coordinate(originX, originY);
    this.drawState();
  }

  private handleDbClick(event: MouseEvent, imagePos: Coordinate): void {
    this.clearSelected();
    const insideId: number = this.getInsideId(imagePos);
    this.regionDbClicked.emit(new RegionClickedEvent(insideId, event));
  }

  private handleLeftMouseDown(imagePos: Coordinate): void {
    switch (this.selectedCropOption) {
      case CropOption.RECTANGULAR:
        this.rectangularCropStart(imagePos);
        break;
      case CropOption.POLYGONAL:
        this.handlePolygonalCrop(imagePos);
        break;
    }
  }

  private rectangularCropStart(imagePos: Coordinate): void {
    this.selectDragStart = imagePos;
    this.selected = null;
  }

  private handlePolygonalCrop(imagePos: Coordinate): void {
    if (imagePos.x < 0 || imagePos.x > 1 || imagePos.y < 0 || imagePos.y > 1) {
      return;
    }
    this.selectDragStart = null;
    let selected: Coordinate[] = this.selectedCoordinates || [];
    if (selected.length == 4) {
      selected = [];
    }
    selected.push(imagePos);
    this.selected = selected;
    if (selected.length == 4) {
      this.emitSelectEvent(selected);
    }
  }

  private handleMiddleMouseDown(canvasPos: Coordinate): void {
    this.lastTransformPoint = canvasPos;
  }

  private handleLeftMouseMove(imagePos: Coordinate): void {
    if (!this.selectDragStart) {
      return;
    }
    this.selected = [
      this.selectDragStart,
      new Coordinate(this.selectDragStart.x, imagePos.y),
      imagePos,
      new Coordinate(imagePos.x, this.selectDragStart.y)
    ];
  }

  private handleMiddleMouseMove(canvasPos: Coordinate): void {
    if (!this.lastTransformPoint) {
      return;
    }
    const newOriginX = this.origin.x + (canvasPos.x - this.lastTransformPoint.x) / this.zoom;
    const newOriginY = this.origin.y + (canvasPos.y - this.lastTransformPoint.y) / this.zoom;
    this.origin = new Coordinate(newOriginX, newOriginY);
    this.lastTransformPoint = canvasPos;
    this.drawState();
  }

  private handleLeftMouseUp(imagePos: Coordinate): void {
    if (!this.selectDragStart) {
      return;
    }
    if (this.dragOutside(this.selectDragStart, imagePos) || this.dragTooShort(this.selectDragStart, imagePos)) {
      this.selectDragStart = null;
      this.selected = null;
      return;
    }
    const selected: Coordinate[] = [
      this.selectDragStart,
      new Coordinate(this.selectDragStart.x, imagePos.y),
      imagePos,
      new Coordinate(imagePos.x, this.selectDragStart.y)
    ];
    this.emitSelectEvent(selected);
    this.selectDragStart = null;
    this.selected = selected;
  }

  private handleMiddleMouseUp(): void {
    this.lastTransformPoint = null;
  }

  private handleContextMenu(event: MouseEvent, imagePos: Coordinate): void {
    const insideId: number = this.getInsideId(imagePos);
    this.regionRightClicked.emit(new RegionClickedEvent(insideId, event));
  }

  private handleWheel(event: WheelEvent): void {
    let newZoom = this.zoom * Math.pow(ZOOM_LEVEL_CHANGE, event.deltaY * SCROLL_ZOOM_RATE);
    newZoom = Math.min(newZoom, MAX_ZOOM_LEVEL);
    newZoom = Math.max(newZoom, MIN_ZOOM_LEVEL);
    const imagePosition = this.mouseToImagePosition(event.clientX, event.clientY);
    this.setZoomLevel(newZoom, imagePosition);
  }

  private emitSelectEvent(vertices: Coordinate[]): void {
    this.selectionPolygon = coordinatesToPolygon(vertices);
    this.regionCropped.emit(vertices);
  }

  private dragOutside(start: Coordinate, end: Coordinate): boolean {
    function invalidValue(v: number): boolean {
      return v < 0 || v > 1;
    }
    return invalidValue(start.x) || invalidValue(start.y) || invalidValue(end.x) || invalidValue(end.y);
  }

  private dragTooShort(start: Coordinate, end: Coordinate): boolean {
    if (Math.abs(start.x - end.x) < EPSILON) {
      return true;
    }
    if (Math.abs(start.y - end.y) < EPSILON) {
      return true;
    }
    return false;
  }

  private getInsideId(coordinate: Coordinate): number {
    const pt = point([coordinate.x, coordinate.y]);
    if (this.selectionPolygon) {
      if (booleanPointInPolygon(pt, this.selectionPolygon)) {
        return RegionClickedEvent.SELECTION_ID;
      }
    }
    const highlightId = this.highlightPolygons.findIndex(item => {
      return booleanPointInPolygon(pt, item);
    });
    if (highlightId >= 0) {
      return highlightId;
    }
    return null;
  }

  private drawState(): void {
    if (!this.isBrowser) {
      return;
    }
    requestAnimationFrame(() => {
      const ctx = this.canvas.nativeElement.getContext('2d');
      const canvasWidth = this.canvas.nativeElement.width;
      const canvasHeight = this.canvas.nativeElement.height;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      if (!this.isImageLoaded) {
        return;
      }
      const imageRatio = this.image.height / this.image.width;
      this.canvasService.resizeMaintainAspectRatio(this.canvas.nativeElement, imageRatio);
      const newCanvasWidth = this.canvas.nativeElement.width;
      const newCanvasHeight = this.canvas.nativeElement.height;

      this.canvasService.drawCheckerboard(newCanvasWidth, newCanvasHeight, ctx, 32, '#fff', '#ccc');

      const drawRegion = this.calculateImageDrawRegion();
      ctx.drawImage(this.image, drawRegion.dx, drawRegion.dy, drawRegion.dw, drawRegion.dh);
      this.drawHighlight(newCanvasWidth, newCanvasHeight, ctx);
      this.drawSelected(newCanvasWidth, newCanvasHeight, ctx);
    });
  }

  private calculateImageDrawRegion(): { dx: number, dy: number, dw: number, dh: number } {
    const canvasWidth = this.canvas.nativeElement.width;
    const canvasHeight = this.canvas.nativeElement.height;
    return {
      dx: this.origin.x * canvasWidth * this.zoom,
      dy: this.origin.y * canvasHeight * this.zoom,
      dw: canvasWidth * this.zoom,
      dh: canvasHeight * this.zoom
    };
  }

  private drawHighlight(width: number, height: number, ctx: CanvasRenderingContext2D): void {
    if (this.highlightedCoordinates === null || this.highlightedCoordinates.length === 0) {
      return;
    }
    for (let item of this.highlightedCoordinates) {
      if (!item || item.length === 0) {
        continue;
      }
      const translatedItem = item.map(v => this.imageToCanvasPosition(v));
      this.canvasService.drawPolygon(width, height, ctx, translatedItem, '#52c41a');
    }
  }

  private drawSelected(width: number, height: number, ctx: CanvasRenderingContext2D): void {
    if (!this.selectedCoordinates || this.selectedCoordinates.length === 0) {
      return null;
    }
    const translatedSelected = this.selectedCoordinates.map(v => this.imageToCanvasPosition(v));
    this.canvasService.drawPolygon(width, height, ctx, translatedSelected, '#f5222d');
    for (let item of this.selectedCoordinates) {
      this.canvasService.drawCircle(width, height, ctx, this.imageToCanvasPosition(item), 1, '#f5222d');
    }
  }

  private mouseToCanvasPosition(clientX: number, clientY: number): Coordinate {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = (clientX - rect.left) / this.canvas.nativeElement.offsetWidth;
    const y = (clientY - rect.top) / this.canvas.nativeElement.offsetHeight;
    return new Coordinate(x, y);
  }

  private mouseToImagePosition(clientX: number, clientY: number): Coordinate {
    const canvasPos = this.mouseToCanvasPosition(clientX, clientY);
    const imageX = canvasPos.x / this.zoom - this.origin.x;
    const imageY = canvasPos.y / this.zoom - this.origin.y;
    return new Coordinate(imageX, imageY);
  }

  private imageToCanvasPosition(coordinate: Coordinate): Coordinate {
    return new Coordinate(
      (this.origin.x + coordinate.x) * this.zoom,
      (this.origin.y + coordinate.y) * this.zoom
    );
  }
}
