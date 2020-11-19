import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Coordinate, Region } from 'src/app/models/text-region';
import { ThumbnailService } from 'src/app/services/thumbnail.service';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';
import { CanvasService } from 'src/app/services/canvas.service';
import { RegionSelectorState } from './region-selector-state';

const EPSILON = Math.exp(-5);

export class RegionCroppedEvent {
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
  @Output('regionCropped') public regionCropped: EventEmitter<RegionCroppedEvent> = new EventEmitter<RegionCroppedEvent>();
  @Output('regionSelected') public regionSelected: EventEmitter<number> = new EventEmitter<number>();

  private state: RegionSelectorState;
  private isImageLoaded: boolean = false;
  private dragStart: Coordinate = null;
  private polygonToCheckInside: any[] = [];

  private imgSrc: string = '';
  @Input('imageSrc')
  public set imageSrc(v: string) {
    this.imgSrc = v;
    this.initialize();
  }

  constructor(
    private canvasService: CanvasService,
    private thumbnail: ThumbnailService
  ) {
    this.state = new RegionSelectorState(null, null, null, []);
  }

  ngOnInit(): void {
    if (window) {
      window.onresize = () => {
        this.drawCanvasRegionSelectorState(this.state);
      };
    }
    this.canvas.nativeElement.addEventListener('dblclick', (event) => {
      if (this.isEventLeftMouse(event)) {
        this.handleDbClick(this.getCanvasPosition(event.clientX, event.clientY));
      }
    });
    this.canvas.nativeElement.addEventListener('mousedown', (event) => {
      event.preventDefault();
      if (this.isEventLeftMouse(event)) {
        this.handleLeftMouseDown(this.getCanvasPosition(event.clientX, event.clientY));
      }
      if (this.isEventRightMouse(event)) {
        this.handleRightMouseDown(this.getCanvasPosition(event.clientX, event.clientY));
      }
    });
    this.canvas.nativeElement.addEventListener('mousemove', (event) => {
      this.handleMouseMove(this.getCanvasPosition(event.clientX, event.clientY));
    });
    this.canvas.nativeElement.addEventListener('mouseup', (event) => {
      this.handleMouseUp(this.getCanvasPosition(event.clientX, event.clientY));
    });
    this.initialize();
  }

  initialize(): void {
    const imageElement = new Image();
    imageElement.onload = () => {
      this.isImageLoaded = true;
      this.setRegionSelectorState(this.state.cloneWithImageElement(imageElement));
    }
    imageElement.src = this.imgSrc;
  }

  private isEventLeftMouse(event: MouseEvent): boolean {
    return event.button === 0;
  }

  private isEventRightMouse(event: MouseEvent): boolean {
    return event.button === 2;
  }

  private setRegionSelectorState(state: RegionSelectorState): void {
    if (state === this.state) {
      return;
    }
    this.state = state;
    this.drawCanvasRegionSelectorState(state);
  }

  private getCanvasPosition(clientX: number, clientY: number): Coordinate {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = (clientX - rect.left) / this.canvas.nativeElement.offsetWidth;
    const y = (clientY - rect.top) / this.canvas.nativeElement.offsetHeight;
    return new Coordinate(x, y);
  }

  public clearSelected(): void {
    this.setRegionSelectorState(this.state.cloneWithSelectedCoordinates(null).cloneWithDragCoordinates(null));
  }

  public highlight(coordinates: Coordinate[][]): void {
    this.polygonToCheckInside = coordinates.map(item => {
      const ply = [];
      for (let v of item) {
        ply.push([v.x, v.y]);
      }
      ply.push([item[0].x, item[0].y]);
      return polygon([ply]);
    });
    this.setRegionSelectorState(this.state.cloneWithHighlightCoordinates(coordinates));
  }

  private handleDbClick(coordinate: Coordinate): void {
    const insideId: number = this.isInHighlighted(coordinate);
    if (insideId !== -1) {
      this.regionSelected.emit(insideId);
      return;
    }
  }

  private handleRightMouseDown(coordinate: Coordinate): void {
    this.dragStart = null;
    let selected: Coordinate[] = this.state.selectedCoordinates || [];
    if (selected.length == 4) {
      selected = [];
    }
    selected.push(coordinate);
    this.setRegionSelectorState(
      this.state
        .cloneWithDragCoordinates(null)
        .cloneWithSelectedCoordinates(selected)
    );
    if (selected.length == 4) {
      this.thumbnail.generatePolygonImage(this.imgSrc, selected)
        .then((result) => {
          this.regionCropped.emit(new RegionCroppedEvent(
            new Region(selected),
            result
          ));
        });
    }
  }

  private handleLeftMouseDown(coordinate: Coordinate): void {
    this.dragStart = coordinate;
    this.setRegionSelectorState(this.state.cloneWithDragCoordinates(null));
  }

  private handleMouseMove(coordinate: Coordinate): void {
    if (!this.dragStart) {
      return;
    }
    this.setRegionSelectorState(this.state
      .cloneWithSelectedCoordinates(null)
      .cloneWithDragCoordinates({
        start: this.dragStart,
        end: coordinate
      })
    );
  }

  private handleMouseUp(coordinate: Coordinate): void {
    if (!this.dragStart) {
      return;
    }
    if (this.dragTooShort(this.dragStart, coordinate)) {
      this.setRegionSelectorState(this.state.cloneWithDragCoordinates(null));
      this.dragStart = null;
      return;
    }
    this.setRegionSelectorState(this.state
      .cloneWithDragCoordinates({
        start: this.dragStart,
        end: coordinate
      })
    );
    const vertices: Coordinate[] = [
      this.dragStart,
      new Coordinate(this.dragStart.x, coordinate.y),
      coordinate,
      new Coordinate(coordinate.x, this.dragStart.y)
    ];
    this.thumbnail.generatePolygonImage(this.imgSrc, vertices).then((result) => {
      this.regionCropped.emit(new RegionCroppedEvent(
        new Region(vertices),
        result
      ));
    });
    this.dragStart = null;
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

  private isInHighlighted(coordinate: Coordinate): number {
    const pt = point([coordinate.x, coordinate.y]);
    return this.polygonToCheckInside.findIndex(item => {
      return booleanPointInPolygon(pt, item);
    });
  }

  private drawCanvasRegionSelectorState(state: RegionSelectorState): void {
    const ctx = this.canvas.nativeElement.getContext('2d');
    const canvasWidth = this.canvas.nativeElement.width;
    const canvasHeight = this.canvas.nativeElement.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (!this.isImageLoaded) {
      return;
    }
    this.canvas.nativeElement.style.width = '100%';
    const newCanvasWidth = this.canvas.nativeElement.offsetWidth;
    const newCanvasHeight = Math.ceil(state.imageElement.height * newCanvasWidth / state.imageElement.width);
    this.canvas.nativeElement.style.height = newCanvasHeight.toString() + 'px';
    this.canvas.nativeElement.width = newCanvasWidth;
    this.canvas.nativeElement.height = newCanvasHeight;

    ctx.drawImage(state.imageElement, 0, 0, newCanvasWidth, newCanvasHeight);
    this.drawHighlight(newCanvasWidth, newCanvasHeight, ctx, state);
    this.drawSelected(newCanvasWidth, newCanvasHeight, ctx, state);
  }

  private drawSelected(width: number, height: number, ctx: CanvasRenderingContext2D, state: RegionSelectorState): void {
    if (state.selectedCoordinates !== null && state.selectedCoordinates.length > 0) {
      let lastItem: Coordinate = state.selectedCoordinates[state.selectedCoordinates.length - 1];
      for (let item of state.selectedCoordinates) {
        this.canvasService.drawCircle(width, height, ctx, item, 1, '#f5222d');
        this.canvasService.drawLine(width, height, ctx, lastItem, item, '#f5222d');
        lastItem = item;
      }
    }
    if (state.dragCoordinates !== null) {
      this.canvasService.drawRect(width, height, ctx, state.dragCoordinates.start, state.dragCoordinates.end, '#f5222d');
    }
  }

  private drawHighlight(width: number, height: number, ctx: CanvasRenderingContext2D, state: RegionSelectorState): void {
    if (state.highlightedCoordinates === null || state.highlightedCoordinates.length === 0) {
      return;
    }
    for (let item of state.highlightedCoordinates) {
      if (item === null || item.length === 0) {
        continue;
      }
      this.canvasService.drawPolygon(width, height, ctx, item, '#52c41a');
    }
  }
}
