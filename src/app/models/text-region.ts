import LabelStatus from './label-status';
import User from './user';

class TextRegion {
  constructor(
    public readonly id: string,
    public readonly imageUrl: string,
    public readonly thumbnailUrl: string,
    public readonly top: number,
    public readonly bottom: number,
    public readonly left: number,
    public readonly right: number,
    public readonly label: string,
    public readonly status: LabelStatus,
    public readonly labelBy: User,
    public readonly verifiedBy: User
  ) { }

  static parseFromJson(obj: any): TextRegion {
    const id: string = obj.id;
    const imageUrl: string = obj.imageUrl;
    const thumbnailUrl: string = obj.thumbnailUrl;
    const top: number = obj.id;
    const bottom: number = obj.id;
    const left: number = obj.id;
    const right: number = obj.id;
    const label: string = obj.id;
    const status: LabelStatus = obj.status as LabelStatus;
    const labelBy: User = User.parseFromJson(obj.labelBy);
    const verifiedBy: User = User.parseFromJson(obj.labelBy);
    return new TextRegion(
      id,
      imageUrl,
      thumbnailUrl,
      top,
      bottom,
      left,
      right,
      label,
      status,
      labelBy,
      verifiedBy
    );
  }
}

export default TextRegion;
