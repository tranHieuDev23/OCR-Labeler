import ImageStatus from './image-status';
import { TextRegion } from './text-region';
import { ImageTag } from './image-tag';
import { ImageType } from './image-type';
import User from './user';

// thêm 3 trường originalFileName, ImageTag, description

class UploadedImage {
  constructor(
    public readonly imageId: string,
    public readonly imageUrl: string,
    public readonly thumbnailUrl: string,
    public readonly textRegions: TextRegion[],
    public readonly uploadedBy: User,
    public readonly uploadedDate: Date,
    public readonly status: ImageStatus // public readonly imageType: ImageType,
  ) // public readonly originalFilename: string,
  // public readonly tags: ImageTag[],
  // public readonly description: string
  {}

  static parseFromJson(obj: any): UploadedImage {
    const imageId: string = obj.imageId;
    const imageUrl: string = obj.imageUrl;
    const thumbnailUrl: string = obj.thumbnailUrl;
    const textRegions: TextRegion[] = [];
    if (obj.textRegions) {
      for (let item of obj.textRegions) {
        textRegions.push(TextRegion.parseFromJson(item));
      }
    }
    const uploadedBy: User = obj.uploadedBy
      ? User.parseFromJson(obj.uploadedBy)
      : null;
    const uploadedDate: Date = new Date(obj.uploadedDate);
    const status: ImageStatus = obj.status as ImageStatus;
    return new UploadedImage(
      imageId,
      imageUrl,
      thumbnailUrl,
      textRegions,
      uploadedBy,
      uploadedDate,
      status
    );
  }
}

export default UploadedImage;
