import ImageStatus from './image-status';
import { ImageTag } from './image-tag';
import { ImageType } from './image-type';
// import { PolypRegion } from './polyp-region';
import { TextRegion } from './text-region';
import User from './user';

class UploadedImage {
  constructor(
    public readonly imageId: string,
    public readonly imageType: ImageType,
    public readonly imageUrl: string,
    public readonly thumbnailUrl: string,
    public readonly textRegion: TextRegion[],
    public readonly uploadedBy: User,
    public readonly uploadedDate: Date,
    public readonly status: ImageStatus,
    public readonly originalFilename: string,
    public readonly tags: ImageTag[],
    public readonly description: string
  ) {}

  static parseFromJson(obj: any): UploadedImage {
    if (!obj) {
      return null;
    }
    const imageId: string = obj.imageId;
    const imageType = ImageType.parseFromJson(obj.imageType);
    const imageUrl: string = obj.imageUrl;
    const thumbnailUrl: string = obj.thumbnailUrl;
    const textRegion: TextRegion[] = [];
    if (obj.textRegion) {
      for (const item of obj.textRegion) {
        textRegion.push(TextRegion.parseFromJson(item));
      }
    }
    const uploadedBy: User = obj.uploadedBy
      ? User.parseFromJson(obj.uploadedBy)
      : null;
    const uploadedDate: Date = new Date(obj.uploadedDate);
    const status: ImageStatus = obj.status as ImageStatus;
    const originalFilename: string = obj.originalFilename;
    const tags: ImageTag[] = [];
    if (obj.tags) {
      for (const item of obj.tags) {
        tags.push(ImageTag.parseFromJson(item));
      }
    }
    const description: string = obj.description;
    return new UploadedImage(
      imageId,
      imageType,
      imageUrl,
      thumbnailUrl,
      textRegion,
      uploadedBy,
      uploadedDate,
      status,
      originalFilename,
      tags,
      description
    );
  }
}

export default UploadedImage;
