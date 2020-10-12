import User from 'src/app/models/user';
import databaseConnection from "./database";
import { encrypt, validate } from './encryption';

class UserDao {
    private constructor() { }

    public static getInstance(): UserDao {
        return new UserDao();
    }

    public getUserCount(): Promise<number> {
        return new Promise((resolve, reject) => {
            databaseConnection.one('SELECT COUNT(*) FROM public."Users";').then((result) => {
                resolve(result.count);
            }, (reason) => {
                reject(`[getUserCount()] Error happened while getting user count: ${reason}`);
            });
        });
    }

    public findUser(username: string): Promise<User> {
        return new Promise((resolve, reject) => {
            databaseConnection.oneOrNone(
                `SELECT * FROM public."Users" WHERE username = $1;`,
                [username]
            ).then((user) => {
                if (!user) {
                    reject('No user with the provided username was found');
                    return;
                }
                delete user.password;
                resolve(User.parseFromJson(user));
            }, (reason) => {
                reject(`[findUser()] Error happened while reading database: ${reason}`);
            });
        });
    }

    public validateUser(username: string, password: string): Promise<User> {
        return new Promise((resolve, reject) => {
            databaseConnection.oneOrNone(
                `SELECT * FROM public."Users" WHERE username = $1;`,
                [username]
            ).then((user) => {
                if (!user) {
                    reject('No user with the provided username was found');
                    return;
                }
                validate(password, user.password).then((same) => {
                    if (same) {
                        delete user.password;
                        resolve(User.parseFromJson(user));
                    } else {
                        reject('Invalid password');
                    }
                }, (reason) => {
                    reject(`Error happened while validating password: ${reason}`);
                });
            }, (reason) => {
                reject(`[findUser()] Error happened while reading database: ${reason}`);
            });
        });
    }

    public addUser(user: User): Promise<void> {
        return new Promise((resolve, reject) => {
            encrypt(user.password).then((hash) => {
                databaseConnection.none(
                    `
                        INSERT INTO public."Users"(
                            username, password, "displayName", "canUpload", "canLabel", "canVerify", "canManageUsers")
                            VALUES ($1, $2, $3, $4, $5, $6, $7);
                    `,
                    [user.username, hash, user.displayName, user.canUpload, user.canLabel, user.canVerify, user.canManageUsers]
                ).then(() => {
                    resolve();
                }, (reason) => {
                    reject(`[addUser()] Error happened while writing into database: ${reason}`);
                });
            });
        });
    }
};

export default UserDao;