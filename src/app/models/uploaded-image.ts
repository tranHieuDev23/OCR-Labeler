import { TextRegion } from './text-region';

class UploadedImage {
  constructor(
    public readonly imageId: string,
    public readonly imageUrl: string,
    public readonly thumbnailUrl: string,
    public readonly textRegions: TextRegion[]
  ) { }

  static parseFromJson(obj: any): UploadedImage {
    const imageId: string = obj.imageId;
    const imageUrl: string = obj.imageUrl;
    const thumbnailUrl: string = obj.thumbnailUrl;
    const textRegions: TextRegion[] = [];
    for (let item of obj.textRegions) {
      textRegions.push(TextRegion.parseFromJson(item));
    }
    return new UploadedImage(
      imageId,
      imageUrl,
      thumbnailUrl,
      textRegions
    );
  }
}

export default UploadedImage;
