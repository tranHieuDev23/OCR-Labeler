import { getOrderByClause, ImageComparationOption } from 'src/app/models/image-compare-funcs';
import ImageStatus, { getImageStatusFilterClause } from 'src/app/models/image-status';
import UploadedImage from "src/app/models/uploaded-image";
import User from 'src/app/models/user';
import databaseConnection from './database';
import TextRegionDao from './region-dao';
import UserDao from './user-dao';

const userDao: UserDao = UserDao.getInstance();
const regionDao: TextRegionDao = TextRegionDao.getInstance();

function getFilterClause(filteredStatuses: ImageStatus[], filteredUsers: string[]): string {
    const emptyFilterStatuses: boolean = (!filteredStatuses || filteredStatuses.length === 0);
    const emptyFilterUsers: boolean = (!filteredUsers || filteredUsers.length === 0);
    if (emptyFilterStatuses && emptyFilterUsers) {
        return '';
    }
    const statusClause: string = emptyFilterStatuses
        ? ''
        : `"Images".status IN (${filteredStatuses.map(item => `'${item}'`).join(',')})`;
    const userClause: string = emptyFilterUsers
        ? ''
        : `"Images"."uploadedBy" IN (${filteredUsers.map(item => `'${item}'`).join(',')})`;
    return `WHERE ${statusClause} ${(!emptyFilterStatuses && !emptyFilterUsers) ? 'AND' : ''} ${userClause}`;
}

class ImageDao {
    private constructor() { }

    public static getInstance(): ImageDao {
        return new ImageDao();
    }

    public getImagesCount(filteredStatuses: ImageStatus[], filteredUsers: string[]): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            databaseConnection.one(
                `
                    SELECT COUNT(*) FROM public."Images"
                        ${getFilterClause(filteredStatuses, filteredUsers)};
                `,
            ).then((result) => {
                resolve(+result.count);
            }, (reason) => {
                reject(`[getImagesCount()] Error happened while writing into database: ${reason}`);
            });
        });
    }

    public getImages(startFrom: number, itemCount: number, sortOption: ImageComparationOption, filteredStatuses: ImageStatus[], filteredUsers: string[]): Promise<UploadedImage[]> {
        return new Promise<UploadedImage[]>((resolve, reject) => {
            databaseConnection.any(
                `
                    SELECT * FROM public."Images" JOIN public."Users" ON "Images"."uploadedBy" = "Users".username
                        ${getFilterClause(filteredStatuses, filteredUsers)}
                        ${getOrderByClause(sortOption)}
                        OFFSET $1 LIMIT $2;
                `,
                [startFrom, itemCount]
            ).then((results) => {
                const images: UploadedImage[] = [];
                for (let item of results) {
                    const user = User.parseFromJson(item);
                    images.push(new UploadedImage(
                        item.imageId,
                        item.imageUrl,
                        item.thumbnailUrl,
                        [],
                        user,
                        new Date(+item.uploadedDate),
                        item.status as ImageStatus
                    ));
                }
                resolve(images);
            }, (reason) => {
                reject(`[getImages()] Error happened while writing into database: ${reason}`);
            });
        });
    }

    public getUserImagesCount(user: User, filteredStatuses: ImageStatus[]): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            databaseConnection.one(
                `
                    SELECT COUNT(*) FROM public."Images"
                        WHERE "Images"."uploadedBy" = $1
                        ${getImageStatusFilterClause(filteredStatuses)};
                `,
                [user.username]
            ).then((result) => {
                resolve(+result.count);
            }, (reason) => {
                reject(`[getUserImagesCount()] Error happened while writing into database: ${reason}`);
            });
        });
    }

    public getUserImages(user: User, startFrom: number, itemCount: number, sortOption: ImageComparationOption, filteredStatuses: ImageStatus[]): Promise<UploadedImage[]> {
        return new Promise<UploadedImage[]>((resolve, reject) => {
            databaseConnection.any(
                `
                    SELECT * FROM public."Images"
                        WHERE "Images"."uploadedBy" = $1
                        ${getImageStatusFilterClause(filteredStatuses)}
                        ${getOrderByClause(sortOption)}
                        OFFSET $2 LIMIT $3;
                `,
                [user.username, startFrom, itemCount]
            ).then((results) => {
                const images: UploadedImage[] = [];
                for (let item of results) {
                    images.push(new UploadedImage(
                        item.imageId,
                        item.imageUrl,
                        item.thumbnailUrl,
                        [],
                        user,
                        new Date(+item.uploadedDate),
                        item.status as ImageStatus
                    ));
                }
                resolve(images);
            }, (reason) => {
                reject(`[getUserImages()] Error happened while writing into database: ${reason}`);
            });
        });
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
                    regionDao.getTextRegionsOfImage(imageId).then((regions) => {
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

    public deleteImage(imageId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            databaseConnection.one(
                `
                    WITH Deleted AS (
                        DELETE FROM public."Images"
                            WHERE "Images"."imageId" = $1
                        RETURNING *
                    ) SELECT COUNT(*) FROM Deleted;
                `, [imageId]
            ).then((result) => {
                resolve(+result.count > 0);
            }, (reason) => {
                reject(`[deleteImage()] Error happened while deleting image: ${reason}`);
            });
        });
    }

    public setImageStatus(imageId: string, status: ImageStatus): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            databaseConnection.one(
                `
                    WITH Updated AS (
                        UPDATE public."Images"
                            SET status = $1
                            WHERE "Images"."imageId" = $2
                        RETURNING * 
                    ) SELECT COUNT(*) FROM Updated
                `, [status, imageId]
            ).then((result) => {
                resolve(+result.count > 0);
            }, (reason) => {
                reject(`[setImageStatus()] Error happened while updating image status: ${reason}`);
            })
        });
    }
};

export default ImageDao;