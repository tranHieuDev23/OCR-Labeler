enum ImageStatus {
  Processing = 'Processing',
  Processed = 'Processed',
  NotProcessed = 'NotProcessed',
  PrePublished = 'PrePublished',
  Published = 'Published',
}

export function getAllImageStatuses(): ImageStatus[] {
  return [
    ImageStatus.Processing,
    ImageStatus.Processed,
    ImageStatus.NotProcessed,
    ImageStatus.PrePublished,
    ImageStatus.Published,
  ];
}

export function isPublishedStatus(status: ImageStatus): boolean {
  return (
    status === ImageStatus.PrePublished || status === ImageStatus.Published
  );
}

export function getImageStatusFilterClause(
  filteredStatuses: ImageStatus[]
): string {
  if (!filteredStatuses || filteredStatuses.length == 0) {
    return '';
  }
  return `AND "Images".status IN (${filteredStatuses
    .map((item) => `'${item}'`)
    .join(',')})`;
}

export function getImageStatusColor(status: ImageStatus): string {
  switch (status) {
    case ImageStatus.Processing:
      return 'orange';
    case ImageStatus.Processed:
      return 'blue';
    case ImageStatus.NotProcessed:
      return 'red';
    case ImageStatus.PrePublished:
      return 'cyan';
    case ImageStatus.Published:
      return 'green';
    default:
      return null;
  }
}

export function getImageStatusString(status: ImageStatus): string {
  switch (status) {
    case ImageStatus.Processing:
      return 'Processing';
    case ImageStatus.Processed:
      return 'Processed with CRAFT';
    case ImageStatus.NotProcessed:
      return 'Not processed with CRAFT';
    case ImageStatus.PrePublished:
      return 'Processing before publishing';
    case ImageStatus.Published:
      return 'Published';
    default:
      return null;
  }
}

export default ImageStatus;
