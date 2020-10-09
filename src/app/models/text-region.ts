import LabelStatus from './label-status';
import User from './user';

class Coordinate {
  constructor(
    public x: number,
    public y: number
  ) { }

  static parseFromJson(obj: any): Coordinate {
    const x: number = obj.x;
    const y: number = obj.y;
    return new Coordinate(x, y);
  }
};

class Region {
  constructor(
    public vertices: Coordinate[]
  ) { }

  static parseFromJson(obj: any): Region {
    const vertices: Coordinate[] = [];
    if (obj.vertices) {
      for (let item of obj.vertices) {
        vertices.push(Coordinate.parseFromJson(item));
      }
    }
    return new Region(vertices);
  }

  public getPostgresPolygonString(): string {
    return '(' + this.vertices
      .map(item => '(' + item.x + ',' + item.y + ')')
      .join(',')
      + ')';
  }
};

class TextRegion {
  constructor(
    public readonly regionId: string,
    public readonly imageId: string,
    public readonly imageUrl: string,
    public readonly thumbnailUrl: string,
    public readonly region: Region,
    public readonly label: string,
    public readonly status: LabelStatus,
    public readonly uploadedBy: User,
    public readonly labeledBy: User,
    public readonly verifiedBy: User
  ) { }

  static parseFromJson(obj: any): TextRegion {
    const regionId: string = obj.regionId;
    const imageId: string = obj.imageId;
    const imageUrl: string = obj.imageUrl;
    const thumbnailUrl: string = obj.thumbnailUrl;
    const region: Region = Region.parseFromJson(obj.region);
    const label: string = obj.label;
    const status: LabelStatus = obj.status as LabelStatus;
    const uploadedBy: User = User.parseFromJson(obj.uploadedBy);
    const labelBy: User = User.parseFromJson(obj.labeledBy);
    const verifiedBy: User = User.parseFromJson(obj.verifiedBy);
    return new TextRegion(
      regionId,
      imageId,
      imageUrl,
      thumbnailUrl,
      region,
      label,
      status,
      uploadedBy,
      labelBy,
      verifiedBy
    );
  }
}

export { Coordinate, TextRegion, Region };