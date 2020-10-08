import User from 'src/app/models/user';
import databaseConnection from "./database";
import { encrypt, validate } from './encryption';

class UserDao {
    private constructor() { }

    public static getInstance(): UserDao {
        return new UserDao();
    }

    public findUser(username: string): Promise<User> {
        return new Promise((resolve, reject) => {
            databaseConnection.oneOrNone(
                `
                    SELECT username, "displayName", password FROM public."Users"
                    WHERE username = $1;
                `,
                [username]
            ).then((user) => {
                if (!user) {
                    reject('No user with the provided username was found');
                    return;
                }
                resolve(User.parseFromJson(user));
            }, (reason) => {
                reject(`[findUser()] Error happened while reading database: ${reason}`);
            });
        });
    }

    public validateUser(username: string, password: string): Promise<User> {
        return new Promise((resolve, reject) => {
            databaseConnection.oneOrNone(
                `
                    SELECT username, password, "displayName" FROM public."Users"
                    WHERE username = $1;
                `,
                [username]
            ).then((user) => {
                if (!user) {
                    reject('No user with the provided username was found');
                    return;
                }
                validate(password, user.password).then((same) => {
                    if (same) {
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
                            username, password, "displayName")
                            VALUES ($1, $2, $3);
                    `,
                    [user.username, hash, user.displayName]
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