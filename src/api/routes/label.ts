import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import LabelStatus from 'src/app/models/label-status';
import User from 'src/app/models/user';
import TextRegionDao from '../controllers/region-dao';
import { jwtMiddlewareFactory } from './jwt-middleware';

const labelRouter = Router();

const regionDao: TextRegionDao = TextRegionDao.getInstance();

const labelJwtMiddleware: Router = jwtMiddlewareFactory(user => user.canLabel);
labelRouter.use(labelJwtMiddleware);

labelRouter.post('/get-image-for-labeler', (request, response) => {
    const user: User = response.locals.user;
    regionDao.getRandomTextRegion(user, LabelStatus.NotLabeled).then((region) => {
        return response.json(region);
    }, (reason) => {
        console.log(`[/get-image-for-labeler] Error happened while getting text region: ${reason}`);
        return response.status(StatusCodes.BAD_REQUEST).json({});
    });
});

labelRouter.post('/label', (request, response) => {
    const user: User = response.locals.user;
    const regionId: string = request.body.regionId;
    const label: string = request.body.label;
    const cantLabel: boolean = request.body.cantLabel;
    const action: Promise<boolean> = cantLabel
        ? regionDao.setRegionCantLabeled(user, regionId, LabelStatus.CantLabel)
        : regionDao.labelTextRegion(user, regionId, label);
    action.then((updated) => {
        return response.status(updated ? StatusCodes.OK : StatusCodes.BAD_REQUEST).json({});
    }, (reason) => {
        console.log(`[/label] Error happened while labeling text region: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

export default labelRouter;