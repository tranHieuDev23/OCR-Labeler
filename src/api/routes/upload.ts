import * as dotenv from 'dotenv';
dotenv.config();

import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as path from 'path';
import * as fs from 'fs';
import { AUTH_COOKIE_NAME } from 'src/environments/constants';
import uid from 'uid';
import { resizeImage } from '../controllers/image-resize';
import BlacklistedJwtDao from '../controllers/jwt-dao';
import UploadedImage from 'src/app/models/uploaded-image';
import User from 'src/app/models/user';
import ImageStatus from 'src/app/models/image-status';
import ImageDao from '../controllers/image-dao';
import { processImageWithCraft } from '../controllers/craft';
import TextRegionDao from '../controllers/region-dao';
import * as multer from 'multer';
import { jwtMiddlewareFactory } from './jwt-middleware';

const uploadRouter: Router = Router();
const FULL_HD_WIDTH = 1920;
const FULL_HD_HEIGHT = 1080;
const THUMBNAIL_WIDTH = 320;
const THUMBNAIL_HEIGHT = 180;

const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();
const imageDao: ImageDao = ImageDao.getInstance();
const regionDao: TextRegionDao = TextRegionDao.getInstance();
const uploadDirectory = process.env.UPLOADED_DIRECTORY;
const thumbnailDirectory = process.env.THUMBNAIL_DIRECTORY;

function generateImageAndThumbnail(image: any): Promise<{ fullImage: Buffer, thumbnail: Buffer }> {
    return new Promise<{ fullImage: Buffer, thumbnail: Buffer }>((resolve, reject) => {
        resizeImage(image, FULL_HD_WIDTH, FULL_HD_HEIGHT).then((fullImage) => {
            resizeImage(fullImage, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT).then((thumbnail) => {
                resolve({ fullImage, thumbnail });
            }, reject);
        }, reject);
    });
}

function saveImageAndThumbnail(
    imageFileName: string,
    fullImage: Buffer,
    thumbnailName: string,
    thumbnail: Buffer
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(path.join(uploadDirectory, imageFileName), fullImage, (reason) => {
            if (reason) {
                reject(reason);
            }
            fs.writeFile(path.join(thumbnailDirectory, thumbnailName), thumbnail, (reason) => {
                if (reason) {
                    reject(reason);
                }
                resolve();
            });
        });
    });
}

function processPostUpload(imageId: string, user: User, image: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        processImageWithCraft(imageId, user, image).then((regions) => {
            regionDao.addTextRegions(regions).then(() => {
                resolve();
            }, reject);
        }, reject);
    });
}

const FIVE_MEGABYTE = 5 << 20;

const multerMiddleware = multer({
    limits: {
        files: 1,
        fileSize: FIVE_MEGABYTE
    },
    fileFilter: (request, file, callback) => {
        callback(null, file.mimetype.startsWith('image/'));
    }
}).any();

const uploadJwtMiddleware: Router = jwtMiddlewareFactory(user => user.canUpload);

uploadRouter.post('/upload', uploadJwtMiddleware, multerMiddleware, async (request, response) => {
    const user: User = response.locals.user;
    if (request.files.length === 0 || !request.files[0].buffer) {
        console.log(`[/upload] User ${user.username} is trying to upload unsupported file!`);
        return response.status(StatusCodes.BAD_REQUEST).json({ error: 'Trying to upload unsupported file' });
    }
    generateImageAndThumbnail(request.files[0].buffer).then(({ fullImage, thumbnail }) => {
        const imageFileName: string = uid(33) + '.jpeg';
        const thumbnailName: string = uid(34) + '.jpeg';
        saveImageAndThumbnail(imageFileName, fullImage, thumbnailName, thumbnail).then(() => {
            const imageId: string = uid(32);
            const newImage: UploadedImage = new UploadedImage(
                imageId,
                `/${imageFileName}`,
                `/${thumbnailName}`,
                [],
                user,
                new Date(),
                ImageStatus.Uploaded
            );
            imageDao.addImage(newImage).then(() => {
                processPostUpload(imageId, user, fullImage).then(() => {
                    imageDao.setImageStatus(imageId, ImageStatus.Processed).then(() => {
                        console.log(`[/upload] Processed ${imageId} with CRAFT`);
                    }, (reason) => {
                        console.log(`[/upload] Processed ${imageId} with CRAFT, but failed to update image status: ${reason}`);
                    });
                }, (reason) => {
                    console.log(`[/upload] Problem processing ${imageId} with CRAFT: ${reason}`);
                    imageDao.setImageStatus(imageId, ImageStatus.NotProcessed).then(() => { }, (reason) => {
                        console.log(`[/upload] Failed to update image status for ${imageId}: ${reason}`);
                    });
                });
                return response.json(newImage);
            }, (reason) => {
                console.log(`[/upload] Problem adding image to database: ${reason}`);
                return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
            });
        }, (reason) => {
            console.log(`[/upload] Problem saving image: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        });
    }, (reason) => {
        console.log(`[/upload] Problem resizing image: ${reason}`);
        return response.status(StatusCodes.BAD_REQUEST).json({ error: 'Problem when processing the image' });
    });
});


export default uploadRouter;