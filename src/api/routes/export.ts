import * as dotenv from 'dotenv';
dotenv.config();

import Axios from 'axios';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { jwtMiddlewareFactory } from './jwt-middleware';

const exportRouter: Router = Router();

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
