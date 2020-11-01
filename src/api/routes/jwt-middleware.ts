import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import User from 'src/app/models/user';
import { AUTH_COOKIE_NAME } from 'src/environments/constants';
import BlacklistedJwtDao from '../controllers/jwt-dao';

const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();

export function jwtMiddlewareFactory(isUserAuthorized: (user: User) => boolean): Router {
    const jwtMiddleware: Router = Router();

    function errorResponse(request: Request, response: Response, error: string): void {
        console.log(`[${request.url}] ${error}`);
        response.status(StatusCodes.UNAUTHORIZED).json({ error });
    }

    jwtMiddleware.use((request, response, next) => {
        const token: string = request.cookies[AUTH_COOKIE_NAME];
        if (!token) {
            return errorResponse(request, response, 'User is not logged in');
        }
        jwtDao.getUserFromJwt(token).then((user) => {
            if (!isUserAuthorized(user)) {
                return errorResponse(request, response, `User ${user.username} doesn't have the required privilege`);
            }
            response.locals.user = user;
            next();
        }, (error) => {
            console.log(`[${request.url}] ${error}`);
            return errorResponse(request, response, 'Invalid credential');
        });
    });

    return jwtMiddleware;
}