import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as sharp from 'sharp';
import * as path from 'path';
import { UPLOADED_IMAGE_DIRECTORY } from 'src/environments/constants';

const uploadRouter: Router = Router();
const FULL_HD = 1080;

uploadRouter.post('/upload', (request, response) => {
    sharp(request.body).resize(FULL_HD).toFile(path.join(UPLOADED_IMAGE_DIRECTORY, 'image.jpeg')).then(() => {
        response.sendStatus(StatusCodes.OK);
    });
});

export default uploadRouter;