import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as path from 'path';
import * as fs from 'fs';
import { UPLOADED_IMAGE_DIRECTORY, THUMBNAIL_DIRECTORY, AUTH_COOKIE_NAME } from 'src/environments/constants';
import uid from 'uid';
import { resizeImage } from '../controllers/image-resize';
import BlacklistedJwtDao from '../controllers/jwt-dao';
import UploadedImage from 'src/app/models/uploaded-image';
import User from 'src/app/models/user';
import ImageStatus from 'src/app/models/image-status';
import ImageDao from '../controllers/image-dao';

const uploadRouter: Router = Router();
const FULL_HD_WIDTH = 1920;
const FULL_HD_HEIGHT = 1080;
const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 90;

const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();
const imageDao: ImageDao = ImageDao.getInstance();

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
        fs.writeFile(path.join(UPLOADED_IMAGE_DIRECTORY, imageFileName), fullImage, (reason) => {
            if (reason) {
                reject(reason);
            }
            fs.writeFile(path.join(THUMBNAIL_DIRECTORY, thumbnailName), thumbnail, (reason) => {
                if (reason) {
                    reject(reason);
                }
                resolve();
            });
        });
    });
}

uploadRouter.post('/upload', async (request, response) => {
    const jwt = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUsernameFrowJwt(jwt).then((username) => {
        generateImageAndThumbnail(request.body).then(({ fullImage, thumbnail }) => {
            const imageFileName: string = uid(33) + '.jpeg';
            const thumbnailName: string = uid(34) + '.jpeg';
            saveImageAndThumbnail(imageFileName, fullImage, thumbnailName, thumbnail).then(() => {
                const imageId: string = uid(32);
                const newImage: UploadedImage = new UploadedImage(
                    imageId,
                    `/${imageFileName}`,
                    `/${thumbnailName}`,
                    [],
                    new User(null, username, null),
                    new Date(),
                    ImageStatus.Uploaded
                );
                imageDao.addImage(newImage).then(() => {
                    response.sendStatus(StatusCodes.OK);
                }, (reason) => {
                    console.log(`[/upload] Problem adding image to database: ${reason}`);
                    return response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
                });
            }, (reason) => {
                console.log(`[/upload] Problem saving image: ${reason}`);
                return response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        }, (reason) => {
            console.log(`[/upload] Problem resizing image: ${reason}`);
            return response.sendStatus(StatusCodes.BAD_REQUEST);
        });
    }, (reason) => {
        console.log(`[/upload] Problem validating JWT: ${reason}`);
        return response.sendStatus(StatusCodes.UNAUTHORIZED);
    });
});


export default uploadRouter;