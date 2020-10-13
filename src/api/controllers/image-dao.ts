import ImageStatus from 'src/app/models/image-status';
import UploadedImage from "src/app/models/uploaded-image";
import databaseConnection from './database';
import TextRegionDao from './region-dao';
import UserDao from './user-dao';

const userDao: UserDao = UserDao.getInstance();
const regionDao: TextRegionDao = TextRegionDao.getInstance();

class ImageDao {
    private constructor() { }

    public static getInstance(): ImageDao {
        return new ImageDao();
    }

    public addImage(image: UploadedImage): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            databaseConnection.none(
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
                    image.status
                ]
            ).then(() => {
                resolve();
            }, (reason) => {
                reject(`[addImage()] Error happened while writing into database: ${reason}`);
            });
        });
    }

    public getImage(imageId: string): Promise<UploadedImage> {
        return new Promise<UploadedImage>((resolve, reject) => {
            databaseConnection.one(
                `
                    SELECT * FROM public."Images"
                        WHERE "Images"."imageId" = $1;
                `,
                [imageId]
            ).then((image) => {
                userDao.findUser(image.uploadedBy).then((user) => {
                    regionDao.getTextRegions(imageId).then((regions) => {
                        resolve(new UploadedImage(
                            imageId,
                            image.imageUrl,
                            image.thumbnailUrl,
                            regions,
                            user,
                            new Date(+image.uploadedDate),
                            image.status as ImageStatus
                        ));
                    }, (reason) => {
                        reject(`[getImage()] Error happened while reading regions from database: ${reason}`);
                    });
                }, (reason) => {
                    reject(`[getImage()] Error happened while finding user from database: ${reason}`);
                });
            }, (reason) => {
                reject(`[getImage()] Error happened while reading image from database: ${reason}`);
            });
        });
    }

    public deleteImage(imageId: string, username: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            databaseConnection.one(
                `
                    WITH Deleted AS (
                        DELETE FROM public."Images"
                            WHERE "Images"."imageId" = $1
                            AND "Images"."uploadedBy" = $2
                        RETURNING *
                    ) SELECT COUNT(*) FROM Deleted;
                `, [imageId, username]
            ).then((result) => {
                resolve(+result.count > 0);
            }, (reason) => {
                reject(`[deleteImage()] Error happened while deleting image: ${reason}`);
            });
        });
    }
};

export default ImageDao;