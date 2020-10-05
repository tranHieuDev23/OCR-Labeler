import LabelStatus from './label-status';
import User from './user';

class Region {
  constructor(
    public x1: number,
    public x2: number,
    public y1: number,
    public y2: number
  ) { }

  static parseFromJson(obj: any): Region {
    const x1: number = obj.x1;
    const x2: number = obj.x2;
    const y1: number = obj.y1;
    const y2: number = obj.y2;
    return new Region(x1, x2, y1, y2);
  }
};

class TextRegion {
  constructor(
    public readonly id: string,
    public readonly imageUrl: string,
    public readonly thumbnailUrl: string,
    public readonly region: Region,
    public readonly label: string,
    public readonly status: LabelStatus,
    public readonly labelBy: User,
    public readonly verifiedBy: User
  ) { }

  static parseFromJson(obj: any): TextRegion {
    const id: string = obj.id;
    const imageUrl: string = obj.imageUrl;
    const thumbnailUrl: string = obj.thumbnailUrl;
    const region: Region = Region.parseFromJson(obj.region);
    const label: string = obj.label;
    const status: LabelStatus = obj.status as LabelStatus;
    const labelBy: User = User.parseFromJson(obj.labelBy);
    const verifiedBy: User = User.parseFromJson(obj.verifiedBy);
    return new TextRegion(
      id,
      imageUrl,
      thumbnailUrl,
      region,
      label,
      status,
      labelBy,
      verifiedBy
    );
  }
}

export { TextRegion, Region };