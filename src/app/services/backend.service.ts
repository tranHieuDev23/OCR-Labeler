import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TextRegion, Region } from '../models/text-region';
import UploadedImage from '../models/uploaded-image';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    private http: HttpClient
  ) { }

  public loadRegionForLabeling(): Promise<{ imageUrl: string, region: TextRegion }> {
    return new Promise<{ imageUrl: string, region: TextRegion }>((resolve, reject) => {
      this.http.post<any>('/api/get-image-for-labeler', {}).toPromise().then((response) => {
        if (!response) {
          return resolve(null);
        }
        const imageUrl: string = response.imageUrl;
        const region: TextRegion = TextRegion.parseFromJson(response.region);
        resolve({ imageUrl, region });
      }, reject);
    });
  }

  public labelRegion(regionId: string, cantLabel: boolean, label: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.post<void>('/api/label', { regionId, cantLabel, label }).toPromise().then(() => {
        resolve();
      }, reject);
    });
  }

  public loadRegionForVerifying(): Promise<{ imageUrl: string, region: TextRegion }> {
    return new Promise<{ imageUrl: string, region: TextRegion }>((resolve, reject) => {
      this.http.post<any>('/api/get-image-for-verifier', {}).toPromise().then((response) => {
        if (!response) {
          return resolve(null);
        }
        const imageUrl: string = response.imageUrl;
        const region: TextRegion = TextRegion.parseFromJson(response.region);
        resolve({ imageUrl, region });
      }, reject);
    });
  }

  public verifyLabel(regionId: string, isCorrect: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.post<void>('/api/verify', { regionId, isCorrect }).toPromise().then(() => {
        resolve();
      }, reject);
    });
  }

  public loadUserImages(startFrom: number, itemCount: number): Promise<{ imagesCount: number, images: UploadedImage[] }> {
    return new Promise<{ imagesCount: number, images: UploadedImage[] }>((resolve, reject) => {
      this.http.post<any>('/api/get-user-images', { startFrom, itemCount }).toPromise().then((response) => {
        const imagesCount: number = +response.imagesCount;
        const images: UploadedImage[] = [];
        for (let item of response.images) {
          images.push(UploadedImage.parseFromJson(item));
        }
        resolve({ imagesCount, images });
      }, reject);
    });
  }

  public loadImage(imageId: string): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      this.http.post('/api/get-image', { imageId }).toPromise().then((response) => {
        resolve(UploadedImage.parseFromJson(response));
      }, reject);
    });
  }

  public addTextRegion(imageId: string, region: Region): Promise<TextRegion> {
    return new Promise<TextRegion>((resolve, reject) => {
      this.http.post('/api/add-region', { imageId, region }).toPromise().then((response) => {
        resolve(TextRegion.parseFromJson(response));
      }, reject);
    });
  }

  public deleteTextRegion(regionId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.post('/api/delete-region', { regionId }).toPromise().then((response) => {
        resolve();
      }, (reason) => {
        reject(reason);
      });
    });
  }

  public publishImage(imageId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.post('/api/publish-image', { imageId }).toPromise().then(() => {
        resolve();
      }, reject);
    });
  }

  public deleteImage(imageId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.post('/api/delete-image', { imageId }).toPromise().then(() => {
        resolve();
      }, reject);
    });
  }
}
