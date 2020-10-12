import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AUTH_COOKIE_NAME } from 'src/environments/constants';
import ImageDao from '../controllers/image-dao';
import BlacklistedJwtDao from '../controllers/jwt-dao';
import TextRegionDao from '../controllers/region-dao';

const imageRouter: Router = Router();

const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();
const imageDao: ImageDao = ImageDao.getInstance();
const regionDao: TextRegionDao = TextRegionDao.getInstance();


imageRouter.post('/get-image', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canUpload) {
            console.log(`[/get-image] User ${user.username} is not authorized to upload image!`);
            return response.sendStatus(StatusCodes.UNAUTHORIZED);
        }
        const imageId: string = request.body.imageId;
        imageDao.getImage(imageId).then((image) => {
            if (image.uploadedBy.username != user.username) {
                console.log(`[/get-image] User ${user.username} is trying to access other's images!`);
                return response.sendStatus(StatusCodes.UNAUTHORIZED);
            }
            return response.json(image);
        }, (reason) => {
            console.log(`[/get-image] Problem when retrieving image: ${reason}`);
            return response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        })
    }, (reason) => {
        console.log(`[/get-image] Problem when authorizing user to retrieve image: ${reason}`);
        return response.sendStatus(StatusCodes.UNAUTHORIZED);
    });
});


export default imageRouter;