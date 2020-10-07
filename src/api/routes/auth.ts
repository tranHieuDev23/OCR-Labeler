import { CookieOptions, response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import User from 'src/app/models/user';
import { AUTH_COOKIE_NAME } from 'src/environments/constants';
import BlacklistedJwtDao from '../controllers/jwt-dao';
import UserDao from '../controllers/user-dao';

const authRouter: Router = Router();
const userDao: UserDao = UserDao.getInstance();
const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
};

authRouter.post('/register', (request, response) => {
    const newUser = User.parseFromJson(request.body);
    userDao.addUser(newUser).then(() => {
        jwtDao.generateJwt(newUser.username).then((jwt) => {
            response.cookie(AUTH_COOKIE_NAME, jwt, cookieOptions).sendStatus(StatusCodes.OK);
        }, (reason) => {
            console.log(`[/register] Register failed: ${reason}`);
            response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    }, (reason) => {
        console.log(`[/register] Register failed: ${reason}`);
        response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

authRouter.post('/login', (request, response) => {
    const username: string = request.body.username;
    const password: string = request.body.password;
    userDao.validateUser(username, password).then((user: User) => {
        jwtDao.generateJwt(username).then((jwt) => {
            response.cookie(AUTH_COOKIE_NAME, jwt, cookieOptions).json({
                username: user.username,
                displayName: user.displayName
            });
        }, (reason) => {
            console.log(`[/login] Authentication failed: ${reason}`);
            response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    }, (reason) => {
        console.log(`[/login] Authentication failed: ${reason}`);
        response.sendStatus(StatusCodes.FORBIDDEN);
    });
});

authRouter.post('/logout', (request, response) => {
    const jwt = request.cookies[AUTH_COOKIE_NAME];
    if (!jwt) {
        response.sendStatus(StatusCodes.FORBIDDEN);
        return;
    }
    jwtDao.isValidJwt(jwt).then((isValid) => {
        if (!isValid) {
            console.log(`[/logout] Authentication failed: invalid JWT`);
            response.sendStatus(StatusCodes.FORBIDDEN);
            return;
        }
        jwtDao.blacklistJwt(jwt);
        response.clearCookie(AUTH_COOKIE_NAME).send();
    }, (reason) => {
        console.log(`[/logout] Authentication failed: ${reason}`);
        response.sendStatus(StatusCodes.FORBIDDEN);
    });
});

authRouter.post('/validate', (request, response) => {
    const jwt = request.cookies[AUTH_COOKIE_NAME];
    if (!jwt) {
        response.sendStatus(StatusCodes.FORBIDDEN);
        return;
    }
    jwtDao.getUsernameFrowJwt(jwt).then((username) => {
        jwtDao.generateJwt(username).then((token) => {
            userDao.findUser(username).then((user) => {
                response.cookie(AUTH_COOKIE_NAME, token).json({
                    username: user.username,
                    displayName: user.displayName
                });
            }, (reason) => {
                console.log(`[/validate] Authentication failed: ${reason}`);
                response.sendStatus(StatusCodes.FORBIDDEN);
            });
        }, (reason) => {
            console.log(`[/validate] Authentication failed: ${reason}`);
            response.sendStatus(StatusCodes.FORBIDDEN);
        });
    }, (reason) => {
        console.log(`[/validate] Authentication failed: ${reason}`);
        response.sendStatus(StatusCodes.FORBIDDEN);
    });
});

export default authRouter;
