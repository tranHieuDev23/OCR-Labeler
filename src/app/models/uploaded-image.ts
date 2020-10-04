import TextRegion from './text-region';
import User from './user';

class UploadedImage {
  constructor(
    public readonly imageId: string,
    public readonly imageUrl: string,
    public readonly thumbnailUrl: string,
    public readonly uploadedDate: Date,
    public readonly uploadedBy: User,
    public readonly textRegions: TextRegion[]
  ) { }

  static parseFromJson(obj: any): UploadedImage {
    const imageId: string = obj.imageId;
    const imageUrl: string = obj.imageUrl;
    const thumbnailUrl: string = obj.thumbnailUrl;
    const uploadedDate: Date = new Date(obj.uploadedDate);
    const uploadedBy: User = User.parseFromJson(obj.uploadedBy);
    const textRegions: TextRegion[] = [];
    for (let item of obj.textRegions) {
      textRegions.push(TextRegion.parseFromJson(item));
    }
    return new UploadedImage(
      imageId,
      imageUrl,
      thumbnailUrl,
      uploadedDate,
      uploadedBy,
      textRegions
    );
  }
}

export default UploadedImage;
