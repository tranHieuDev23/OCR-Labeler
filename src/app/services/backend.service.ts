import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImageFilterOptions } from '../models/image-filter-options';
import { TextRegion, Region } from '../models/text-region';
import UploadedImage from '../models/uploaded-image';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(private http: HttpClient) {}

  public loadRegionForLabeling(
    sameUser: boolean
  ): Promise<{ imageUrl: string; region: TextRegion }> {
    return new Promise<{ imageUrl: string; region: TextRegion }>(
      (resolve, reject) => {
        this.http
          .post<any>('/api/get-image-for-labeler', { sameUser })
          .toPromise()
          .then(
            (response) => {
              if (!response) {
                return resolve(null);
              }
              const imageUrl: string = response.imageUrl;
              const region: TextRegion = TextRegion.parseFromJson(
                response.region
              );
              resolve({ imageUrl, region });
            },
            (error) => {
              reject(error.error.error);
            }
          );
      }
    );
  }

  public labelRegion(
    regionId: string,
    cantLabel: boolean,
    label: string
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http
        .post<void>('/api/label', { regionId, cantLabel, label })
        .toPromise()
        .then(
          () => {
            resolve();
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public loadRegionForVerifying(): Promise<{
    imageUrl: string;
    region: TextRegion;
  }> {
    return new Promise<{ imageUrl: string; region: TextRegion }>(
      (resolve, reject) => {
        this.http
          .post<any>('/api/get-image-for-verifier', {})
          .toPromise()
          .then(
            (response) => {
              if (!response) {
                return resolve(null);
              }
              const imageUrl: string = response.imageUrl;
              const region: TextRegion = TextRegion.parseFromJson(
                response.region
              );
              resolve({ imageUrl, region });
            },
            (error) => {
              reject(error.error.error);
            }
          );
      }
    );
  }

  public verifyLabel(regionId: string, isCorrect: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http
        .post<void>('/api/verify', { regionId, isCorrect })
        .toPromise()
        .then(
          () => {
            resolve();
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public reviewLabel(
    regionId: string,
    isHidden: boolean,
    label: string
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http
        .post<void>('/api/review', { regionId, isHidden, label })
        .toPromise()
        .then(
          () => {
            resolve();
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public loadRegionForLabeled(
    startFrom: number,
    itemCount: number
  ): Promise<{
    imagesCount: number;
    pageId: number;
    items: { imageUrl: string; region: TextRegion }[];
  }> {
    return new Promise<{
      imagesCount: number;
      pageId: number;
      items: { imageUrl: string; region: TextRegion }[];
    }>((resolve, reject) => {
      this.http
        .post<any>('/api/get-region-for-labeled', { startFrom, itemCount })
        .toPromise()
        .then(
          (response) => {
            if (!response) {
              return resolve(null);
            }
            const imagesCount: number = +response.imagesCount;
            const pageId: number = +response.pageId;
            const items: { imageUrl: string; region: TextRegion }[] = [];
            for (let item of response.region) {
              items.push({
                imageUrl: item.imageUrl,
                region: TextRegion.parseFromJson(item.region),
              });
            }
            resolve({ imagesCount, pageId, items });
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public loadUserImages(
    startFrom: number,
    itemCount: number,
    filterOptions: ImageFilterOptions
  ): Promise<{ imagesCount: number; images: UploadedImage[]; pageId: number }> {
    return new Promise<{
      imagesCount: number;
      images: UploadedImage[];
      pageId: number;
    }>((resolve, reject) => {
      this.http
        .post<any>('/api/get-user-images', {
          startFrom,
          itemCount,
          filterOptions: filterOptions.getJson(),
        })
        .toPromise()
        .then(
          (response) => {
            const imagesCount: number = +response.imagesCount;
            const images: UploadedImage[] = [];
            for (let item of response.images) {
              images.push(UploadedImage.parseFromJson(item));
            }
            const pageId: number = +response.pageId;
            resolve({ imagesCount, images, pageId });
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public loadAllUserImages(
    startFrom: number,
    itemCount: number,
    filterOptions: ImageFilterOptions
  ): Promise<{ imagesCount: number; images: UploadedImage[]; pageId: number }> {
    return new Promise<{
      imagesCount: number;
      images: UploadedImage[];
      pageId: number;
    }>((resolve, reject) => {
      this.http
        .post<any>('/api/get-all-user-images', {
          startFrom,
          itemCount,
          filterOptions: filterOptions.getJson(),
        })
        .toPromise()
        .then(
          (response) => {
            const imagesCount: number = +response.imagesCount;
            const images: UploadedImage[] = [];
            for (let item of response.images) {
              images.push(UploadedImage.parseFromJson(item));
            }
            const pageId: number = +response.pageId;
            resolve({ imagesCount, images, pageId });
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public loadImage(imageId: string): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      this.http
        .post('/api/get-image', { imageId })
        .toPromise()
        .then(
          (response) => {
            resolve(UploadedImage.parseFromJson(response));
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public loadNextImage(
    imageId: string,
    filterOptions: ImageFilterOptions
  ): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      this.http
        .post('/api/get-neighbor-image', {
          imageId,
          filterOptions,
          isNext: true,
        })
        .toPromise()
        .then(
          (response) => {
            resolve(UploadedImage.parseFromJson(response));
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public loadPrevImage(
    imageId: string,
    filterOptions: ImageFilterOptions
  ): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      this.http
        .post('/api/get-neighbor-image', {
          imageId,
          filterOptions,
          isNext: false,
        })
        .toPromise()
        .then(
          (response) => {
            resolve(UploadedImage.parseFromJson(response));
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public addTextRegion(imageId: string, region: Region): Promise<TextRegion> {
    return new Promise<TextRegion>((resolve, reject) => {
      this.http
        .post('/api/add-region', { imageId, region })
        .toPromise()
        .then(
          (response) => {
            resolve(TextRegion.parseFromJson(response));
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public deleteTextRegion(regionId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http
        .post('/api/delete-region', { regionId })
        .toPromise()
        .then(
          (response) => {
            resolve();
          },
          (reason) => {
            reject(reason);
          }
        );
    });
  }

  public publishImage(imageId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http
        .post('/api/publish-image', { imageId })
        .toPromise()
        .then(
          () => {
            resolve();
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public deleteImage(imageId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http
        .post('/api/delete-image', { imageId })
        .toPromise()
        .then(
          () => {
            resolve();
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public deleteImageList(imageIdList: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http
        .post('/api/delete-image-list', { imageIdList })
        .toPromise()
        .then(
          () => {
            resolve();
          },
          (error) => {
            reject(error.error.error);
          }
        );
    });
  }

  public getExportStatus(): Promise<{
    exported: boolean;
    state: string;
    timestamp: number;
  }> {
    return new Promise<{ exported: boolean; state: string; timestamp: number }>(
      (resolve, reject) => {
        this.http
          .post<any>('/api/export-status', {})
          .toPromise()
          .then(
            (resp) => {
              resolve({
                exported: resp.exported,
                state: resp.state,
                timestamp: resp.timestamp,
              });
            },
            (error) => {
              reject(error.error.error);
            }
          );
      }
    );
  }
}
