import { ImageType } from './image-type';

export class ImageTagGroup {
  constructor(
    public readonly imageTagGroupId: string,
    public readonly displayName: string,
    public readonly isSingleValue: boolean,
    public readonly ofImageTypes: ImageType[],
    public readonly tagValues: ImageTag[]
  ) {}

  static parseFromJson(obj: any): ImageTagGroup {
    if (!obj) {
      return null;
    }
    const imageTagGroupId: string = obj.imageTagGroupId;
    const displayName: string = obj.displayName;
    const isSingleValue: boolean = obj.isSingleValue;
    const ofImageTypes: ImageType[] = [];
    if (obj.ofImageTypes) {
      for (const item of obj.ofImageTypes) {
        ofImageTypes.push(ImageType.parseFromJson(item));
      }
    }
    const tagValues: ImageTag[] = [];
    if (obj.tagValues) {
      for (const item of obj.tagValues) {
        tagValues.push(ImageTag.parseFromJson(item));
      }
    }
    return new ImageTagGroup(
      imageTagGroupId,
      displayName,
      isSingleValue,
      ofImageTypes,
      tagValues
    );
  }
}

export class ImageTag {
  constructor(
    public readonly imageTagId: string,
    public readonly ofImageTagGroupId: string,
    public readonly displayName: string
  ) {}

  static parseFromJson(obj: any): ImageTag {
    if (!obj) {
      return null;
    }
    const imageTagId: string = obj.imageTagId;
    const ofImageTagGroupId: string = obj.ofImageTagGroupId;
    const displayName: string = obj.displayName;
    return new ImageTag(imageTagId, ofImageTagGroupId, displayName);
  }
}
