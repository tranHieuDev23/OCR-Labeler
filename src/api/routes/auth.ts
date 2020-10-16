import { CookieOptions, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import User from 'src/app/models/user';
import { validateDisplayName, validatePassword, validateUsername } from 'src/app/models/user-validate-funcs';
import { AUTH_COOKIE_NAME } from 'src/environments/constants';
import BlacklistedJwtDao from '../controllers/jwt-dao';
import UserDao from '../controllers/user-dao';

const authRouter: Router = Router();
const userDao: UserDao = UserDao.getInstance();
const jwtDao: BlacklistedJwtDao = BlacklistedJwtDao.getInstance();

const THIRTY_DAYS: number = 30 * 24 * 60 * 60 * 1000;

function getCookieOption(): CookieOptions {
    return {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        expires: new Date(Date.now() + THIRTY_DAYS)
    };
}

authRouter.post('/get-users', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canManageUsers) {
            console.log(`[/get-users] User ${user.username} is not authorized to manage users`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        userDao.getAllUserForManagement().then((allUsers) => {
            return response.json(allUsers);
        }, (reason) => {
            console.log(`[/get-users] Error happened while reading from database: ${reason}`);
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
        });
    }, (reason) => {
        console.log(`[/get-users] Error happened while validating user: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
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

authRouter.post('/register', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canManageUsers) {
            console.log(`[/register] User ${user.username} is not authorized to manage users`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        const newUser = User.parseFromJson(request.body);
        const validation = validateRegisteredUser(newUser);
        if (validation) {
            console.log(`[/register] Invalid user information: ${validation}`);
            return response.status(StatusCodes.BAD_REQUEST).json({});
        }
        userDao.addUser(newUser).then(() => {
            response.status(StatusCodes.OK).json({});
        }, (reason) => {
            console.log(`[/register] Register failed: ${reason}`);
            return response.status(StatusCodes.BAD_REQUEST).json({});
        });
    }, (reason) => {
        console.log(`[/register] Error happened while validating user: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
    });
});

authRouter.post('/update-user', (request, response) => {
    const token: string = request.cookies[AUTH_COOKIE_NAME];
    jwtDao.getUserFromJwt(token).then((user) => {
        if (!user.canManageUsers) {
            console.log(`[/update-user] User ${user.username} is not authorized to manage users`);
            return response.status(StatusCodes.UNAUTHORIZED).json({});
        }
        const updatedUser = User.parseFromJson(request.body);
        const validation = validateUpdatedUser(updatedUser);
        if (validation) {
            console.log(`[/update-user] Invalid user information: ${validation}`);
            return response.status(StatusCodes.BAD_REQUEST).json({});
        }
        userDao.updateUser(updatedUser).then(() => {
            response.status(StatusCodes.OK).json({});
        }, (reason) => {
            console.log(`[/update-user] Update user failed: ${reason}`);
            return response.status(StatusCodes.BAD_REQUEST).json({});
        });
    }, (reason) => {
        console.log(`[/update-user] Error happened while validating user: ${reason}`);
        return response.status(StatusCodes.UNAUTHORIZED).json({});
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
            return response.status(StatusCodes.BAD_REQUEST).json({});
        });
    }, (reason) => {
        console.log(`[/login] Authentication failed: ${reason}`);
        return response.status(StatusCodes.FORBIDDEN).json({});
    });
});

authRouter.post('/logout', (request, response) => {
    const jwt = request.cookies[AUTH_COOKIE_NAME];
    if (!jwt) {
        return response.status(StatusCodes.FORBIDDEN).json({});
    }
    jwtDao.isValidJwt(jwt).then((isValid) => {
        if (!isValid) {
            console.log(`[/logout] Authentication failed: invalid JWT`);
            return response.status(StatusCodes.FORBIDDEN).json({});
        }
        jwtDao.blacklistJwt(jwt);
        response.clearCookie(AUTH_COOKIE_NAME).send();
    }, (reason) => {
        console.log(`[/logout] Authentication failed: ${reason}`);
        return response.status(StatusCodes.FORBIDDEN).json({});
    });
});

authRouter.post('/validate', (request, response) => {
    const jwt = request.cookies[AUTH_COOKIE_NAME];
    if (!jwt) {
        return response.status(StatusCodes.FORBIDDEN).json({});
    }
    jwtDao.getUsernameFrowJwt(jwt).then((username) => {
        userDao.findUser(username).then((user) => {
            jwtDao.generateJwt(username).then((token) => {
                response.cookie(AUTH_COOKIE_NAME, token, getCookieOption()).json(user);
            }, (reason) => {
                console.log(`[/validate] Authentication failed: ${reason}`);
                return response.status(StatusCodes.FORBIDDEN).json({});
            });
        }, (reason) => {
            console.log(`[/validate] Authentication failed: ${reason}`);
            return response.status(StatusCodes.FORBIDDEN).json({});
        });
    }, (reason) => {
        console.log(`[/validate] Authentication failed: ${reason}`);
        return response.status(StatusCodes.FORBIDDEN).json({});
    });
});

export default authRouter;
