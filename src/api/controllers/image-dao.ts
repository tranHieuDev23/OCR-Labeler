import {
  getOrderByClause,
  ImageComparationOption,
  getFilterClause,
  getCompareWithImageClause,
} from 'src/app/models/image-compare-funcs';
import ImageStatus, {
  getImageStatusFilterClause,
} from 'src/app/models/image-status';
import { ImageFilterOptions } from 'src/app/models/image-filter-options';
import UploadedImage from 'src/app/models/uploaded-image';
import User from 'src/app/models/user';
import databaseConnection from './database';
import TextRegionDao from './region-dao';
import UserDao from './user-dao';
import { toOrdinal } from 'pg-parameterize';
const userDao: UserDao = UserDao.getInstance();
const regionDao: TextRegionDao = TextRegionDao.getInstance();

class ImageDao {
  private constructor() {}

  public static getInstance(): ImageDao {
    return new ImageDao();
  }

  public async getImagesCount(
    filterOptions: ImageFilterOptions
  ): Promise<number> {
    try {
      const filterClause = getFilterClause(filterOptions);
      const query = toOrdinal(`
                SELECT COUNT(*) FROM public."Images"
                    WHERE ${filterClause.subquery};
            `);
      const result = await databaseConnection.one(
        query,
        filterClause.parameters
      );
      return +result.count;
    } catch (e) {
      throw `[getImagesCount()] Error happened while reading database: ${e}`;
    }
  }

  public async getImages(
    startFrom: number,
    itemCount: number,
    filterOptions: ImageFilterOptions
  ) {
    try {
      const filterClause = getFilterClause(filterOptions);
      const getImagesQuery = toOrdinal(`
              SELECT * FROM public."Images" JOIN public."Users" ON "Images"."uploadedBy" = "Users".username
                  WHERE ${filterClause.subquery}
                  ${getOrderByClause(filterOptions.sortOption)}
                  OFFSET ? LIMIT ?;
          `);
      const imageResults = await databaseConnection.any(getImagesQuery, [
        ...filterClause.parameters,
        startFrom,
        itemCount,
      ]);
      if (imageResults.length === 0) {
        return [];
      }

      const images: UploadedImage[] = [];
      for (const item of imageResults) {
        const ofUser = User.parseFromJson(item);
        images.push(
          new UploadedImage(
            item.imageId,
            item.imageUrl,
            item.thumbnailUrl,
            [],
            ofUser,
            new Date(+item.uploadedDate),
            item.status as ImageStatus
          )
        );
      }
      return images;
    } catch (e) {
      throw new Error(
        `[getImages()] Error happened while reading from database: ${e}`
      );
    }
  }

  public getUserImagesCount(
    filterOptions: ImageFilterOptions
  ): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const filterClause = getFilterClause(filterOptions);
      const query = toOrdinal(`
      SELECT COUNT(*) FROM public."Images"
          WHERE ${filterClause.subquery};
      `);
      databaseConnection.one(query, filterClause.parameters).then(
        (result) => {
          resolve(+result.count);
        },
        (reason) => {
          reject(
            `[getUserImagesCount()] Error happened while writing into database: ${reason}`
          );
        }
      );
    });
  }

  public getUserImages(
    startFrom: number,
    itemCount: number,
    filterOptions: ImageFilterOptions
  ): Promise<UploadedImage[]> {
    return new Promise<UploadedImage[]>((resolve, reject) => {
      const filterClause = getFilterClause(filterOptions);
      const getImagesQuery = toOrdinal(`
                SELECT * FROM public."Images" JOIN public."Users" ON "Images"."uploadedBy" = "Users".username
                    WHERE ${filterClause.subquery}
                    ${getOrderByClause(filterOptions.sortOption)}
                    OFFSET ? LIMIT ?;
            `);
      databaseConnection
        .any(getImagesQuery, [...filterClause.parameters, startFrom, itemCount])
        .then(
          (results) => {
            const images: UploadedImage[] = [];
            for (const item of results) {
              const ofUser = User.parseFromJson(item);
              images.push(
                new UploadedImage(
                  item.imageId,
                  item.imageUrl,
                  item.thumbnailUrl,
                  [],
                  ofUser,
                  new Date(+item.uploadedDate),
                  item.status as ImageStatus
                )
              );
            }
            resolve(images);
          },
          (reason) => {
            reject(
              `[getUserImages()] Error happened while writing into database: ${reason}`
            );
          }
        );
    });
  }

  public addImage(image: UploadedImage): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      databaseConnection
        .none(
          `
                    INSERT INTO public."Images"("imageId", "imageUrl", "thumbnailUrl", "uploadedBy", "uploadedDate", status)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
          [
            image.imageId,
            image.imageUrl,
            image.thumbnailUrl,
            image.uploadedBy.username,
            image.uploadedDate.getTime(),
            image.status,
          ]
        )
        .then(
          () => {
            resolve();
          },
          (reason) => {
            reject(
              `[addImage()] Error happened while writing into database: ${reason}`
            );
          }
        );
    });
  }

  public getImage(imageId: string): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      databaseConnection
        .one(
          `
                    SELECT * FROM public."Images"
                        WHERE "Images"."imageId" = $1;
                `,
          [imageId]
        )
        .then(
          (image) => {
            userDao.findUser(image.uploadedBy).then(
              (user) => {
                regionDao.getTextRegionsOfImage(imageId).then(
                  (regions) => {
                    resolve(
                      new UploadedImage(
                        imageId,
                        image.imageUrl,
                        image.thumbnailUrl,
                        regions,
                        user,
                        new Date(+image.uploadedDate),
                        image.status as ImageStatus
                      )
                    );
                  },
                  (reason) => {
                    reject(
                      `[getImage()] Error happened while reading regions from database: ${reason}`
                    );
                  }
                );
              },
              (reason) => {
                reject(
                  `[getImage()] Error happened while finding user from database: ${reason}`
                );
              }
            );
          },
          (reason) => {
            reject(
              `[getImage()] Error happened while reading image from database: ${reason}`
            );
          }
        );
    });
  }

  public getNeighborImage(
    image: UploadedImage,
    filterOptions: ImageFilterOptions,
    isNext: boolean
  ): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      const compareWithImageClause = getCompareWithImageClause(
        image,
        filterOptions,
        isNext
      );
      const query = toOrdinal(`
      SELECT * FROM public."Images"
          ${compareWithImageClause.subquery}
          LIMIT 1;
      `);
      databaseConnection
        .oneOrNone(query, [...compareWithImageClause.parameters])
        .then(
          (image) => {
            if (!image) {
              return resolve(null);
            }
            const imageId = image.imageId;
            userDao.findUser(image.uploadedBy).then(
              (user) => {
                regionDao.getTextRegionsOfImage(imageId).then(
                  (regions) => {
                    resolve(
                      new UploadedImage(
                        imageId,
                        image.imageUrl,
                        image.thumbnailUrl,
                        regions,
                        user,
                        new Date(+image.uploadedDate),
                        image.status as ImageStatus
                      )
                    );
                  },
                  (reason) => {
                    reject(
                      `[getNextImage()] Error happened while reading regions from database: ${reason}`
                    );
                  }
                );
              },
              (reason) => {
                reject(
                  `[getNextImage()] Error happened while finding user from database: ${reason}`
                );
              }
            );
          },
          (reason) => {
            reject(
              `[getNextImage()] Error happened while reading image from database: ${reason}`
            );
          }
        );
    });
  }

  public deleteImage(imageId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      databaseConnection
        .one(
          `
                    WITH Deleted AS (
                        DELETE FROM public."Images"
                            WHERE "Images"."imageId" = $1
                        RETURNING *
                    ) SELECT COUNT(*) FROM Deleted;
                `,
          [imageId]
        )
        .then(
          (result) => {
            resolve(+result.count > 0);
          },
          (reason) => {
            reject(
              `[deleteImage()] Error happened while deleting image: ${reason}`
            );
          }
        );
    });
  }

  public setImageStatus(
    imageId: string,
    status: ImageStatus
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      databaseConnection
        .one(
          `
                    WITH Updated AS (
                        UPDATE public."Images"
                            SET status = $1
                            WHERE "Images"."imageId" = $2
                        RETURNING * 
                    ) SELECT COUNT(*) FROM Updated
                `,
          [status, imageId]
        )
        .then(
          (result) => {
            resolve(+result.count > 0);
          },
          (reason) => {
            reject(
              `[setImageStatus()] Error happened while updating image status: ${reason}`
            );
          }
        );
    });
  }
}

export default ImageDao;
