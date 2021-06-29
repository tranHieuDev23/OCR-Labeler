import UploadedImage from './uploaded-image';
import { ImageFilterOptions } from 'src/app/models/image-filter-options';
import { ImageSortOption } from 'src/app/models/image-sort-options';
export enum ImageComparationOption {
  UPLOAD_LATEST_FIRST = 'UPLOAD_LATEST_FIRST',
  UPLOAD_OLDEST_FIRST = 'UPLOAD_OLDEST_FIRST',
  STATUS_ASC = 'STATUS_ASC',
  STATUS_DESC = 'STATUS_DESC',
  USER_ASC = 'USER_ASC',
  USER_DESC = 'USER_DESC',
}

export function getOrderByClause(option: ImageComparationOption): string {
  switch (option) {
    case ImageComparationOption.UPLOAD_LATEST_FIRST:
      return 'ORDER BY "Images"."uploadedDate" DESC, "Images"."imageId"';
    case ImageComparationOption.UPLOAD_OLDEST_FIRST:
      return 'ORDER BY "Images"."uploadedDate", "Images"."imageId" DESC';
    case ImageComparationOption.STATUS_ASC:
      return 'ORDER BY "Images".status, "Images"."imageId"';
    case ImageComparationOption.STATUS_DESC:
      return 'ORDER BY "Images".status DESC, "Images"."imageId" DESC';
    case ImageComparationOption.USER_ASC:
      return 'ORDER BY "Images"."uploadedBy", "Images"."imageId"';
    case ImageComparationOption.USER_DESC:
      return 'ORDER BY "Images"."uploadedBy" DESC, "Images"."imageId" DESC';
    default:
      return '';
  }
}

export function getOppositeOption(
  option: ImageComparationOption
): ImageComparationOption {
  switch (option) {
    case ImageComparationOption.UPLOAD_LATEST_FIRST:
      return ImageComparationOption.UPLOAD_OLDEST_FIRST;
    case ImageComparationOption.UPLOAD_OLDEST_FIRST:
      return ImageComparationOption.UPLOAD_LATEST_FIRST;
    case ImageComparationOption.STATUS_ASC:
      return ImageComparationOption.STATUS_DESC;
    case ImageComparationOption.STATUS_DESC:
      return ImageComparationOption.STATUS_ASC;
    case ImageComparationOption.USER_ASC:
      return ImageComparationOption.USER_DESC;
    case ImageComparationOption.USER_DESC:
      return ImageComparationOption.USER_ASC;
    default:
      return null;
  }
}

/// viết thêm , image-compare-funcs = image-dao-untils
class ParameterizedSubquery {
  constructor(
    public readonly subquery: string = 'true',
    public readonly parameters: any[] = []
  ) {}
}

export function getFilterClauseExport(
  filterOptions: ImageFilterOptions
): ParameterizedSubquery {
  const emptyFilterStatuses: boolean =
    !filterOptions.filteredStatuses ||
    filterOptions.filteredStatuses.length === 0;
  const emptyFilterUsers: boolean =
    !filterOptions.filteredUsers || filterOptions.filteredUsers.length === 0;
  const emptyFilterUploadTime: boolean =
    filterOptions.filteredUploadTime === null ||
    filterOptions.filteredUploadTime.length !== 2;
  const conditionClauses: string[] = [];
  const parameters: any[] = [];
  if (!emptyFilterStatuses) {
    conditionClauses.push(
      `"Images".status IN (${filterOptions.filteredStatuses
        .map(() => '?')
        .join(',')})`
    );
    parameters.push(...filterOptions.filteredStatuses);
  }
  if (!emptyFilterUsers) {
    conditionClauses.push(
      `"Images"."uploadedBy" IN (${filterOptions.filteredUsers
        .map(() => '?')
        .join(',')})`
    );
    parameters.push(...filterOptions.filteredUsers);
  }
  if (!emptyFilterUploadTime) {
    conditionClauses.push('"Images"."uploadedDate" BETWEEN ? AND ?');
    parameters.push(
      filterOptions.filteredUploadTime[0].getTime(),
      filterOptions.filteredUploadTime[1].getTime()
    );
  }
  if (conditionClauses.length === 0) {
    return new ParameterizedSubquery();
  }
  const subquery = conditionClauses.join(' AND ');
  return new ParameterizedSubquery(subquery, parameters);
}

export function getOrderByClauseExport(option: ImageSortOption): string {
  switch (option) {
    case ImageSortOption.UPLOAD_LATEST_FIRST:
      return 'ORDER BY "Images"."uploadedDate" DESC, "Images"."imageId" DESC';
    case ImageSortOption.UPLOAD_OLDEST_FIRST:
      return 'ORDER BY "Images"."uploadedDate", "Images"."imageId"';
    case ImageSortOption.STATUS_ASC:
      return 'ORDER BY "Images".status, "Images"."imageId"';
    case ImageSortOption.STATUS_DESC:
      return 'ORDER BY "Images".status DESC, "Images"."imageId" DESC';
    case ImageSortOption.USER_ASC:
      return 'ORDER BY "Images"."uploadedBy", "Images"."imageId"';
    case ImageSortOption.USER_DESC:
      return 'ORDER BY "Images"."uploadedBy" DESC, "Images"."imageId" DESC';
    default:
      return '';
  }
}
