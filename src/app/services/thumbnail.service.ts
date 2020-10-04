import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThumbnailService {

  constructor() { }

  public generateThumbnail(imageSrc: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise<string>((resolve) => {
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
}
