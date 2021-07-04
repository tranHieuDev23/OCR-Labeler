import { ImageFilterOptions } from './image-filter-options';

export class ExportResult {
  constructor(
    public readonly exportId: string,
    public readonly requestTime: Date,
    public readonly validTo: Date,
    public readonly filterOptions: ImageFilterOptions,
    public readonly imageCount: number,
    public readonly exportFilename: string
  ) {}

  public static parseFromJson(obj: any): ExportResult {
    const exportId: string = obj.exportId;
    const requestTime: Date = obj.requestTime
      ? new Date(obj.requestTime)
      : null;
    const validTo: Date = obj.validTo ? new Date(obj.validTo) : null;
    const filterOptions = obj.filterOptions
      ? ImageFilterOptions.parseFromJson(obj.filterOptions)
      : null;
    const imageCount = obj.imageCount ? +obj.imageCount : null;
    const exportFilename = obj.exportFilename ? obj.exportFilename : null;
    return new ExportResult(
      exportId,
      requestTime,
      validTo,
      filterOptions,
      imageCount,
      exportFilename
    );
  }
}
