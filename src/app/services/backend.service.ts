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

  public loadRegionsForLabeling(username: string, itemCount: number): Promise<TextRegion[]> {
    return new Promise<TextRegion[]>((resolve, reject) => {

    });
  }

  public labelRegion(regionId: string, canLabel: boolean, label: string): Promise<void> {
    return new Promise<void>((resolve, rejects) => {
      resolve();
    });
  }

  public loadRegionsForVerifying(username: string, itemCount: number): Promise<TextRegion[]> {
    return new Promise<TextRegion[]>((resolve, reject) => {

    });
  }

  public verifyLabel(regionId: string, isCorrect: boolean): Promise<void> {
    return new Promise<void>((resolve, rejects) => {
      resolve();
    });
  }

  public loadUserImages(username: string, startFrom: number, itemCount: number): Promise<{ imagesCount: number, images: UploadedImage[] }> {
    return new Promise<{ imagesCount: number, images: UploadedImage[] }>((resolve, reject) => {

    });
  }

  public loadImage(username: string, imageId: string): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      reject("Cannot find image with the requested ID");
    });
  }

  public addTextRegion(username: string, imageId: string, region: Region): Promise<TextRegion> {
    return new Promise<TextRegion>((resolve, reject) => {
      resolve();
    });
  }

  public deleteTextRegion(username: string, regionId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resolve();
    });
  }

  public deleteImage(username: string, imageId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resolve();
    });
  }
}
