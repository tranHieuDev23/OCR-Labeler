import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import LabelStatus from 'src/app/models/label-status';
import { AUTH_COOKIE_NAME } from 'src/environments/constants';
import BlacklistedJwtDao from '../controllers/jwt-dao';
import TextRegionDao from '../controllers/region-dao';

const verifyRouter = Router();

const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();
const regionDao: TextRegionDao = TextRegionDao.getInstance();

verifyRouter.post('/get-image-for-verifier', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canVerify) {
            console.log(`[/get-image-for-verifier] User ${user.username} is not authorized to verify images`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        regionDao.getRandomTextRegion(user, LabelStatus.NotVerified).then((region) => {
            return response.json(region);
        }, (reason) => {
            console.log(`[/get-image-for-verifier] Error happened while getting text region: ${reason}`);
            return response.status(StatusCodes.BAD_REQUEST).json({});
        });
    }, (reason) => {
        console.log(`[/get-image-for-verifier] Error happened while authenticating user: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

verifyRouter.post('/verify', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canVerify) {
            console.log(`[/verify] User ${user.username} is not authorized to verify images`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        const regionId: string = request.body.regionId;
        const isCorrect: boolean = request.body.isCorrect;
        regionDao.verifyTextRegion(user, regionId, isCorrect).then((updated) => {
            return response.status(updated ? StatusCodes.OK : StatusCodes.BAD_REQUEST).json({});
        }, (reason) => {
            console.log(`[/verify] Error happened while verifying text region: ${reason}`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        });
    }, (reason) => {
        console.log(`[/verify] Error happened while authenticating user: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

export default verifyRouter;