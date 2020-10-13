import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import LabelStatus from 'src/app/models/label-status';
import { Region, TextRegion } from 'src/app/models/text-region';
import { AUTH_COOKIE_NAME } from 'src/environments/constants';
import uid from 'uid';
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

imageRouter.post('/add-region', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canUpload) {
            console.log(`[/add-region] User ${user.username} is not authorized to upload image!`);
            return response.sendStatus(StatusCodes.UNAUTHORIZED);
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
            return response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    }, (reason) => {
        console.log(`[/add-region] Problem when authorizing user to retrieve image: ${reason}`);
        return response.sendStatus(StatusCodes.UNAUTHORIZED);
    });
});

imageRouter.post('/delete-region', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canUpload) {
            console.log(`[/delete-region] User ${user.username} is not authorized to upload image!`);
            return response.sendStatus(StatusCodes.UNAUTHORIZED);
        }
        const regionId: string = request.body.regionId;
        regionDao.deleteTextRegion(regionId, user.username).then((success) => {
            response.sendStatus(success ? StatusCodes.OK : StatusCodes.UNAUTHORIZED);
        }, (reason) => {
            console.log(`[/delete-region] Problem when storing new image region: ${reason}`);
            return response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    }, (reason) => {
        console.log(`[/delete-region] Problem when authorizing user to retrieve image: ${reason}`);
        return response.sendStatus(StatusCodes.UNAUTHORIZED);
    });
});

imageRouter.post('/delete-image', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canUpload) {
            console.log(`[/delete-image] User ${user.username} is not authorized to upload image!`);
            return response.sendStatus(StatusCodes.UNAUTHORIZED);
        }
        const imageId: string = request.body.imageId;
        imageDao.deleteImage(imageId, user.username).then((success) => {
            response.sendStatus(success ? StatusCodes.OK : StatusCodes.UNAUTHORIZED);
        }, (reason) => {
            console.log(`[/delete-image] Problem when delete image region: ${reason}`);
            return response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    }, (reason) => {
        console.log(`[/delete-image] Problem when authorizing user to retrieve image: ${reason}`);
        return response.sendStatus(StatusCodes.UNAUTHORIZED);
    });
});

export default imageRouter;