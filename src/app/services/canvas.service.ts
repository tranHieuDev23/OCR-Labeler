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

  public drawPolygon(width: number, height: number, ctx: CanvasRenderingContext2D, cooridnates: Coordinate[], color: string): void {
    let lastVert: Coordinate = cooridnates[cooridnates.length - 1];
    for (let vert of cooridnates) {
      this.drawLine(width, height, ctx, lastVert, vert, color);
      lastVert = vert;
    }
  }
}
