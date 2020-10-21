import * as dotenv from 'dotenv';
dotenv.config();

import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ImageStatus from 'src/app/models/image-status';
import LabelStatus from 'src/app/models/label-status';
import { Region, TextRegion } from 'src/app/models/text-region';
import UploadedImage from 'src/app/models/uploaded-image';
import { AUTH_COOKIE_NAME } from 'src/environments/constants';
import uid from 'uid';
import ImageDao from '../controllers/image-dao';
import BlacklistedJwtDao from '../controllers/jwt-dao';
import TextRegionDao from '../controllers/region-dao';
import * as fs from 'fs';
import { join } from 'path';

const imageRouter: Router = Router();

const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();
const imageDao: ImageDao = ImageDao.getInstance();
const regionDao: TextRegionDao = TextRegionDao.getInstance();
const uploadedFolder = process.env.UPLOADED_DIRECTORY;
const thumbnailFolder = process.env.THUMBNAIL_DIRECTORY;

imageRouter.post('/get-user-images', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canUpload) {
            console.log(`[/get-user-images] User ${user.username} is not authorized to upload image!`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        const startFrom: number = request.body.startFrom;
        const itemCount: number = request.body.itemCount;
        imageDao.getUserImagesCount(user).then((imagesCount) => {
            if (imagesCount <= startFrom) {
                console.log(
                    `[/get-user-images] User ${user.username} is trying to access more image than allowed: startFrom=${startFrom}, imagesCount=${imagesCount}`
                );
                return response.status(StatusCodes.BAD_REQUEST).json({});
            }
            imageDao.getUserImages(user, startFrom, itemCount).then((images) => {
                return response.json({
                    imagesCount, images
                });
            }, (reason) => {
                console.log(`[/get-user-images] Problem when retrieving image: ${reason}`);
                return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
            });
        })
    }, (reason) => {
        console.log(`[/get-user-images] Problem when authorizing user to retrieve image: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

imageRouter.post('/get-image', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canUpload) {
            console.log(`[/get-image] User ${user.username} is not authorized to upload image!`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        const imageId: string = request.body.imageId;
        imageDao.getImage(imageId).then((image) => {
            if (image.uploadedBy.username != user.username) {
                console.log(`[/get-image] User ${user.username} is trying to access other's images!`);
                return response.status(StatusCodes.UNAUTHORIZED).json({});
            }
            return response.json(image);
        }, (reason) => {
            console.log(`[/get-image] Problem when retrieving image: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
        })
    }, (reason) => {
        console.log(`[/get-image] Problem when authorizing user to retrieve image: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

imageRouter.post('/add-region', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canUpload) {
            console.log(`[/add-region] User ${user.username} is not authorized to upload image!`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
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
            null
        );
        regionDao.addTextRegions([textRegion]).then(() => {
            response.json(textRegion);
        }, (reason) => {
            console.log(`[/add-region] Problem when storing new image region: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
        });
    }, (reason) => {
        console.log(`[/add-region] Problem when authorizing user to retrieve image: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

imageRouter.post('/publish-image', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canUpload) {
            console.log(`[/publish-image] User ${user.username} is not authorized to upload image!`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        const imageId: string = request.body.imageId;
        imageDao.setImageStatus(imageId, user, ImageStatus.Published).then((success) => {
            return response.status(success ? StatusCodes.OK : StatusCodes.UNAUTHORIZED).json({});
        }, (reason) => {
            console.log(`[/add-region] Problem when updating image's status: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
        })
    });
});

imageRouter.post('/delete-region', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canUpload) {
            console.log(`[/delete-region] User ${user.username} is not authorized to upload image!`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        const regionId: string = request.body.regionId;
        regionDao.deleteTextRegion(regionId, user.username).then((success) => {
            return response.status(success ? StatusCodes.OK : StatusCodes.UNAUTHORIZED).json({});
        }, (reason) => {
            console.log(`[/delete-region] Problem when storing new image region: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
        });
    }, (reason) => {
        console.log(`[/delete-region] Problem when authorizing user to retrieve image: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
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

imageRouter.post('/delete-image', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canUpload) {
            console.log(`[/delete-image] User ${user.username} is not authorized to upload image!`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        const imageId: string = request.body.imageId;
        imageDao.getImage(imageId).then((image: UploadedImage) => {
            if (image.uploadedBy.username !== user.username) {
                console.log(`[/delete-image] User ${user.username} is trying to delete unauthorized image`);
                return response.status(StatusCodes.UNAUTHORIZED).json({});
            }
            imageDao.deleteImage(imageId).then((success) => {
                if (!success) {
                    console.log(`[/delete-image] Image ${image.imageId} has already been deleted`);
                    return response.status(StatusCodes.BAD_REQUEST).json({});
                }
                Promise.all([
                    deleteImage(join(uploadedFolder, image.imageUrl)),
                    deleteImage(join(thumbnailFolder, image.thumbnailUrl))
                ]).then(() => {
                    return response.status(StatusCodes.OK).json({});
                }, (reason) => {
                    console.log(`[/delete-image] Problem when deleting image file: ${reason}`);
                    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
                })
            }, (reason) => {
                console.log(`[/delete-image] Problem when deleting image from database: ${reason}`);
                return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
            });
        }, (reason) => {
            console.log(`[/delete-image] Problem when retrieving image: ${reason}`);
            return response.status(StatusCodes.BAD_REQUEST).json({});
        });
    }, (reason) => {
        console.log(`[/delete-image] Problem when authorizing user to retrieve image: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

export default imageRouter;