import LabelStatus from 'src/app/models/label-status';
import { Region, TextRegion } from 'src/app/models/text-region';
import User from 'src/app/models/user';
import databaseConnection, { pgp } from './database';

class TextRegionDao {
    private constructor() { }

    public static getInstance(): TextRegionDao {
        return new TextRegionDao();
    }

    public addTextRegions(regions: TextRegion[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const cs = new pgp.helpers.ColumnSet([
                'regionId',
                'imageId',
                'region',
                'label',
                'status',
                'uploadedBy',
                'labeledBy',
                'verifiedBy'
            ], { table: 'TextRegions' });
            const query = pgp.helpers.insert(regions.map(item => {
                return {
                    regionId: item.regionId,
                    imageId: item.imageId,
                    region: item.region.getPostgresPolygonString(),
                    label: item.label,
                    status: item.status,
                    uploadedBy: item.uploadedBy.username,
                    labeledBy: item.labeledBy !== null ? item.labeledBy.username : null,
                    verifiedBy: item.verifiedBy !== null ? item.verifiedBy.username : null
                };
            }), cs);
            databaseConnection.none(query).then(() => {
                resolve();
            }, (reason) => {
                reject(`[addTextRegions()] Error happened while adding TextRegion: ${reason}`);
            });
        });
    }

    public getTextRegions(imageId: string): Promise<TextRegion[]> {
        return new Promise<TextRegion[]>((resolve, reject) => {
            databaseConnection.any(
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
            ).then((regions) => {
                const results: TextRegion[] = [];
                for (let item of regions) {
                    results.push(
                        new TextRegion(
                            item.regionId,
                            imageId,
                            Region.parseFromPostgresPolygonString(item.region),
                            item.label,
                            item.status as LabelStatus,
                            User.newBaseUser(item.uploaderDisplayName, item.uploaderUsername),
                            item.labelerDisplayName ? User.newBaseUser(item.labelerDisplayName, item.labelerUsername) : null,
                            item.verifierDisplayName ? User.newBaseUser(item.verifierDisplayName, item.verifierUsername) : null
                        )
                    );
                }
                resolve(results);
            }, (reason) => {
                reject(`[getTextRegions()] Error happened while reading regions from database: ${reason}`);
            });
        });
    }
};

export default TextRegionDao;