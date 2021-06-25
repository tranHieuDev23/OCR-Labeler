import {
  getOppositeOption,
  getOrderByClause,
  ImageComparationOption,
  getFilterClauseExport,
  getOrderByClauseExport,
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

function getFilterClause(
  filteredStatuses: ImageStatus[],
  filteredUsers: string[]
): string {
  const emptyFilterStatuses: boolean =
    !filteredStatuses || filteredStatuses.length === 0;
  const emptyFilterUsers: boolean =
    !filteredUsers || filteredUsers.length === 0;
  if (emptyFilterStatuses && emptyFilterUsers) {
    return 'true';
  }
  const statusClause: string = emptyFilterStatuses
    ? ''
    : `"Images".status IN (${filteredStatuses
        .map((item) => `'${item}'`)
        .join(',')})`;
  const userClause: string = emptyFilterUsers
    ? ''
    : `"Images"."uploadedBy" IN (${filteredUsers
        .map((item) => `'${item}'`)
        .join(',')})`;
  return `${statusClause} ${
    !emptyFilterStatuses && !emptyFilterUsers ? 'AND' : ''
  } ${userClause}`;
}

function getCompareWithImageClause(
  option: ImageComparationOption,
  image: UploadedImage,
  filteredStatuses: ImageStatus[],
  filteredUsers: string[],
  isNext: boolean
): string {
  if (isNext) {
    option = getOppositeOption(option);
  }
  let bigger: string;
  let smaller: string;
  let idComparator: string;
  switch (option) {
    case ImageComparationOption.UPLOAD_LATEST_FIRST:
      bigger = `'${image.uploadedDate.getTime()}'`;
      smaller = `"Images"."uploadedDate"`;
      idComparator = '<';
      break;
    case ImageComparationOption.UPLOAD_OLDEST_FIRST:
      bigger = `"Images"."uploadedDate"`;
      smaller = `'${image.uploadedDate.getTime()}'`;
      idComparator = '>';
      break;
    case ImageComparationOption.STATUS_ASC:
      bigger = `'${image.status}'`;
      smaller = `"Images".status`;
      idComparator = '<';
      break;
    case ImageComparationOption.STATUS_DESC:
      bigger = `"Images".status`;
      smaller = `'${image.status}'`;
      idComparator = '>';
      break;
    case ImageComparationOption.USER_ASC:
      bigger = `'${image.uploadedBy.username}'`;
      smaller = `"Images"."uploadedBy"`;
      idComparator = '<';
      break;
    case ImageComparationOption.USER_DESC:
      bigger = `"Images"."uploadedBy"`;
      smaller = `'${image.uploadedBy.username}'`;
      idComparator = '>';
      break;
    default:
      return '';
  }
  return `
        WHERE (${bigger} > ${smaller}
        OR (${bigger} = ${smaller} AND '${
    image.imageId
  }' ${idComparator} "Images"."imageId"))
        AND ${getFilterClause(filteredStatuses, filteredUsers)}
        ${getOrderByClause(option)}
    `;
}

class ImageDao {
  private constructor() {}

  public static getInstance(): ImageDao {
    return new ImageDao();
  }

  public async getImagesCountExport(
    filterOptions: ImageFilterOptions
  ): Promise<number> {
    try {
      const filterClause = getFilterClauseExport(filterOptions);
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

  public getImagesCount(
    filteredStatuses: ImageStatus[],
    filteredUsers: string[]
  ): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      databaseConnection
        .one(
          `
                    SELECT COUNT(*) FROM public."Images"
                        WHERE ${getFilterClause(
                          filteredStatuses,
                          filteredUsers
                        )};
                `
        )
        .then(
          (result) => {
            resolve(+result.count);
          },
          (reason) => {
            reject(
              `[getImagesCount()] Error happened while writing into database: ${reason}`
            );
          }
        );
    });
  }

  public getImages(
    startFrom: number,
    itemCount: number,
    sortOption: ImageComparationOption,
    filteredStatuses: ImageStatus[],
    filteredUsers: string[]
  ): Promise<UploadedImage[]> {
    return new Promise<UploadedImage[]>((resolve, reject) => {
      databaseConnection
        .any(
          `
                    SELECT * FROM public."Images" JOIN public."Users" ON "Images"."uploadedBy" = "Users".username
                        WHERE ${getFilterClause(
                          filteredStatuses,
                          filteredUsers
                        )}
                        ${getOrderByClause(sortOption)}
                        OFFSET $1 LIMIT $2;
                `,
          [startFrom, itemCount]
        )
        .then(
          (results) => {
            const images: UploadedImage[] = [];
            for (let item of results) {
              const user = User.parseFromJson(item);
              images.push(
                new UploadedImage(
                  item.imageId,
                  item.imageUrl,
                  item.thumbnailUrl,
                  [],
                  user,
                  new Date(+item.uploadedDate),
                  item.status as ImageStatus
                )
              );
            }
            resolve(images);
          },
          (reason) => {
            reject(
              `[getImages()] Error happened while writing into database: ${reason}`
            );
          }
        );
    });
  }

  //  getImagesExport
  public async getImagesExport(
    startFrom: number,
    itemCount: number,
    filterOptions: ImageFilterOptions
  ) {
    try {
      const filterClause = getFilterClauseExport(filterOptions);
      const getImagesQuery = toOrdinal(`
              SELECT * FROM public."Images" JOIN public."Users" ON "Images"."uploadedBy" = "Users".username
                  WHERE ${filterClause.subquery}
                  ${getOrderByClauseExport(filterOptions.sortOption)}
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
    user: User,
    filteredStatuses: ImageStatus[]
  ): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      databaseConnection
        .one(
          `
                    SELECT COUNT(*) FROM public."Images"
                        WHERE "Images"."uploadedBy" = $1
                        ${getImageStatusFilterClause(filteredStatuses)};
                `,
          [user.username]
        )
        .then(
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
    user: User,
    startFrom: number,
    itemCount: number,
    sortOption: ImageComparationOption,
    filteredStatuses: ImageStatus[]
  ): Promise<UploadedImage[]> {
    return new Promise<UploadedImage[]>((resolve, reject) => {
      databaseConnection
        .any(
          `
                    SELECT * FROM public."Images"
                        WHERE "Images"."uploadedBy" = $1
                        ${getImageStatusFilterClause(filteredStatuses)}
                        ${getOrderByClause(sortOption)}
                        OFFSET $2 LIMIT $3;
                `,
          [user.username, startFrom, itemCount]
        )
        .then(
          (results) => {
            const images: UploadedImage[] = [];
            for (let item of results) {
              images.push(
                new UploadedImage(
                  item.imageId,
                  item.imageUrl,
                  item.thumbnailUrl,
                  [],
                  user,
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
    sortOption: ImageComparationOption,
    filteredStatuses: ImageStatus[],
    filteredUsers: string[],
    isNext: boolean
  ): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      databaseConnection
        .oneOrNone(
          `
                    SELECT * FROM public."Images"
                        ${getCompareWithImageClause(
                          sortOption,
                          image,
                          filteredStatuses,
                          filteredUsers,
                          isNext
                        )}
                        LIMIT 1;
                `
        )
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
