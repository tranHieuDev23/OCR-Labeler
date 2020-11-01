import { CookieOptions, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import User from 'src/app/models/user';
import { validateDisplayName, validatePassword, validateUsername } from 'src/app/models/user-validate-funcs';
import { AUTH_COOKIE_NAME } from 'src/environments/constants';
import BlacklistedJwtDao from '../controllers/jwt-dao';
import UserDao from '../controllers/user-dao';
import { jwtMiddlewareFactory } from './jwt-middleware';

const authRouter: Router = Router();
const userDao: UserDao = UserDao.getInstance();
const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();

const THIRTY_DAYS: number = 30 * 24 * 60 * 60 * 1000;

function getCookieOption(): CookieOptions {
    return {
        httpOnly: true,
        sameSite: "strict",
        expires: new Date(Date.now() + THIRTY_DAYS)
    };
}

const adminJwtMiddleware: Router = jwtMiddlewareFactory((user) => user.canManageUsers);

authRouter.post('/get-users', adminJwtMiddleware, (request, response) => {
    userDao.getAllUser().then((allUsers) => {
        return response.json(allUsers);
    }, (reason) => {
        console.log(`[/get-users] Error happened while reading from database: ${reason}`);
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    });
});

authRouter.post('/get-users-full', adminJwtMiddleware, (request, response) => {
    userDao.getAllUserForManagement().then((allUsers) => {
        return response.json(allUsers);
    }, (reason) => {
        console.log(`[/get-users-full] Error happened while reading from database: ${reason}`);
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    });
});

function validateUpdatedUser(user: User): { [k: string]: boolean } | null {
    const usernameValidation = validateUsername(user.username);
    if (usernameValidation) {
        return usernameValidation;
    }
    const displayNameValidation = validateDisplayName(user.displayName);
    if (displayNameValidation) {
        return displayNameValidation;
    }
    return null;
}

function validateRegisteredUser(user: User): { [k: string]: boolean } | null {
    const updateValidation = validateUpdatedUser(user);
    if (updateValidation) {
        return updateValidation;
    }
    const passwordValidation = validatePassword(user.password);
    if (passwordValidation) {
        return passwordValidation;
    }
    return null;
}

authRouter.post('/register', adminJwtMiddleware, (request, response) => {
    const newUser = User.parseFromJson(request.body);
    const validation = validateRegisteredUser(newUser);
    if (validation) {
        console.log(`[/register] Invalid user information: ${validation}`);
        return response.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid user information' });
    }
    userDao.addUser(newUser).then(() => {
        response.status(StatusCodes.OK).json({});
    }, (reason) => {
        console.log(`[/register] Register failed: ${reason}`);
        return response.status(StatusCodes.BAD_REQUEST).json({ error: 'Duplicated username' });
    });
});

authRouter.post('/update-user', adminJwtMiddleware, (request, response) => {
    const updatedUser = User.parseFromJson(request.body);
    const validation = validateUpdatedUser(updatedUser);
    if (validation) {
        console.log(`[/update-user] Invalid user information: ${validation}`);
        return response.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid user information' });
    }
    userDao.updateUser(updatedUser).then(() => {
        response.status(StatusCodes.OK).json({});
    }, (reason) => {
        console.log(`[/update-user] Update user failed: ${reason}`);
        return response.status(StatusCodes.BAD_REQUEST).json({ error: 'Duplicated username' });
    });
});

authRouter.post('/login', (request, response) => {
    const username: string = request.body.username;
    const password: string = request.body.password;
    userDao.validateUser(username, password).then((user: User) => {
        jwtDao.generateJwt(username).then((jwt) => {
            response.cookie(AUTH_COOKIE_NAME, jwt, getCookieOption()).json(user);
        }, (reason) => {
            console.log(`[/login] Authentication failed: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        });
    }, (reason) => {
        console.log(`[/login] Authentication failed: ${reason}`);
        return response.status(StatusCodes.FORBIDDEN).json({ error: 'Wrong username or password' });
    });
});

authRouter.post('/logout', (request, response) => {
    const jwt = request.cookies[AUTH_COOKIE_NAME];
    if (!jwt) {
        return response.status(StatusCodes.FORBIDDEN).json({ error: 'User is not logged in' });
    }
    jwtDao.isValidJwt(jwt).then((isValid) => {
        if (!isValid) {
            console.log(`[/logout] Authentication failed: invalid JWT`);
            return response.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid credential' });
        }
        jwtDao.blacklistJwt(jwt);
        response.clearCookie(AUTH_COOKIE_NAME).send();
    }, (reason) => {
        console.log(`[/logout] Authentication failed: ${reason}`);
        return response.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid credential' });
    });
});

authRouter.post('/validate', (request, response) => {
    const jwt = request.cookies[AUTH_COOKIE_NAME];
    if (!jwt) {
        return response.status(StatusCodes.FORBIDDEN).json({ error: 'User is not logged in' });
    }
    jwtDao.getUsernameFrowJwt(jwt).then((username) => {
        userDao.findUser(username).then((user) => {
            jwtDao.generateJwt(username).then((token) => {
                response.cookie(AUTH_COOKIE_NAME, token, getCookieOption()).json(user);
            }, (reason) => {
                console.log(`[/validate] Authentication failed: ${reason}`);
                return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
            });
        }, (reason) => {
            console.log(`[/validate] Authentication failed: ${reason}`);
            return response.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid credential' });
        });
    }, (reason) => {
        console.log(`[/validate] Authentication failed: ${reason}`);
        return response.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid credential' });
    });
});

export default authRouter;
