import * as dotenv from 'dotenv';
dotenv.config();

import Axios from 'axios';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { jwtMiddlewareFactory } from './jwt-middleware';
import User from 'src/app/models/user';
import { ImageFilterOptions } from 'src/app/models/image-filter-options';
import ImageDao from '../controllers/image-dao';

const exportRouter: Router = Router();
const imageDao = ImageDao.getInstance();

const uploadedFolder = process.env.UPLOADED_DIRECTORY;

const exportHost = process.env.EXPORT_HOST;
const exportPort = process.env.EXPORT_PORT;

function getExportApi(api: string): string {
  return `http://${exportHost}:${exportPort}${api}`;
}

const exportJwtMiddleware: Router = jwtMiddlewareFactory(
  (user) => user.canExport
);
exportRouter.use(exportJwtMiddleware);

exportRouter.post('/get-exportable-images', async (request, response) => {
  const user: User = response.locals.user;
  let startFrom: number = request.body.startFrom;
  const itemCount: number = request.body.itemCount;
  const filterOptions: ImageFilterOptions = ImageFilterOptions.parseFromJson(
    request.body.filterOptions
  );

  let pageId: number = startFrom / itemCount + 1;
  try {
    const imagesCount = await imageDao.getImagesCountExport(filterOptions);
    if (imagesCount <= startFrom) {
      console.log(
        `[/get-exportable-images] User ${user.username} is trying to access more image than allowed: ` +
          `startFrom=${startFrom}, imagesCount=${imagesCount}. Reset to page one.`
      );
      startFrom = 0;
      pageId = 1;
    }
    const images = await imageDao.getImagesExport(
      startFrom,
      itemCount,
      filterOptions
    );
    return response.json({
      imagesCount,
      images,
      pageId,
    });
  } catch (e) {
    console.log(`[/get-exportable-images] Problem when retrieving image: ${e}`);
    return response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
});

exportRouter.post('/request-export', (request, response) => {
  Axios.post(
    getExportApi('/api/export'),
    { uploadedFolder },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ).then(
    () => {
      console.log(`[/request-export] Request for image export succeeded`);
    },
    (reason) => {
      console.log(
        `[/request-export] Request for image export failed: ${reason}`
      );
    }
  );
  return response.status(StatusCodes.OK).json({});
});

exportRouter.post('/export-status', (request, response) => {
  Axios.post(getExportApi('/api/export-status')).then(
    (status) => {
      return response.status(StatusCodes.OK).json(status.data);
    },
    (reason) => {
      console.log(
        `[/export-status] Request for image export status failed: ${reason}`
      );
      return response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error' });
    }
  );
});

exportRouter.get('/download-export', (request, response) => {
  Axios.post(
    getExportApi('/api/download'),
    {},
    {
      responseType: 'stream',
    }
  ).then(
    (data) => {
      return data.data.pipe(response);
    },
    (reason) => {
      console.log(
        `[/download-export] Request for image export status failed: ${reason}`
      );
      return response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error' });
    }
  );
});

export default exportRouter;
