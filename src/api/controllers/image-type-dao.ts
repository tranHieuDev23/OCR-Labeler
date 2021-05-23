import { ImageType, RegionLabel } from 'src/app/models/image-type';
import databaseConnection from './database';
import RegionLabelDao from './region-dao';

class ImageTypeDao {
  private constructor() {}
  private static readonly INSTANCE = new ImageTypeDao();
  public static getInstance(): ImageTypeDao {
    return this.INSTANCE;
  }

  private readonly labelDao = RegionLabelDao.getInstance();

  public async getImageTypeWithoutLabel(typeId: string) {
    try {
      const imageTypeResult = await databaseConnection.oneOrNone(
        `
                SELECT * FROM public."ImageTypes"
                    WHERE "ImageTypes"."typeId" = $1;
            `,
        [typeId]
      );
      if (!imageTypeResult) {
        return null;
      }
      return ImageType.parseFromJson(imageTypeResult);
    } catch (e) {
      throw new Error(
        `[getImageTypeWithoutLabel()] Error happened while reading image types from database: ${e}`
      );
    }
  }

  public async getImageType(typeId: string) {
    try {
      const imageTypeResult = await databaseConnection.oneOrNone(
        `
                SELECT * FROM public."ImageTypes"
                    WHERE "ImageTypes"."typeId" = $1;
            `,
        [typeId]
      );
      if (!imageTypeResult) {
        return null;
      }
      const validLabels = await this.labelDao.getRegionLabelOfType(typeId);
      return new ImageType(
        imageTypeResult.typeId,
        imageTypeResult.displayName,
        imageTypeResult.hasPredictiveModel,
        validLabels
      );
    } catch (e) {
      throw new Error(
        `[getImageType()] Error happened while reading image types from database: ${e}`
      );
    }
  }

  public async getAllImageTypes() {
    try {
      const sqlResults = await Promise.all([
        databaseConnection.manyOrNone(`SELECT * FROM public."ImageTypes";`),
        databaseConnection.manyOrNone(`SELECT * FROM public."RegionLabels";`),
      ]);
      const imageTypeResults = sqlResults[0];
      const regionLabelResults = sqlResults[1];
      const typeId2Labels = new Map<string, RegionLabel[]>(
        imageTypeResults.map((item) => [item.typeId, []])
      );
      regionLabelResults.forEach((item) => {
        typeId2Labels.get(item.ofTypeId).push(RegionLabel.parseFromJson(item));
      });
      const results = imageTypeResults.map(
        (item) =>
          new ImageType(
            item.typeId,
            item.displayName,
            item.hasPredictiveModel,
            typeId2Labels.get(item.typeId)
          )
      );
      return results;
    } catch (e) {
      throw new Error(
        `[getAllImageTypes()] Error happened while reading image types from database: ${e}`
      );
    }
  }

  public async getAllImageTypesWithoutLabel() {
    try {
      const imageTypeResult = await databaseConnection.manyOrNone(
        `SELECT * FROM public."ImageTypes";`
      );
      const results = imageTypeResult.map((item) =>
        ImageType.parseFromJson(item)
      );
      return results;
    } catch (e) {
      throw new Error(
        `[getAllImageTypesWithoutLabel()] Error happened while reading image types from database: ${e}`
      );
    }
  }

  public async addImageType(imageType: ImageType) {
    try {
      await databaseConnection.none(
        `
                INSERT INTO public."ImageTypes"("typeId", "displayName", "hasPredictiveModel")
                    VALUES ($1, $2, $3);
            `,
        [imageType.typeId, imageType.displayName, imageType.hasPredictiveModel]
      );
      await this.labelDao.addRegionLabels(
        imageType.validLabels,
        imageType.typeId
      );
    } catch (e) {
      throw new Error(
        `[addImageType()] Error happened while reading image types from database: ${e}`
      );
    }
  }

  public async updateImageTypeMetadata(imageType: ImageType) {
    try {
      await databaseConnection.none(
        `
                UPDATE public."ImageTypes"
                SET
                    "displayName" = $2,
                    "hasPredictiveModel" = $3
                WHERE "typeId" = $1;
            `,
        [imageType.typeId, imageType.displayName, imageType.hasPredictiveModel]
      );
    } catch (e) {
      throw new Error(
        `[updateImageTypeMetadata()] Error happened while updating image types: ${e}`
      );
    }
  }

  public async deleteImageType(typeId: string) {
    try {
      await databaseConnection.none(
        `
                DELETE FROM public."ImageTypes"
                    WHERE "typeId" = $1;
            `,
        [typeId]
      );
    } catch (e) {
      throw new Error(
        `[deleteImageType()] Error happened while delete image types: ${e}`
      );
    }
  }
}

export default ImageTypeDao;
