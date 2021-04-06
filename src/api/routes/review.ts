import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import LabelStatus from 'src/app/models/label-status';
import User from 'src/app/models/user';
import TextRegionDao from '../controllers/region-dao';
import { jwtMiddlewareFactory } from './jwt-middleware';

const reviewRouter = Router();
const regionDao: TextRegionDao = TextRegionDao.getInstance();
const verifyJwtMiddleware: Router = jwtMiddlewareFactory(user => user.canVerify);
reviewRouter.use(verifyJwtMiddleware);

reviewRouter.post('/get-region-for-labeled', (request, response) => {
    const user: User = response.locals.user;
    regionDao.getListTextRegions(user, LabelStatus.NotVerified, false).then((region) => {
        return response.json(region);
    }, (reason) => {
        console.log(`[/get-region-for-labeled] Error happened while getting text region: ${reason}`);
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    });
});

reviewRouter.post('/review', (request, response) => {
    const user: User = response.locals.user;
    const regionId: string = request.body.regionId;
    const isCorrect: boolean = request.body.isCorrect;
    regionDao.reviewTextRegion(user, regionId, isCorrect).then((updated) => {
        return response.status(updated ? StatusCodes.OK : StatusCodes.BAD_REQUEST).json({});
    }, (reason) => {
        console.log(`[/verify] Error happened while verifying text region: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({ error: 'Can\t review the image' });
    });
});

export default reviewRouter;