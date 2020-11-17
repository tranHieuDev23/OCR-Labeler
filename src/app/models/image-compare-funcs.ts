import UploadedImage from './uploaded-image';

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

export function getOppositeOption(option: ImageComparationOption): ImageComparationOption {
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