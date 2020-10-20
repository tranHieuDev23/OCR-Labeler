import * as dotenv from 'dotenv';
dotenv.config();

import Axios from 'axios';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AUTH_COOKIE_NAME } from 'src/environments/constants';
import BlacklistedJwtDao from '../controllers/jwt-dao';

const exportRouter: Router = Router();

const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();
const uploadedFolder = process.env.UPLOADED_DIRECTORY;

const exportHost = process.env.EXPORT_HOST;
const exportPort = process.env.EXPORT_PORT;

function getExportApi(api: string): string {
    return `http://${exportHost}:${exportPort}${api}`;
}

exportRouter.post('/request-export', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canExport) {
            console.log(`[/request-export] User ${user.username} is not authorized to export image files`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        Axios.post(getExportApi('/api/export'), { uploadedFolder }, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            console.log(`[/request-export] Request for image export succeeded`);
        }, (reason) => {
            console.log(`[/request-export] Request for image export failed: ${reason}`);
        });
        return response.status(StatusCodes.OK).json({});
    }, (reason) => {
        console.log(`[/request-export] Error happened while validating user: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

exportRouter.post('/export-status', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canExport) {
            console.log(`[/export-status] User ${user.username} is not authorized to export image files`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        Axios.post(getExportApi('/api/export-status')).then((status) => {
            return response.status(StatusCodes.OK).json(status.data);
        }, (reason) => {
            console.log(`[/export-status] Request for image export status failed: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
        });
    }, (reason) => {
        console.log(`[/export-status] Error happened while validating user: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

exportRouter.get('/download-export', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canExport) {
            console.log(`[/download-export] User ${user.username} is not authorized to export image files`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        Axios.post(getExportApi('/api/download'), {}, {
            responseType: 'stream'
        }).then((data) => {
            return data.data.pipe(response);
        }, (reason) => {
            console.log(`[/download-export] Request for image export status failed: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
        });
    }, (reason) => {
        console.log(`[/download-export] Error happened while validating user: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

export default exportRouter;