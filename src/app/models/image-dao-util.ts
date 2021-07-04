import { ImageFilterOptions } from 'src/app/models/image-filter-options';
import UploadedImage from 'src/app/models/uploaded-image';
import { getOppositeOption } from './image-sort-options';

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
      return 'ORDER BY "Images"."uploadedDate" DESC, "Images"."imageId" DESC';
    case ImageComparationOption.UPLOAD_OLDEST_FIRST:
      return 'ORDER BY "Images"."uploadedDate", "Images"."imageId"';
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

class ParameterizedSubquery {
  constructor(
    public readonly subquery: string = 'true',
    public readonly parameters: any[] = []
  ) {}
}

export function getFilterClause(
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

export function getCompareWithImageClause(
  image: UploadedImage,
  filterOptions: ImageFilterOptions,
  isNext: boolean
): ParameterizedSubquery {
  const option = isNext
    ? filterOptions.sortOption
    : getOppositeOption(filterOptions.sortOption);
  let sortValue: any;
  let sortColumn: string;
  let comparator: string;
  switch (option) {
    case ImageComparationOption.UPLOAD_LATEST_FIRST:
    case ImageComparationOption.UPLOAD_OLDEST_FIRST:
      sortValue = image.uploadedDate.getTime();
      sortColumn = '"Images"."uploadedDate"';
      break;
    case ImageComparationOption.STATUS_ASC:
    case ImageComparationOption.STATUS_DESC:
      sortValue = image.status;
      sortColumn = '"Images"."status"';
      break;
    case ImageComparationOption.USER_ASC:
    case ImageComparationOption.USER_DESC:
      sortValue = image.uploadedBy.username;
      sortColumn = '"Images"."uploadedBy"';
      break;
    default:
      return new ParameterizedSubquery();
  }
  switch (option) {
    case ImageComparationOption.UPLOAD_OLDEST_FIRST:
    case ImageComparationOption.STATUS_ASC:
    case ImageComparationOption.USER_ASC:
      comparator = '<';
      break;
    case ImageComparationOption.UPLOAD_LATEST_FIRST:
    case ImageComparationOption.STATUS_DESC:
    case ImageComparationOption.USER_DESC:
      comparator = '>';
      break;
  }
  const filterClause = getFilterClause(filterOptions);
  const subquery = `
        WHERE (? ${comparator} ${sortColumn} OR (? = ${sortColumn} AND ? ${comparator} "Images"."imageId"))
        AND ${filterClause.subquery}
        ${getOrderByClause(option)}
    `;
  const parameters = [
    sortValue,
    sortValue,
    image.imageId,
    ...filterClause.parameters,
  ];
  return new ParameterizedSubquery(subquery, parameters);
}
