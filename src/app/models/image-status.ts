enum ImageStatus {
  Uploaded = 'Uploaded',
  Processed = 'Processed',
  NotProcessed = 'NotProcessed',
  Published = 'Published'
}

export function getImageStatusFilterClause(filteredStatuses: ImageStatus[]): string {
  if (!filteredStatuses || filteredStatuses.length == 0) {
    return '';
  }
  return `AND "Images".status IN (${filteredStatuses.map(item => `'${item}'`).join(',')})`
}

export function getImageStatusColor(status: ImageStatus): string {
  switch (status) {
    case ImageStatus.Uploaded:
      return 'orange';
    case ImageStatus.Processed:
      return 'blue';
    case ImageStatus.NotProcessed:
      return 'red';
    case ImageStatus.Published:
      return 'green';
    default:
      return null;
  }
}

export function getImageStatusString(status: ImageStatus): string {
  switch (status) {
    case ImageStatus.Uploaded:
      return 'Just uploaded';
    case ImageStatus.Processed:
      return 'Processed with CRAFT';
    case ImageStatus.NotProcessed:
      return 'Not processed with CRAFT';
    case ImageStatus.Published:
      return 'Published';
    default:
      return null;
  }
}

export default ImageStatus;
