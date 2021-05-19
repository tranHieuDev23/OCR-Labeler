export class ImageType {
  constructor(
    public readonly typeId: string,
    public readonly displayName: string,
    public readonly hasPredictiveModel: boolean,
    public readonly validLabels: RegionLabel[]
  ) {}

  static parseFromJson(obj: any): ImageType {
    if (!obj) {
      return null;
    }
    const typeId: string = obj.typeId;
    const displayName: string = obj.displayName;
    const hasPredictiveModel: boolean = obj.hasPredictiveModel;
    const validLabels: RegionLabel[] = [];
    if (obj.validLabels) {
      for (const item of obj.validLabels) {
        validLabels.push(RegionLabel.parseFromJson(item));
      }
    }
    return new ImageType(typeId, displayName, hasPredictiveModel, validLabels);
  }

  public getLabel(labelId: string) {
    return this.validLabels.find((item) => item.labelId === labelId);
  }
}

export class RegionLabel {
  constructor(
    public readonly labelId: string,
    public readonly displayName: string,
    public readonly color: string
  ) {}

  static parseFromJson(obj: any): RegionLabel {
    if (!obj) {
      return null;
    }
    const labelId: string = obj.labelId;
    const displayName: string = obj.displayName;
    const color: string = obj.color;
    return new RegionLabel(labelId, displayName, color);
  }
}
