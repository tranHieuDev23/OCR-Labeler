import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExportProgress } from '../models/export-progress';
import { ExportResult } from '../models/export-result';
import { ImageFilterOptions } from '../models/image-filter-options';
import UploadedImage from '../models/uploaded-image';
// import streamSaver from 'streamsaver';

@Injectable({
  providedIn: 'root',
})
export class ExportDatasetService {
  constructor(private readonly http: HttpClient) {}

  public async getExportableImage(
    startFrom: number,
    itemCount: number,
    filterOptions: ImageFilterOptions
  ): Promise<{ imagesCount: number; images: UploadedImage[]; pageId: number }> {
    try {
      const response = await this.http
        .post<any>('/api/export/get-exportable-images', {
          startFrom,
          itemCount,
          filterOptions: filterOptions.getJson(),
        })
        .toPromise();
      const imagesCount: number = +response.imagesCount;
      const images: UploadedImage[] = [];
      for (const item of response.images) {
        images.push(UploadedImage.parseFromJson(item));
      }
      const pageId: number = +response.pageId;
      return { imagesCount, images, pageId };
    } catch (error) {
      throw error.error.error;
    }
  }

  public async getExportStatus(): Promise<{
    exported: ExportResult[];
    exporting: ExportProgress[];
  }> {
    try {
      const response = await this.http
        .post<any>('/api/export/export-status', {})
        .toPromise();
      const exported: any[] = response.exported;
      const exporting: any[] = response.exporting;
      return {
        exported: exported.map((item) => ExportResult.parseFromJson(item)),
        exporting: exporting.map((item) => ExportProgress.parseFromJson(item)),
      };
    } catch (error) {
      throw error.error.error;
    }
  }

  public async requestExport(filterOptions: ImageFilterOptions): Promise<void> {
    try {
      await this.http
        .post('/api/export/request-export', { filterOptions })
        .toPromise();
    } catch (error) {
      throw error.error.error;
    }
  }

  public async downloadExport(exportId: string): Promise<void> {
    window.open(`/api/export/download-export?exportId=${exportId}`, 'blank');
  }

  public async deleteExport(exportId: string): Promise<void> {
    try {
      await this.http
        .post('/api/export/delete-export', { exportId })
        .toPromise();
    } catch (error) {
      throw error.error.error;
    }
  }
}
