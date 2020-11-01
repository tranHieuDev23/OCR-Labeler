import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import LabelStatus from 'src/app/models/label-status';
import User from 'src/app/models/user';
import TextRegionDao from '../controllers/region-dao';
import { jwtMiddlewareFactory } from './jwt-middleware';

const verifyRouter = Router();
const regionDao: TextRegionDao = TextRegionDao.getInstance();
const verifyJwtMiddleware: Router = jwtMiddlewareFactory(user => user.canVerify);
verifyRouter.use(verifyJwtMiddleware);

verifyRouter.post('/get-image-for-verifier', (request, response) => {
    const user: User = response.locals.user;
    regionDao.getRandomTextRegion(user, LabelStatus.NotVerified).then((region) => {
        return response.json(region);
    }, (reason) => {
        console.log(`[/get-image-for-verifier] Error happened while getting text region: ${reason}`);
        return response.status(StatusCodes.BAD_REQUEST).json({});
    });
});

verifyRouter.post('/verify', (request, response) => {
    const user: User = response.locals.user;
    const regionId: string = request.body.regionId;
    const isCorrect: boolean = request.body.isCorrect;
    regionDao.verifyTextRegion(user, regionId, isCorrect).then((updated) => {
        return response.status(updated ? StatusCodes.OK : StatusCodes.BAD_REQUEST).json({});
    }, (reason) => {
        console.log(`[/verify] Error happened while verifying text region: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

export default verifyRouter;