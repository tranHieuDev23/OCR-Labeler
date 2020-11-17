import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImageComparationOption } from '../models/image-compare-funcs';
import ImageStatus from '../models/image-status';
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
      }, (error) => {
        reject(error.error.error);
      });
    });
  }

  public labelRegion(regionId: string, cantLabel: boolean, label: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.post<void>('/api/label', { regionId, cantLabel, label }).toPromise().then(() => {
        resolve();
      }, (error) => {
        reject(error.error.error);
      });
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
      }, (error) => {
        reject(error.error.error);
      });
    });
  }

  public verifyLabel(regionId: string, isCorrect: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.post<void>('/api/verify', { regionId, isCorrect }).toPromise().then(() => {
        resolve();
      }, (error) => {
        reject(error.error.error);
      });
    });
  }

  public loadUserImages(startFrom: number, itemCount: number, sortOption: ImageComparationOption, filteredStatuses: ImageStatus[]): Promise<{ imagesCount: number, images: UploadedImage[], pageId: number }> {
    return new Promise<{ imagesCount: number, images: UploadedImage[], pageId: number }>((resolve, reject) => {
      this.http.post<any>('/api/get-user-images', { startFrom, itemCount, sortOption, filteredStatuses }).toPromise().then((response) => {
        const imagesCount: number = +response.imagesCount;
        const images: UploadedImage[] = [];
        for (let item of response.images) {
          images.push(UploadedImage.parseFromJson(item));
        }
        const pageId: number = +response.pageId;
        resolve({ imagesCount, images, pageId });
      }, (error) => {
        reject(error.error.error);
      });
    });
  }

  public loadAllUserImages(
    startFrom: number,
    itemCount: number,
    sortOption: ImageComparationOption,
    filteredStatuses: ImageStatus[],
    filteredUsers: string[]): Promise<{ imagesCount: number, images: UploadedImage[], pageId: number }> {
    return new Promise<{ imagesCount: number, images: UploadedImage[], pageId: number }>((resolve, reject) => {
      this.http.post<any>('/api/get-all-user-images', {
        startFrom, itemCount, sortOption, filteredStatuses, filteredUsers
      }).toPromise().then((response) => {
        const imagesCount: number = +response.imagesCount;
        const images: UploadedImage[] = [];
        for (let item of response.images) {
          images.push(UploadedImage.parseFromJson(item));
        }
        const pageId: number = +response.pageId;
        resolve({ imagesCount, images, pageId });
      }, (error) => {
        reject(error.error.error);
      });
    });
  }

  public loadImage(imageId: string): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      this.http.post('/api/get-image', { imageId }).toPromise().then((response) => {
        resolve(UploadedImage.parseFromJson(response));
      }, (error) => {
        reject(error.error.error);
      });
    });
  }

  public loadNextImage(imageId: string, sortOption: ImageComparationOption, filteredStatuses: ImageStatus[], filteredUsers: string[]): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      this.http.post('/api/get-neighbor-image', {
        imageId,
        sortOption,
        filteredStatuses,
        filteredUsers,
        isNext: true
      }).toPromise().then((response) => {
        resolve(UploadedImage.parseFromJson(response));
      }, (error) => {
        reject(error.error.error);
      });
    });
  }

  public loadPrevImage(imageId: string, sortOption: ImageComparationOption, filteredStatuses: ImageStatus[], filteredUsers: string[]): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      this.http.post('/api/get-neighbor-image', {
        imageId,
        sortOption,
        filteredStatuses,
        filteredUsers,
        isNext: false
      }).toPromise().then((response) => {
        resolve(UploadedImage.parseFromJson(response));
      }, (error) => {
        reject(error.error.error);
      });
    });
  }

  public addTextRegion(imageId: string, region: Region): Promise<TextRegion> {
    return new Promise<TextRegion>((resolve, reject) => {
      this.http.post('/api/add-region', { imageId, region }).toPromise().then((response) => {
        resolve(TextRegion.parseFromJson(response));
      }, (error) => {
        reject(error.error.error);
      });
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
      }, (error) => {
        reject(error.error.error);
      });
    });
  }

  public deleteImage(imageId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.post('/api/delete-image', { imageId }).toPromise().then(() => {
        resolve();
      }, (error) => {
        reject(error.error.error);
      });
    });
  }

  public getExportStatus(): Promise<{ exported: boolean, state: string, timestamp: number }> {
    return new Promise<{ exported: boolean, state: string, timestamp: number }>((resolve, reject) => {
      this.http.post<any>('/api/export-status', {}).toPromise().then((resp) => {
        resolve({
          exported: resp.exported,
          state: resp.state,
          timestamp: resp.timestamp,
        });
      }, (error) => {
        reject(error.error.error);
      });
    });
  }

  public requestExport(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.post('/api/request-export', {}).toPromise().then(() => {
        resolve();
      }, (error) => {
        reject(error.error.error);
      });
    });
  }

  public downloadExport(): void {
    window.open('/api/download-export', 'blank');
  }
}
