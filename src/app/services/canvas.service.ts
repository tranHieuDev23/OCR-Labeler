import { Injectable } from '@angular/core';
import { Coordinate } from '../models/text-region';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  constructor() { }

  public drawCircle(width: number, height: number, ctx: CanvasRenderingContext2D, center: Coordinate, radius: number, color: string): void {
    ctx.beginPath();
    ctx.arc(center.x * width, center.y * height, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  public drawLine(width: number, height: number, ctx: CanvasRenderingContext2D, start: Coordinate, end: Coordinate, color: string): void {
    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  public drawRect(width: number, height: number, ctx: CanvasRenderingContext2D, start: Coordinate, end: Coordinate, color: string): void {
    const p1: Coordinate = new Coordinate(start.x, end.y);
    const p2: Coordinate = new Coordinate(end.x, start.y);
    this.drawLine(width, height, ctx, start, p1, color);
    this.drawLine(width, height, ctx, p1, end, color);
    this.drawLine(width, height, ctx, end, p2, color);
    this.drawLine(width, height, ctx, p2, start, color);
  }

  public drawPolygon(width: number, height: number, ctx: CanvasRenderingContext2D, coordinates: Coordinate[], color: string): void {
    let lastVert: Coordinate = coordinates[coordinates.length - 1];
    for (let vert of coordinates) {
      this.drawLine(width, height, ctx, lastVert, vert, color);
      lastVert = vert;
    }
  }

  public drawCheckerboard(width: number, height: number, ctx: CanvasRenderingContext2D, size: number, whiteColor: string, blackColor: string): void {
    const numCol = Math.ceil(width / size);
    const numRow = Math.ceil(height / size);
    for (let i = 0; i < numRow; i++) {
      for (let j = 0; j < numCol; j++) {
        const x = j * size;
        const y = i * size;
        if ((i + j) % 2 === 0) {
          ctx.fillStyle = whiteColor;
        } else {
          ctx.fillStyle = blackColor;
        }
        ctx.fillRect(x, y, size, size);
      }
    }
  }

  public resizeMaintainAspectRatio(canvas: HTMLCanvasElement, aspectRatio: number): void {
    canvas.style.width = '100%';
    const newCanvasWidth = canvas.offsetWidth;
    const newCanvasHeight = Math.ceil(aspectRatio * newCanvasWidth);
    canvas.style.height = newCanvasHeight.toString() + 'px';
    canvas.width = newCanvasWidth;
    canvas.height = newCanvasHeight;
  }
}
