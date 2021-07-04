import { ImageComparationOption } from './image-dao-util';

export function getAllImageSortOptions() {
  return [
    ImageComparationOption.UPLOAD_LATEST_FIRST,
    ImageComparationOption.UPLOAD_OLDEST_FIRST,
    ImageComparationOption.STATUS_ASC,
    ImageComparationOption.STATUS_DESC,
    ImageComparationOption.USER_ASC,
    ImageComparationOption.USER_DESC,
  ];
}

export function getImageSortOptionString(
  option: ImageComparationOption
): string {
  switch (option) {
    case ImageComparationOption.UPLOAD_LATEST_FIRST:
      return 'Upload date (Latest first)';
    case ImageComparationOption.UPLOAD_OLDEST_FIRST:
      return 'Upload date (Oldest first)';
    case ImageComparationOption.STATUS_ASC:
      return 'Status (Asc.)';
    case ImageComparationOption.STATUS_DESC:
      return 'Status (Desc.)';
    case ImageComparationOption.USER_ASC:
      return 'User (Asc.)';
    case ImageComparationOption.USER_DESC:
      return 'User (Desc.)';
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
