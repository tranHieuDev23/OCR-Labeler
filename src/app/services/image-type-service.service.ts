import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImageType, RegionLabel } from '../models/image-type';

@Injectable({
  providedIn: 'root',
})
export class ImageTypeService {
  constructor(private readonly http: HttpClient) {}

  public async getAllImageTypes() {
    try {
      const response = await this.http
        .post<any>('/api/image-type/get-image-types', {})
        .toPromise();
      return (response.imageTypes as any[]).map((item) =>
        ImageType.parseFromJson(item)
      );
    } catch (error) {
      throw error.error.error;
    }
  }

  public async getAllImageTypesWithoutLabel() {
    try {
      const response = await this.http
        .post<any>('/api/image-type/get-image-types-no-label', {})
        .toPromise();
      return (response.imageTypes as any[]).map((item) =>
        ImageType.parseFromJson(item)
      );
    } catch (error) {
      throw error.error.error;
    }
  }

  public async addImageType(displayName: string, hasPredictiveModel: boolean) {
    try {
      const response = await this.http
        .post<any>('/api/image-type/add-image-type', {
          displayName,
          hasPredictiveModel,
        })
        .toPromise();
      return ImageType.parseFromJson(response);
    } catch (error) {
      throw error.error.error;
    }
  }

  public async updateImageTypeName(typeId: string, newName: string) {
    try {
      await this.http
        .post('/api/image-type/update-image-type-name', { typeId, newName })
        .toPromise();
    } catch (error) {
      throw error.error.error;
    }
  }

  public async updateImageTypeHasPredictiveModel(
    typeId: string,
    hasPredictiveModel: boolean
  ) {
    try {
      await this.http
        .post('/api/image-type/update-image-type-has-predictive-model', {
          typeId,
          hasPredictiveModel,
        })
        .toPromise();
    } catch (error) {
      throw error.error.error;
    }
  }

  public async deleteImageType(typeId: string) {
    try {
      await this.http
        .post('/api/image-type/delete-image-type', { typeId })
        .toPromise();
    } catch (error) {
      throw error.error.error;
    }
  }

  public async addRegionLabel(
    ofTypeId: string,
    displayName: string,
    color: string
  ) {
    try {
      const response = await this.http
        .post<any>('/api/image-type/add-region-label', {
          ofTypeId,
          displayName,
          color,
        })
        .toPromise();
      return RegionLabel.parseFromJson(response);
    } catch (error) {
      throw error.error.error;
    }
  }

  public async updateRegionLabelName(labelId: string, newName: string) {
    try {
      await this.http
        .post('/api/image-type/update-region-label-name', { labelId, newName })
        .toPromise();
    } catch (error) {
      throw error.error.error;
    }
  }

  public async updateRegionLabelColor(labelId: string, color: string) {
    try {
      await this.http
        .post('/api/image-type/update-region-label-color', { labelId, color })
        .toPromise();
    } catch (error) {
      throw error.error.error;
    }
  }

  public async deleteRegionLabel(labelId: string) {
    try {
      await this.http
        .post('/api/image-type/delete-region-label', { labelId })
        .toPromise();
    } catch (error) {
      throw error.error.error;
    }
  }
}
