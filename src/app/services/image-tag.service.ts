import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImageTag, ImageTagGroup } from '../models/image-tag';

@Injectable({
  providedIn: 'root',
})
export class ImageTagService {
  constructor(private readonly http: HttpClient) {}

  public async getAllImageTagGroups(): Promise<ImageTagGroup[]> {
    try {
      const response = await this.http
        .post<any>('/api/image-tag/get-image-tag-groups', {})
        .toPromise();
      const imageTagGroups = response.imageTagGroups as any[];
      return imageTagGroups.map((item) => ImageTagGroup.parseFromJson(item));
    } catch (e) {
      throw e.error.error;
    }
  }

  public async getImageTagGroupOfImageType(
    typeId: string
  ): Promise<ImageTagGroup[]> {
    try {
      const response = await this.http
        .post<any>('/api/image-tag/get-image-tag-groups-of-image-type', {
          typeId,
        })
        .toPromise();
      const imageTagGroups = response.imageTagGroups as any[];
      return imageTagGroups.map((item) => ImageTagGroup.parseFromJson(item));
    } catch (e) {
      throw e.error.error;
    }
  }

  public async addImageTagGroup(
    displayName: string,
    isSingleValue: boolean
  ): Promise<ImageTagGroup> {
    try {
      const response = await this.http
        .post<any>('/api/image-tag/add-image-tag-group', {
          displayName,
          isSingleValue,
        })
        .toPromise();
      return ImageTagGroup.parseFromJson(response);
    } catch (e) {
      throw e.error.error;
    }
  }

  public async updateImageTagGroupName(tagGroupId: string, newName: string) {
    try {
      await this.http
        .post<any>('/api/image-tag/update-image-tag-group-name', {
          tagGroupId,
          newName,
        })
        .toPromise();
    } catch (e) {
      throw e.error.error;
    }
  }

  public async deleteImageTagGroup(tagGroupId: string) {
    try {
      await this.http
        .post<any>('/api/image-tag/delete-image-tag-group', { tagGroupId })
        .toPromise();
    } catch (e) {
      throw e.error.error;
    }
  }

  public async updateImageTypesOfTagGroup(
    tagGroupId: string,
    ofImageTypeIds: string[]
  ) {
    try {
      await this.http
        .post<any>('/api/image-tag/update-image-type-of-tag-group', {
          tagGroupId,
          ofImageTypeIds,
        })
        .toPromise();
    } catch (e) {
      throw e.error.error;
    }
  }

  public async addImageTag(
    displayName: string,
    ofImageTagGroupId: string
  ): Promise<ImageTag> {
    try {
      const response = await this.http
        .post<any>('/api/image-tag/add-image-tag', {
          displayName,
          ofImageTagGroupId,
        })
        .toPromise();
      return ImageTag.parseFromJson(response);
    } catch (e) {
      throw e.error.error;
    }
  }

  public async updateImageTagName(imageTagId: string, newName: string) {
    try {
      await this.http
        .post<any>('/api/image-tag/update-image-tag-name', {
          imageTagId,
          newName,
        })
        .toPromise();
    } catch (e) {
      throw e.error.error;
    }
  }

  public async deleteImageTag(imageTagId: string) {
    try {
      await this.http
        .post<any>('/api/image-tag/delete-image-tag', { imageTagId })
        .toPromise();
    } catch (e) {
      throw e.error.error;
    }
  }
}
