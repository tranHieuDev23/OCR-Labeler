import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Coordinate, Region } from 'src/app/models/text-region';
import { ThumbnailService } from 'src/app/services/thumbnail.service';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';

const EPSILON = Math.exp(-5);

export class RegionSelectedEvent {
  constructor(
    public readonly region: Region,
    public readonly imageBase64: string
  ) { }
}

class State {
  constructor(
    public readonly imageElement: HTMLImageElement,
    public readonly selectedCoordinates: Coordinate[],
    public readonly dragCoordinates: { start: Coordinate, end: Coordinate },
    public readonly highlightedCoordinates: Coordinate[][],
  ) { }

  public cloneWithImageElement(imageElement: HTMLImageElement): State {
    return new State(
      imageElement,
      this.selectedCoordinates,
      this.dragCoordinates,
      this.highlightedCoordinates
    );
  }

  public cloneWithSelectedCoordinates(selectedCoordinates: Coordinate[]): State {
    return new State(
      this.imageElement,
      selectedCoordinates,
      this.dragCoordinates,
      this.highlightedCoordinates
    );
  }

  public cloneWithDragCoordinates(dragCoordinates: { start: Coordinate, end: Coordinate }): State {
    return new State(
      this.imageElement,
      this.selectedCoordinates,
      dragCoordinates,
      this.highlightedCoordinates
    );
  }

  public cloneWithHighlightCoordinates(highlightedCoordinates: Coordinate[][]): State {
    return new State(
      this.imageElement,
      this.selectedCoordinates,
      this.dragCoordinates,
      highlightedCoordinates
    );
  }
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
  @Output('regionSelected') public regionSelected: EventEmitter<number> = new EventEmitter<number>();

  private state: State;
  private isImageLoaded: boolean = false;
  private dragStart: Coordinate = null;
  private polygonToCheckInside: any[] = [];

  constructor(
    private thumbnail: ThumbnailService
  ) {
    this.state = new State(null, null, null, []);
  }

  ngOnInit(): void {
    const imageElement = new Image();
    imageElement.onload = () => {
      this.isImageLoaded = true;
      this.setState(this.state.cloneWithImageElement(imageElement));
    }
    imageElement.src = this.imageSrc;
    if (window) {
      window.onresize = () => {
        this.drawCanvasState(this.state);
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
  }

  private isEventLeftMouse(event: MouseEvent): boolean {
    return event.button === 0;
  }

  private isEventRightMouse(event: MouseEvent): boolean {
    return event.button === 2;
  }

  private setState(state: State): void {
    if (state === this.state) {
      return;
    }
    this.state = state;
    this.drawCanvasState(state);
  }

  private getCanvasPosition(clientX: number, clientY: number): Coordinate {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = (clientX - rect.left) / this.canvas.nativeElement.offsetWidth;
    const y = (clientY - rect.top) / this.canvas.nativeElement.offsetHeight;
    return new Coordinate(x, y);
  }

  public clearSelected(): void {
    this.setState(this.state.cloneWithSelectedCoordinates(null).cloneWithDragCoordinates(null));
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
    this.setState(this.state.cloneWithHighlightCoordinates(coordinates));
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
    this.setState(
      this.state
        .cloneWithDragCoordinates(null)
        .cloneWithSelectedCoordinates(selected)
    );
    if (selected.length == 4) {
      this.thumbnail.generatePolygonImage(this.imageSrc, selected)
        .then((result) => {
          this.imageCropped.emit(new RegionSelectedEvent(
            new Region(selected),
            result
          ));
        });
    }
  }

  private handleLeftMouseDown(coordinate: Coordinate): void {
    this.dragStart = coordinate;
    this.setState(this.state.cloneWithDragCoordinates(null));
  }

  private handleMouseMove(coordinate: Coordinate): void {
    if (!this.dragStart) {
      return;
    }
    this.setState(this.state
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
      this.setState(this.state.cloneWithDragCoordinates(null));
      this.dragStart = null;
      return;
    }
    this.setState(this.state
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
    this.thumbnail.generatePolygonImage(this.imageSrc, vertices).then((result) => {
      this.imageCropped.emit(new RegionSelectedEvent(
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

  private drawCanvasState(state: State): void {
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

  private drawSelected(width: number, height: number, ctx: CanvasRenderingContext2D, state: State): void {
    if (state.selectedCoordinates !== null && state.selectedCoordinates.length > 0) {
      let lastItem: Coordinate = state.selectedCoordinates[state.selectedCoordinates.length - 1];
      for (let item of state.selectedCoordinates) {
        this.drawCircle(width, height, ctx, item, 1, 'red');
        this.drawLine(width, height, ctx, lastItem, item, 'red');
        lastItem = item;
      }
    }
    if (state.dragCoordinates !== null) {
      this.drawRect(width, height, ctx, state.dragCoordinates.start, state.dragCoordinates.end, 'red');
    }
  }

  private drawHighlight(width: number, height: number, ctx: CanvasRenderingContext2D, state: State): void {
    if (state.highlightedCoordinates === null || state.highlightedCoordinates.length === 0) {
      return;
    }
    for (let item of state.highlightedCoordinates) {
      if (item === null || item.length === 0) {
        continue;
      }
      let lastVert: Coordinate = item[item.length - 1];
      for (let vert of item) {
        this.drawLine(width, height, ctx, lastVert, vert, 'green');
        lastVert = vert;
      }
    }
  }

  private drawCircle(width: number, height: number, ctx: CanvasRenderingContext2D, center: Coordinate, radius: number, color: string): void {
    ctx.beginPath();
    ctx.arc(center.x * width, center.y * height, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  private drawLine(width: number, height: number, ctx: CanvasRenderingContext2D, start: Coordinate, end: Coordinate, color: string): void {
    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  private drawRect(width: number, height: number, ctx: CanvasRenderingContext2D, start: Coordinate, end: Coordinate, color: string): void {
    const p1: Coordinate = new Coordinate(start.x, end.y);
    const p2: Coordinate = new Coordinate(end.x, start.y);
    this.drawLine(width, height, ctx, start, p1, color);
    this.drawLine(width, height, ctx, p1, end, color);
    this.drawLine(width, height, ctx, end, p2, color);
    this.drawLine(width, height, ctx, p2, start, color);
  }
}
