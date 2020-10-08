import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { UPLOADED_IMAGE_DIRECTORY, THUMBNAIL_DIRECTORY } from 'src/environments/constants';
import uid from 'uid';
import { resizeImage } from '../controllers/image-resize';

const uploadRouter: Router = Router();
const FULL_HD_WIDTH = 1920;
const FULL_HD_HEIGHT = 1080;
const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 90;

uploadRouter.post('/upload', async (request, response) => {
    const imageId: string = uid(32);
    const imageFileName: string = path.join(UPLOADED_IMAGE_DIRECTORY, imageId + '.jpeg');
    const thumbnailFileName: string = path.join(THUMBNAIL_DIRECTORY, uid(48) + '.jpeg');
    resizeImage(request.body, FULL_HD_WIDTH, FULL_HD_HEIGHT).then((fullImage) => {
        resizeImage(fullImage, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT).then((thumbnail) => {
            fs.writeFile(imageFileName, fullImage, (reason) => {
                if (reason) {
                    console.log(`[/upload] Problem writing full image file: ${reason}`);
                    return response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
                }
                fs.writeFile(thumbnailFileName, thumbnail, (reason) => {
                    if (reason) {
                        console.log(`[/upload] Problem writing thumbnail file: ${reason}`);
                        return response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
                    }
                    response.sendStatus(StatusCodes.OK);
                });
            });
        }, (reason) => {
            console.log(`[/upload] Problem resize thumbnail file: ${reason}`);
            return response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    }, (reason) => {
        console.log(`[/upload] Problem resize full image file: ${reason}`);
        return response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

export default uploadRouter;