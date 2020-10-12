import { TextRegion } from 'src/app/models/text-region';
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
};

export default TextRegionDao;