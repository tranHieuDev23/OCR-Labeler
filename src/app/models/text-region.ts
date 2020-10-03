import LabelStatus from './label-status';
import User from './user';

class TextRegion {
  constructor(
    public readonly id: String,
    public readonly imageUrl: String,
    public readonly thumbnailUrl: String,
    public readonly top: number,
    public readonly bottom: number,
    public readonly left: number,
    public readonly right: number,
    public readonly label: String,
    public readonly status: LabelStatus,
    public readonly labelBy: User,
    public readonly verifiedBy: User
  ) {}

  static parseFromJson(obj: any): TextRegion {
    const id: String = obj.id;
    const imageUrl: String = obj.imageUrl;
    const thumbnailUrl: String = obj.thumbnailUrl;
    const top: number = obj.id;
    const bottom: number = obj.id;
    const left: number = obj.id;
    const right: number = obj.id;
    const label: String = obj.id;
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
