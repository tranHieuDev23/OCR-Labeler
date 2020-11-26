import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Coordinate } from 'src/app/models/text-region';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';
import { CanvasService } from 'src/app/services/canvas.service';

const EPSILON = Math.exp(-5);

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

  private image: HTMLImageElement = null;
  private isImageLoaded: boolean = false;
  @Input('imageSrc') set imageSrc(v: string) {
    if (!v) {
      this.image = null;
      return;
    }
    this.isImageLoaded = false;
    this.image = new Image();
    this.image.onload = () => {
      this.isImageLoaded = true;
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

  private selectedCoordinates: Coordinate[];
  private selectionPolygon: any = null;
  private set selected(v: Coordinate[]) {
    this.selectedCoordinates = v;
    this.drawState();
  }

  private dragStart: Coordinate = null;

  constructor(
    private canvasService: CanvasService
  ) { }

  ngOnInit(): void {
    if (window) {
      window.onresize = () => {
        this.drawState();
      };
    }
    this.canvas.nativeElement.addEventListener('dblclick', (event) => {
      if (!this.isEventLeftMouse(event)) {
        return;
      }
      event.preventDefault();
      this.handleDbClick(event, this.getCanvasPosition(event.clientX, event.clientY));
    });
    this.canvas.nativeElement.addEventListener('mousedown', (event) => {
      if (!this.isEventLeftMouse(event)) {
        return;
      }
      event.preventDefault();
      this.handleLeftMouseDown(this.getCanvasPosition(event.clientX, event.clientY));
    });
    this.canvas.nativeElement.addEventListener('mousemove', (event) => {
      this.handleMouseMove(this.getCanvasPosition(event.clientX, event.clientY));
    });
    this.canvas.nativeElement.addEventListener('mouseup', (event) => {
      this.handleMouseUp(this.getCanvasPosition(event.clientX, event.clientY));
    });
    this.canvas.nativeElement.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      this.handleContextMenu(event, this.getCanvasPosition(event.clientX, event.clientY));
      return false;
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

  private isEventLeftMouse(event: MouseEvent): boolean {
    return event.button === 0;
  }

  private getCanvasPosition(clientX: number, clientY: number): Coordinate {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = (clientX - rect.left) / this.canvas.nativeElement.offsetWidth;
    const y = (clientY - rect.top) / this.canvas.nativeElement.offsetHeight;
    return new Coordinate(x, y);
  }

  private handleDbClick(event: MouseEvent, coordinate: Coordinate): void {
    this.clearSelected();
    const insideId: number = this.getInsideId(coordinate);
    this.regionDbClicked.emit(new RegionClickedEvent(insideId, event));
  }

  private handleLeftMouseDown(coordinate: Coordinate): void {
    switch (this.selectedCropOption) {
      case CropOption.RECTANGULAR:
        this.rectangularCropStart(coordinate);
        break;
      case CropOption.POLYGONAL:
        this.handlePolygonalCrop(coordinate);
        break;
    }
  }

  private handleContextMenu(event: MouseEvent, coordinate: Coordinate): void {
    const insideId: number = this.getInsideId(coordinate);
    this.regionRightClicked.emit(new RegionClickedEvent(insideId, event));
  }

  private rectangularCropStart(coordinate: Coordinate): void {
    this.dragStart = coordinate;
    this.selected = null;
  }

  private handlePolygonalCrop(coordinate: Coordinate): void {
    this.dragStart = null;
    let selected: Coordinate[] = this.selectedCoordinates || [];
    if (selected.length == 4) {
      selected = [];
    }
    selected.push(coordinate);
    this.selected = selected;
    if (selected.length == 4) {
      this.emitSelectEvent(selected);
    }
  }

  private handleMouseMove(coordinate: Coordinate): void {
    if (!this.dragStart) {
      return;
    }
    this.selected = [
      this.dragStart,
      new Coordinate(this.dragStart.x, coordinate.y),
      coordinate,
      new Coordinate(coordinate.x, this.dragStart.y)
    ];
  }

  private handleMouseUp(coordinate: Coordinate): void {
    if (!this.dragStart) {
      return;
    }
    if (this.dragTooShort(this.dragStart, coordinate)) {
      this.dragStart = null;
      this.selected = null;
      return;
    }
    const selected: Coordinate[] = [
      this.dragStart,
      new Coordinate(this.dragStart.x, coordinate.y),
      coordinate,
      new Coordinate(coordinate.x, this.dragStart.y)
    ];
    this.emitSelectEvent(selected);
    this.dragStart = null;
    this.selected = selected;
  }

  private emitSelectEvent(vertices: Coordinate[]): void {
    this.selectionPolygon = coordinatesToPolygon(vertices);
    this.regionCropped.emit(vertices);
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

      ctx.drawImage(this.image, 0, 0, newCanvasWidth, newCanvasHeight);
      this.drawHighlight(newCanvasWidth, newCanvasHeight, ctx);
      this.drawSelected(newCanvasWidth, newCanvasHeight, ctx);
    });
  }

  private drawHighlight(width: number, height: number, ctx: CanvasRenderingContext2D): void {
    if (this.highlightedCoordinates === null || this.highlightedCoordinates.length === 0) {
      return;
    }
    for (let item of this.highlightedCoordinates) {
      if (item === null || item.length === 0) {
        continue;
      }
      this.canvasService.drawPolygon(width, height, ctx, item, '#52c41a');
    }
  }

  private drawSelected(width: number, height: number, ctx: CanvasRenderingContext2D): void {
    if (!this.selectedCoordinates || this.selectedCoordinates.length === 0) {
      return null;
    }
    let lastItem: Coordinate = this.selectedCoordinates[this.selectedCoordinates.length - 1];
    for (let item of this.selectedCoordinates) {
      this.canvasService.drawCircle(width, height, ctx, item, 1, '#f5222d');
      this.canvasService.drawLine(width, height, ctx, lastItem, item, '#f5222d');
      lastItem = item;
    }
  }
}
