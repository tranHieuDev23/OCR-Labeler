import * as dotenv from 'dotenv';
dotenv.config();

import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ImageStatus from 'src/app/models/image-status';
import LabelStatus from 'src/app/models/label-status';
import { Region, TextRegion } from 'src/app/models/text-region';
import UploadedImage from 'src/app/models/uploaded-image';
import uid from 'uid';
import ImageDao from '../controllers/image-dao';
import TextRegionDao from '../controllers/region-dao';
import * as fs from 'fs';
import { join } from 'path';
import { ImageComparationOption } from 'src/app/models/image-compare-funcs';
import { jwtMiddlewareFactory } from './jwt-middleware';
import User from 'src/app/models/user';

const imageRouter: Router = Router();

const imageDao: ImageDao = ImageDao.getInstance();
const regionDao: TextRegionDao = TextRegionDao.getInstance();
const uploadedFolder = process.env.UPLOADED_DIRECTORY;
const thumbnailFolder = process.env.THUMBNAIL_DIRECTORY;

const uploadJwtMiddleware: Router = jwtMiddlewareFactory((user) => user.canUpload || user.canManageAllImage);
const canManageAllImageJwtMiddleware: Router = jwtMiddlewareFactory((user) => user.canManageAllImage);

imageRouter.post('/get-user-images', uploadJwtMiddleware, (request, response) => {
    const user: User = response.locals.user;
    let startFrom: number = request.body.startFrom;
    const itemCount: number = request.body.itemCount;
    const sortOption: ImageComparationOption = request.body.sortOption;
    const filteredStatuses: ImageStatus[] = request.body.filteredStatuses;
    let pageId: number = (startFrom / itemCount) + 1;
    imageDao.getUserImagesCount(user, filteredStatuses).then((imagesCount) => {
        if (imagesCount <= startFrom) {
            console.log(
                `[/get-user-images] User ${user.username} is trying to access more image than allowed: startFrom=${startFrom}, imagesCount=${imagesCount}. Reset to page one.`
            );
            startFrom = 0;
            pageId = 1;
        }
        imageDao.getUserImages(user, startFrom, itemCount, sortOption, filteredStatuses).then((images) => {
            return response.json({
                imagesCount, images, pageId
            });
        }, (reason) => {
            console.log(`[/get-user-images] Problem when retrieving image: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        });
    });
});

imageRouter.post('/get-all-user-images', canManageAllImageJwtMiddleware, (request, response) => {
    const user: User = response.locals.user;
    let startFrom: number = request.body.startFrom;
    const itemCount: number = request.body.itemCount;
    const sortOption: ImageComparationOption = request.body.sortOption;
    const filteredStatuses: ImageStatus[] = request.body.filteredStatuses;
    const filteredUsers: string[] = request.body.filteredUsers;
    let pageId: number = (startFrom / itemCount) + 1;
    imageDao.getImagesCount(filteredStatuses, filteredUsers).then((imagesCount) => {
        if (imagesCount <= startFrom) {
            console.log(
                `[/get-all-user-images] User ${user.username} is trying to access more image than allowed: startFrom=${startFrom}, imagesCount=${imagesCount}. Reset to page one.`
            );
            startFrom = 0;
            pageId = 1;
        }
        imageDao.getImages(startFrom, itemCount, sortOption, filteredStatuses, filteredUsers).then((images) => {
            return response.json({
                imagesCount, images, pageId
            });
        }, (reason) => {
            console.log(`[/get-all-user-images] Problem when retrieving image: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        });
    });
});

imageRouter.post('/get-image', uploadJwtMiddleware, (request, response) => {
    const user: User = response.locals.user;
    const imageId: string = request.body.imageId;
    imageDao.getImage(imageId).then((image) => {
        if (image.uploadedBy.username !== user.username && !user.canManageAllImage) {
            console.log(`[/get-image] User ${user.username} is trying to access other's images!`);
            return response.status(StatusCodes.UNAUTHORIZED).json({ error: 'Trying to access other\'s images' });
        }
        return response.json(image);
    }, (reason) => {
        console.log(`[/get-image] Problem when retrieving image: ${reason}`);
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    });
});

imageRouter.post('/get-neighbor-image', uploadJwtMiddleware, (request, response) => {
    const user: User = response.locals.user;
    const imageId: string = request.body.imageId;
    const sortOption: ImageComparationOption = request.body.sortOption;
    const filteredStatuses: ImageStatus[] = request.body.filteredStatuses;
    const filteredUsers: string[] = request.body.filteredUsers;
    if (filteredUsers.length === 0) {
        filteredUsers.push(user.username);
    }
    const isNext: boolean = request.body.isNext;
    imageDao.getImage(imageId).then((image) => {
        if (image.uploadedBy.username !== user.username && !user.canManageAllImage) {
            console.log(`[/get-neighbor-image] User ${user.username} is trying to access other's images!`);
            return response.status(StatusCodes.UNAUTHORIZED).json({ error: 'Trying to access other\'s images' });
        }
        imageDao.getNeighborImage(image, sortOption, filteredStatuses, filteredUsers, isNext).then((nextImage) => {
            if (!nextImage) {
                return response.status(StatusCodes.BAD_REQUEST).json({ error: 'No next image' });
            }
            if (nextImage.uploadedBy.username !== user.username && !user.canManageAllImage) {
                console.log(`[/get-neighbor-image] User ${user.username} is trying to access other's images!`);
                return response.status(StatusCodes.UNAUTHORIZED).json({ error: 'Trying to access other\'s images' });
            }
            return response.json(nextImage);
        }, (reason) => {
            console.log(`[/get-neighbor-image] Problem when retrieving image: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        });
    }, (reason) => {
        console.log(`[/get-neighbor-image] Problem when retrieving image: ${reason}`);
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    });
});

imageRouter.post('/add-region', uploadJwtMiddleware, (request, response) => {
    const user: User = response.locals.user;
    const imageId: string = request.body.imageId;
    const region: Region = Region.parseFromJson(request.body.region);
    const textRegion: TextRegion = new TextRegion(
        uid(34),
        imageId,
        region,
        null,
        LabelStatus.NotLabeled,
        user,
        null,
        null,
        null
    );
    imageDao.getImage(imageId).then((image) => {
        if (image.uploadedBy.username !== user.username && !user.canManageAllImage) {
            console.log(`[/add-region] User ${user.username} is trying to add region to other's images!`);
            return response.status(StatusCodes.UNAUTHORIZED).json({ error: 'Trying to add region to other\'s images!' });
        }
        const actions: Promise<any>[] = [regionDao.addTextRegions([textRegion])];
        if (image.status === ImageStatus.Published) {
            actions.push(imageDao.setImageStatus(image.imageId, ImageStatus.PrePublished));
        }
        Promise.all(actions).then(() => {
            response.json(textRegion);
        }, (reason) => {
            console.log(`[/add-region] Problem when storing new image region: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        });
    }, (reason) => {
        console.log(`[/add-region] Problem when retrieving image: ${reason}`);
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    });
});

imageRouter.post('/publish-image', uploadJwtMiddleware, (request, response) => {
    const user: User = response.locals.user;
    const imageId: string = request.body.imageId;
    imageDao.getImage(imageId).then((image) => {
        if (image.uploadedBy.username !== user.username && !user.canManageAllImage) {
            console.log(`[/get-image] User ${user.username} is trying to publish other's images!`);
            return response.status(StatusCodes.UNAUTHORIZED).json({ error: 'Trying to publish other\'s images' });
        }
        imageDao.setImageStatus(imageId, ImageStatus.PrePublished).then((success) => {
            return response.status(success ? StatusCodes.OK : StatusCodes.UNAUTHORIZED).json({});
        }, (reason) => {
            console.log(`[/publish-image] Problem when updating image's status: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        });
    }, (reason) => {
        console.log(`[/publish-image] Problem when retrieve image: ${reason}`);
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    });
});

imageRouter.post('/delete-region', uploadJwtMiddleware, (request, response) => {
    const user: User = response.locals.user;
    const regionId: string = request.body.regionId;
    regionDao.getTextRegionFast(regionId).then((region) => {
        if (region.uploadedBy.username !== user.username && !user.canManageAllImage) {
            console.log(`[/delete-region] User ${user.username} is trying to delete region of another's image!`);
            return response.status(StatusCodes.UNAUTHORIZED).json({ error: 'Trying to delete region of another\'s image' });
        }
        regionDao.deleteTextRegion(regionId).then((success) => {
            return response.status(success ? StatusCodes.OK : StatusCodes.UNAUTHORIZED).json({});
        }, (reason) => {
            console.log(`[/delete-region] Problem when storing new image region: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        });
    }, (reason) => {
        console.log(`[/delete-region] Problem when retrieve image: ${reason}`);
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    });
});

function deleteImage(filename: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.unlink(filename, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    });
}

imageRouter.post('/delete-image', uploadJwtMiddleware, (request, response) => {
    const user: User = response.locals.user;
    const imageId: string = request.body.imageId;
    imageDao.getImage(imageId).then((image: UploadedImage) => {
        if (image.uploadedBy.username !== user.username && !user.canManageAllImage) {
            console.log(`[/delete-image] User ${user.username} is trying to delete unauthorized image!`);
            return response.status(StatusCodes.UNAUTHORIZED).json({ error: 'Trying to delete unauthorized image' });
        }
        imageDao.deleteImage(imageId).then((success) => {
            if (!success) {
                console.log(`[/delete-image] Image ${image.imageId} has already been deleted`);
                return response.status(StatusCodes.BAD_REQUEST).json({ error: 'Image has already been deleted' });
            }
            Promise.all([
                deleteImage(join(uploadedFolder, image.imageUrl)),
                deleteImage(join(thumbnailFolder, image.thumbnailUrl))
            ]).then(() => {
                return response.status(StatusCodes.OK).json({});
            }, (reason) => {
                console.log(`[/delete-image] Problem when deleting image file: ${reason}`);
                return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
            })
        }, (reason) => {
            console.log(`[/delete-image] Problem when deleting image from database: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        });
    }, (reason) => {
        console.log(`[/delete-image] Problem when retrieving image: ${reason}`);
        return response.status(StatusCodes.BAD_REQUEST).json({ error: 'Can find the required image' });
    });
});

export default imageRouter;