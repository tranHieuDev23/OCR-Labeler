import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import LabelStatus from 'src/app/models/label-status';
import User from 'src/app/models/user';
import TextRegionDao from '../controllers/region-dao';
import { jwtMiddlewareFactory } from './jwt-middleware';

const reviewRouter = Router();
const regionDao: TextRegionDao = TextRegionDao.getInstance();
const verifyJwtMiddleware: Router = jwtMiddlewareFactory(
  (user) => user.canLabel
);
reviewRouter.use(verifyJwtMiddleware);

reviewRouter.post('/get-region-for-labeled', (request, response) => {
  const user: User = response.locals.user;
  let startFrom: number = request.body.startFrom;
  const itemCount: number = request.body.itemCount;
  let pageId: number = startFrom / itemCount + 1;
  regionDao
    .getTextRegionsCount(user, LabelStatus.NotVerified, false)
    .then((imagesCount) => {
      if (imagesCount <= startFrom) {
        console.log(
          `[/get-list-text-regions] User ${user.username} is trying to access more image than allowed: startFrom=${startFrom}, imagesCount=${imagesCount}. Reset to page one.`
        );
        startFrom = 0;
        pageId = 1;
      }
      regionDao
        .getListTextRegions(
          user,
          LabelStatus.NotVerified,
          startFrom,
          itemCount,
          false
        )
        .then(
          (region) => {
            return response.json({ imagesCount, region, pageId });
          },
          (reason) => {
            console.log(
              `[/get-region-for-labeled] Error happened while getting text region: ${reason}`
            );
            return response
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .json({ error: 'Internal server error' });
          }
        );
    });
});

reviewRouter.post('/review', (request, response) => {
  const user: User = response.locals.user;
  const regionId: string = request.body.regionId;
  const isHidden: boolean = request.body.isHidden;
  const label: string = request.body.label;
  //TODO: Chuẩn hoá string , cần hàm remove space ở đầu và cuối label, user
  regionDao.reviewTextRegion(user, regionId, isHidden, label).then(
    (updated) => {
      return response
        .status(updated ? StatusCodes.OK : StatusCodes.BAD_REQUEST)
        .json({});
    },
    (reason) => {
      console.log(
        `[/verify] Error happened while verifying text region: ${reason}`
      );
      return response
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: 'Can\t review the image' });
    }
  );
});

export default reviewRouter;
