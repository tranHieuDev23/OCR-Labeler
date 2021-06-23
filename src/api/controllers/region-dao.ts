import LabelStatus from 'src/app/models/label-status';
import { Region, TextRegion } from 'src/app/models/text-region';
import User from 'src/app/models/user';
import databaseConnection, { pgp } from './database';

class TextRegionDao {
  private constructor() {}

  public static getInstance(): TextRegionDao {
    return new TextRegionDao();
  }

  public getTextRegionFast(regiondId: string): Promise<TextRegion> {
    return new Promise<TextRegion>((resolve, reject) => {
      databaseConnection
        .oneOrNone(
          `
                    SELECT * FROM public."TextRegions" 
                        WHERE "TextRegions"."regionId" = $1;
                `,
          [regiondId]
        )
        .then(
          (result) => {
            if (!result) {
              return resolve(null);
            }
            const region: TextRegion = new TextRegion(
              result.regionId,
              result.imageId,
              Region.parseFromPostgresPolygonString(result.region),
              result.label,
              result.status as LabelStatus,
              User.newBaseUser(result.uploadedBy, result.uploadedBy),
              result.labeledBy
                ? User.newBaseUser(result.labeledBy, result.labeledBy)
                : null,
              result.verifiedBy
                ? User.newBaseUser(result.verifiedBy, result.verifiedBy)
                : null,
              result.suggestion
            );
            resolve(region);
          },
          (reason) => {
            reject(
              `[getTextRegion()] Error happened while reading regions from database: ${reason}`
            );
          }
        );
    });
  }

  public addTextRegions(regions: TextRegion[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!regions || regions.length == 0) {
        resolve();
        return;
      }
      const cs = new pgp.helpers.ColumnSet(
        [
          'regionId',
          'imageId',
          'region',
          'label',
          'status',
          'uploadedBy',
          'labeledBy',
          'verifiedBy',
          'suggestion',
        ],
        { table: 'TextRegions' }
      );
      const query = pgp.helpers.insert(
        regions.map((item) => {
          return {
            regionId: item.regionId,
            imageId: item.imageId,
            region: item.region.getPostgresPolygonString(),
            label: item.label,
            status: item.status,
            uploadedBy: item.uploadedBy.username,
            labeledBy: item.labeledBy !== null ? item.labeledBy.username : null,
            verifiedBy:
              item.verifiedBy !== null ? item.verifiedBy.username : null,
            suggestion: item.suggestion,
          };
        }),
        cs
      );
      databaseConnection.none(query).then(
        () => {
          resolve();
        },
        (reason) => {
          reject(
            `[addTextRegions()] Error happened while adding TextRegion: ${reason}`
          );
        }
      );
    });
  }

  public getTextRegionsOfImage(imageId: string): Promise<TextRegion[]> {
    return new Promise<TextRegion[]>((resolve, reject) => {
      databaseConnection
        .any(
          `
                    SELECT
                        "TextRegions"."regionId", "TextRegions"."region", "TextRegions"."label", "TextRegions"."status",
                        "Uploader".username as "uploaderUsername", "Uploader"."displayName" as "uploaderDisplayName",
                        "Labeler".username as "labelerUsername", "Labeler"."displayName" as "labelerDisplayName",
                        "Verifier".username as "verifierUsername", "Verifier"."displayName" as "verifierDisplayName"
                        FROM public."TextRegions" 
                        INNER JOIN public."Users" AS "Uploader"
                            ON "TextRegions"."uploadedBy" = "Uploader".username
                        LEFT JOIN public."Users" as "Labeler"
                            ON "TextRegions"."labeledBy" = "Labeler".username
                        LEFT JOIN public."Users" as "Verifier"
                            ON "TextRegions"."verifiedBy" = "Verifier".username
                        WHERE "TextRegions"."imageId" = $1;
                `,
          [imageId]
        )
        .then(
          (regions) => {
            const results: TextRegion[] = [];
            for (let item of regions) {
              results.push(
                new TextRegion(
                  item.regionId,
                  imageId,
                  Region.parseFromPostgresPolygonString(item.region),
                  item.label,
                  item.status as LabelStatus,
                  User.newBaseUser(
                    item.uploaderDisplayName,
                    item.uploaderUsername
                  ),
                  item.labelerDisplayName
                    ? User.newBaseUser(
                        item.labelerDisplayName,
                        item.labelerUsername
                      )
                    : null,
                  item.verifierDisplayName
                    ? User.newBaseUser(
                        item.verifierDisplayName,
                        item.verifierUsername
                      )
                    : null,
                  item.suggestion
                )
              );
            }
            resolve(results);
          },
          (reason) => {
            reject(
              `[getTextRegions()] Error happened while reading regions from database: ${reason}`
            );
          }
        );
    });
  }

  public deleteTextRegion(regionId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      databaseConnection
        .one(
          `
                    WITH Deleted AS (
                        DELETE FROM public."TextRegions" WHERE "regionId" = $1 RETURNING *
                    ) SELECT COUNT(*) FROM Deleted;
                `,
          [regionId]
        )
        .then(
          (result) => {
            resolve(+result.count === 1);
          },
          (reason) => {
            reject(
              `[deleteTextRegion()] Error happened while deleting region: ${reason}`
            );
          }
        );
    });
  }

  public getRandomTextRegion(
    user: User,
    status: LabelStatus,
    sameUser: boolean
  ): Promise<{ imageUrl: string; region: TextRegion }> {
    return new Promise<{ imageUrl: string; region: TextRegion }>(
      (resolve, reject) => {
        databaseConnection
          .oneOrNone(
            `
                    WITH ValidItems AS (
                        SELECT "TextRegions".*, "Images"."imageUrl"
                            FROM public."TextRegions"
                            FULL JOIN public."Images" ON "TextRegions"."imageId" = "Images"."imageId"
                            WHERE "TextRegions"."labeledBy" IS DISTINCT FROM $1
                            AND "TextRegions"."verifiedBy" IS DISTINCT FROM $1
                            AND "TextRegions".status = $2
                            AND "Images".status = 'Published'
                            ${
                              sameUser
                                ? `AND "TextRegions"."uploadedBy" = $1`
                                : ''
                            }
                            LIMIT 1000
                    ) SELECT * FROM ValidItems OFFSET floor(random() * (SELECT COUNT(*) FROM validItems))
                        LIMIT 1;
                `,
            [user.username, status]
          )
          .then(
            (textRegion) => {
              if (!textRegion) {
                resolve(null);
                return;
              }
              const imageUrl = textRegion.imageUrl;
              const region = TextRegion.parseFromPostgresResult(textRegion);
              resolve({ imageUrl, region });
            },
            (reason) => {
              reject(
                `[getRandomTextRegion()] Error happened while getting random text region: ${reason}`
              );
            }
          );
      }
    );
  }

  public getTextRegionsCount(
    user: User,
    status: LabelStatus,
    sameUser: boolean
  ): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      databaseConnection
        .one(
          `
                        SELECT COUNT(*)
                            FROM public."TextRegions"
                            FULL JOIN public."Images" ON "TextRegions"."imageId" = "Images"."imageId"
                            WHERE "TextRegions"."labeledBy" = $1
                            AND "TextRegions".status = $2
                            AND "TextRegions"."viewedInReview" = false 
                            AND "Images".status = 'Published'
                            ${
                              sameUser
                                ? `AND "TextRegions"."uploadedBy" = $1`
                                : ''
                            }
                            LIMIT 1000  
                `,
          [user.username, status]
        )
        .then(
          (result) => {
            resolve(+result.count);
          },
          (reason) => {
            reject(
              `[getTextRegionsCount()] Error happened while writing into database: ${reason}`
            );
          }
        );
    });
  }

  public getListTextRegions(
    user: User,
    status: LabelStatus,
    startFrom: number,
    itemCount: number,
    sameUser: boolean
  ): Promise<{ imageUrl: string; region: TextRegion }[]> {
    return new Promise<{ imageUrl: string; region: TextRegion }[]>(
      (resolve, reject) => {
        databaseConnection
          .any(
            `
                    WITH ValidItems AS (
                        SELECT "TextRegions".*, "Images"."imageUrl"
                            FROM public."TextRegions"
                            FULL JOIN public."Images" ON "TextRegions"."imageId" = "Images"."imageId"
                            WHERE "TextRegions"."labeledBy" = $1
                            AND "TextRegions".status = $2
                            AND "TextRegions"."viewedInReview" = false 
                            AND "Images".status = 'Published'
                            ${
                              sameUser
                                ? `AND "TextRegions"."uploadedBy" = $1`
                                : ''
                            }
                            LIMIT 1000
                    ) SELECT * FROM ValidItems OFFSET $3 LIMIT $4;
                `,
            [user.username, status, startFrom, itemCount]
          )
          .then(
            (results) => {
              if (!results.length) {
                resolve(null);
                return;
              }
              const items: { imageUrl: string; region: TextRegion }[] = [];
              for (let item of results) {
                items.push({
                  imageUrl: item.imageUrl,
                  region: TextRegion.parseFromPostgresResult(item),
                });
              }
              resolve(items);
            },
            (reason) => {
              reject(
                `[getListTextRegions()] Error happened while getting random text region: ${reason}`
              );
            }
          );
      }
    );
  }

  public labelTextRegion(
    user: User,
    regionId: string,
    label: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      databaseConnection
        .one(
          `
                    WITH Updated AS (
                        UPDATE public."TextRegions"
                            SET label = $1, status= $2, "labeledBy"=$3
                            WHERE "regionId" = $4
                            AND "status" = 'NotLabeled'
                            RETURNING *
                    ) SELECT COUNT(*) FROM Updated;
                `,
          [label, LabelStatus.NotVerified, user.username, regionId]
        )
        .then((result) => {
          resolve(+result.count > 0);
        }, reject);
    });
  }

  public setRegionCantLabeled(
    user: User,
    regionId: string,
    status: LabelStatus
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      databaseConnection
        .one(
          `
                    WITH Updated AS (
                        UPDATE public."TextRegions"
                            SET label = NULL, status = $1, "labeledBy" = $2
                            WHERE "regionId" = $3
                            AND "status" = 'NotLabeled'
                            RETURNING *
                    ) SELECT COUNT(*) FROM Updated;
                `,
          [status, user.username, regionId]
        )
        .then((result) => {
          resolve(+result.count > 0);
        }, reject);
    });
  }

  public verifyTextRegion(
    user: User,
    regionId: string,
    isCorrect: boolean
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const isCorrectQuery: string = `
                WITH Updated AS (
                    UPDATE public."TextRegions"
                        SET status= 'Verified', "verifiedBy" = $1
                        WHERE "regionId" = $2
                        AND "labeledBy" != $1
                        AND "status" = 'NotVerified'
                        RETURNING *
                ) SELECT COUNT(*) FROM Updated;
            `;
      const isIncorrectQuery: string = `
                WITH Updated AS (
                    UPDATE public."TextRegions"
                        SET label = NULL, status= 'NotLabeled', "verifiedBy" = $1
                        WHERE "regionId" = $2
                        AND "labeledBy" != $1
                        AND "status" = 'NotVerified'
                        RETURNING *
                ) SELECT COUNT(*) FROM Updated;
            `;
      const action: Promise<any> = databaseConnection.one(
        isCorrect ? isCorrectQuery : isIncorrectQuery,
        [user.username, regionId]
      );
      action.then((result) => {
        resolve(+result.count > 0);
      }, reject);
    });
  }

  public reviewTextRegion(
    user: User,
    regionId: string,
    isHidden: boolean,
    label: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const isCorrectQuery: string = `
                WITH Updated AS (
                    UPDATE public."TextRegions"
                        SET ("viewedInReview","label") = ($4,$3)
                        WHERE "regionId" = $2
                        AND "labeledBy" = $1
                        AND "status" = 'NotVerified'
                        RETURNING *
                ) SELECT COUNT(*) FROM Updated;
            `;
      const action: Promise<any> = databaseConnection.one(isCorrectQuery, [
        user.username,
        regionId,
        label,
        isHidden,
      ]);
      action.then((result) => {
        resolve(+result.count > 0);
      }, reject);
    });
  }
}

export default TextRegionDao;
