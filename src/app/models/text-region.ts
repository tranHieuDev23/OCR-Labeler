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
    return this.vertices
      .map(item => item.x + ',' + item.y)
      .join(';');
  }

  static parseFromPostgresPolygonString(str: string): Region {
    const parts: string[] = str.split(';');
    const vertices: Coordinate[] = [];
    for (let item of parts) {
      const values: string[] = item.split(',');
      vertices.push(new Coordinate(+values[0], +values[1]));
    }
    return new Region(vertices);
  }
};

class TextRegion {
  constructor(
    public readonly regionId: string,
    public readonly imageId: string,
    public readonly region: Region,
    public readonly label: string,
    public readonly status: LabelStatus,
    public readonly uploadedBy: User,
    public readonly labeledBy: User,
    public readonly verifiedBy: User,
    public readonly suggestion: string
  ) { }

  static parseFromJson(obj: any): TextRegion {
    const regionId: string = obj.regionId;
    const thumbnailUrl: string = obj.thumbnailUrl;
    const region: Region = Region.parseFromJson(obj.region);
    const label: string = obj.label;
    const status: LabelStatus = obj.status as LabelStatus;
    const uploadedBy: User = obj.uploadedBy ? User.parseFromJson(obj.uploadedBy) : null;
    const labelBy: User = obj.labeledBy ? User.parseFromJson(obj.labeledBy) : null;
    const verifiedBy: User = obj.verifiedBy ? User.parseFromJson(obj.verifiedBy) : null;
    const suggestion: string = obj.suggestion;
    return new TextRegion(
      regionId,
      thumbnailUrl,
      region,
      label,
      status,
      uploadedBy,
      labelBy,
      verifiedBy,
      suggestion
    );
  }

  static parseFromPostgresResult(obj: any): TextRegion {
    const regionId: string = obj.regionId;
    const thumbnailUrl: string = obj.thumbnailUrl;
    const region: Region = Region.parseFromPostgresPolygonString(obj.region);
    const label: string = obj.label;
    const status: LabelStatus = obj.status as LabelStatus;
    const suggestion: string = obj.suggestion;
    return new TextRegion(
      regionId,
      thumbnailUrl,
      region,
      label,
      status,
      null,
      null,
      null,
      suggestion
    );
  }
}

export { Coordinate, TextRegion, Region };