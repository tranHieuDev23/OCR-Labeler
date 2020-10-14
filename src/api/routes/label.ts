import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import LabelStatus from 'src/app/models/label-status';
import { AUTH_COOKIE_NAME } from 'src/environments/constants';
import BlacklistedJwtDao from '../controllers/jwt-dao';
import TextRegionDao from '../controllers/region-dao';

const labelRouter = Router();

const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();
const regionDao: TextRegionDao = TextRegionDao.getInstance();

labelRouter.post('/get-image-for-labeler', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canLabel) {
            console.log(`[/get-image-for-labeler] User ${user.username} is not authorized to label images`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        regionDao.getRandomTextRegion(user, LabelStatus.NotLabeled).then((region) => {
            return response.json(region);
        }, (reason) => {
            console.log(`[/get-image-for-labeler] Error happened while getting text region: ${reason}`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        });
    }, (reason) => {
        console.log(`[/get-image-for-labeler] Error happened while authenticating user: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

labelRouter.post('/label', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canLabel) {
            console.log(`[/get-image-for-labeler] User ${user.username} is not authorized to label images`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        const regionId: string = request.body.regionId;
        const label: string = request.body.label;
        const cantLabel: boolean = request.body.cantLabel;
        const action: Promise<boolean> = cantLabel
            ? regionDao.setRegionCantLabeled(user, regionId, LabelStatus.CantLabel)
            : regionDao.labelTextRegion(user, regionId, label);
        action.then((updated) => {
            return response.status(updated ? StatusCodes.OK : StatusCodes.BAD_REQUEST).json({});
        }, (reason) => {
            console.log(`[/get-image-for-labeler] Error happened while labeling text region: ${reason}`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        });
    }, (reason) => {
        console.log(`[/get-image-for-labeler] Error happened while authenticating user: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

export default labelRouter;