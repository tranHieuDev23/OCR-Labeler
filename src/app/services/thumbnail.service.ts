import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Coordinate } from '../models/text-region';
import { CanvasService } from './canvas.service';

const BASE64_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

@Injectable({
  providedIn: 'root'
})
export class ThumbnailService {
  private readonly isBrowser: boolean;

  constructor(
    private canvasService: CanvasService,
    @Inject(PLATFORM_ID) platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  public generateThumbnail(imageSrc: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!this.isBrowser) {
        resolve(BASE64_PLACEHOLDER);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const widthRatio = width / maxWidth;
        const heightRatio = height / maxHeight;
        if (widthRatio > heightRatio) {
          canvas.width = maxWidth;
          canvas.height = Math.floor(height / widthRatio);
        } else {
          canvas.width = Math.floor(width / heightRatio);
          canvas.height = maxHeight;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL());
      };
      img.src = imageSrc;
    });
  }

  public generatePolygonImage(imageSrc: string, vertices: Coordinate[]): Promise<string> {
    return new Promise<string>((resolve) => {
      if (!this.isBrowser) {
        resolve(BASE64_PLACEHOLDER);
        return;
      }
      const xs: number[] = vertices.map(item => item.x);
      const ys: number[] = vertices.map(item => item.y);
      const left: number = Math.min(...xs);
      const right: number = Math.max(...xs);
      const top: number = Math.min(...ys);
      const bottom: number = Math.max(...ys);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * (right - left);
        canvas.height = img.height * (bottom - top);
        const ctx = canvas.getContext('2d');
        this.clipPolygon(img.width, img.height, ctx, vertices, left, top);
        ctx.drawImage(img, - left * img.width, - top * img.height);
        resolve(canvas.toDataURL());
      };

      img.src = imageSrc;
    });
  }

  private clipPolygon(width: number, height: number, ctx: CanvasRenderingContext2D, vertices: Coordinate[], left: number, top: number): void {
    ctx.beginPath();
    const verticesCount = vertices.length;
    ctx.moveTo(
      (vertices[verticesCount - 1].x - left) * width,
      (vertices[verticesCount - 1].y - top) * height
    );
    for (let item of vertices) {
      ctx.lineTo(
        (item.x - left) * width,
        (item.y - top) * height
      );
    }
    ctx.closePath();
    ctx.clip();
  }

  public generateHighlightedImage(imageSrc: string, vertices: Coordinate[]): Promise<string> {
    return new Promise<string>((resolve) => {
      if (this.isBrowser) {
        resolve(imageSrc);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        this.canvasService.drawPolygon(canvas.width, canvas.height, ctx, vertices, '#f5222d')
        resolve(canvas.toDataURL());
      };

      img.src = imageSrc;
    });
  }
}
