import * as dotenv from 'dotenv';
dotenv.config();

import Axios from 'axios';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { join } from 'path';
import { AUTH_COOKIE_NAME, UPLOADED_IMAGE_DIRECTORY } from 'src/environments/constants';
import BlacklistedJwtDao from '../controllers/jwt-dao';

const exportRouter: Router = Router();

const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();
const uploadedFolder = join(process.cwd(), UPLOADED_IMAGE_DIRECTORY);

exportRouter.post('/request-export', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canExport) {
            console.log(`[/request-export] User ${user.username} is not authorized to export image files`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        Axios.post(process.env.EXPORT_REQUEST, { uploadedFolder }, {
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
        Axios.post(process.env.EXPORT_STATUS_REQUEST).then((status) => {
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
        Axios.post(process.env.EXPORT_DOWNLOAD_REQUEST, {}, {
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