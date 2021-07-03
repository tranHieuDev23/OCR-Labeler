import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ExportProgress } from 'src/app/models/export-progress';
import { ExportResult } from 'src/app/models/export-result';
import { ImageFilterOptions } from 'src/app/models/image-filter-options';
import UploadedImage from 'src/app/models/uploaded-image';
import { ExportDatasetService } from 'src/app/services/export-dataset.service';

const DEFAULT_IMAGES_PER_PAGE = 12;

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
})
export class ExportComponent implements OnInit {
  public currentPage: number = null;
  public imagesPerPage: number = DEFAULT_IMAGES_PER_PAGE;
  public imagesCount: number = null;
  public images: UploadedImage[] = [];
  public filterOptions: ImageFilterOptions = null;
  public isLoadingImage = false;

  public exportResults: ExportResult[] = null;
  public exportProgresses: ExportProgress[] = null;
  public isLoadingStatus = false;

  constructor(
    private readonly router: Router,
    private exportDatasetService: ExportDatasetService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    const filterOptions = ImageFilterOptions.getDefaultOptions();
    this.loadPage(1, DEFAULT_IMAGES_PER_PAGE, filterOptions).then();
  }

  async changeFilterOptions(filterOptions: ImageFilterOptions) {
    this.filterOptions = filterOptions;
    await this.reloadCurrentPage();
  }

  async changePage(event: number) {
    if (event === this.currentPage) {
      return;
    }
    this.currentPage = event;
    await this.reloadCurrentPage();
  }

  async changePageSize(event: number) {
    if (event === this.imagesPerPage) {
      return;
    }
    this.imagesPerPage = event;
    await this.reloadCurrentPage();
  }

  private async loadPage(
    pageId: number,
    imagesPerPage: number,
    filterOptions: ImageFilterOptions
  ) {
    this.isLoadingImage = true;
    this.currentPage = pageId;
    this.filterOptions = filterOptions;
    this.imagesPerPage = imagesPerPage;
    try {
      const result = await this.exportDatasetService.getExportableImage(
        imagesPerPage * (pageId - 1),
        imagesPerPage,
        this.filterOptions
      );
      this.currentPage = result.pageId;
      this.imagesCount = result.imagesCount;
      this.images = result.images;
      this.isLoadingImage = false;
    } catch (error) {
      this.notification.error(
        'An error happened while loading page',
        `${error}`
      );
      this.router.navigateByUrl('/');
    }
  }

  private async reloadCurrentPage() {
    await this.loadPage(
      this.currentPage,
      this.imagesPerPage,
      this.filterOptions
    );
  }

  async requestExport() {
    try {
      await this.exportDatasetService.requestExport(this.filterOptions);
      this.notification.success(
        'Requested successfully',
        'Please check export status in <b>Requests in queue</b> tab, and download in <b>Download dataset</b> tab'
      );
    } catch (e) {
      this.notification.error('Failed to request dataset export', e);
    }
  }

  async download(exportId: string) {
    try {
      await this.exportDatasetService.downloadExport(exportId);
    } catch (e) {
      this.notification.error('Failed to download dataset', e);
    }
  }

  async delete(exportId: string) {
    try {
      await this.exportDatasetService.deleteExport(exportId);
      this.exportResults = this.exportResults.filter(
        (item) => item.exportId !== exportId
      );
      this.notification.success('Deleted dataset successfully', '');
    } catch (e) {
      this.notification.error('Failed to delete dataset', e);
    }
  }

  async onExportStatusTabsSelected() {
    if (
      this.isLoadingStatus ||
      this.exportResults !== null ||
      this.exportProgresses !== null
    ) {
      return;
    }
    await this.refreshExportStatues();
  }

  async refreshExportStatues() {
    if (this.isLoadingStatus) {
      return;
    }
    this.isLoadingStatus = true;
    try {
      const results = await this.exportDatasetService.getExportStatus();
      this.exportResults = results.exported;
      this.exportProgresses = results.exporting;
      this.isLoadingStatus = false;
    } catch (e) {
      this.notification.error('Failed to get export status', e);
    }
  }
}
