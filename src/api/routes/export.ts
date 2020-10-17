import Axios from 'axios';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { join } from 'path';
import { AUTH_COOKIE_NAME, UPLOADED_IMAGE_DIRECTORY } from 'src/environments/constants';
import { environment } from 'src/environments/environment';
import BlacklistedJwtDao from '../controllers/jwt-dao';

const exportRouter: Router = Router();

const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();
const uploadedFolder = join(process.cwd(), UPLOADED_IMAGE_DIRECTORY);

exportRouter.post('/export', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canExport) {
            console.log(`[/export] User ${user.username} is not authorized to export image files`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        Axios.post(environment.exportServer, { uploadedFolder }, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            console.log(`[/export] Request for image export succeeded`);
        }, (reason) => {
            console.log(`[/export] Request for image export failed: ${reason}`);
        });
        return response.status(StatusCodes.OK).json({});
    }, (reason) => {
        console.log(`[/export] Error happened while validating user: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

export default exportRouter;