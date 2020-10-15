import User, { UserManagementInfo } from 'src/app/models/user';
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

    public getAllUserForManagement(): Promise<UserManagementInfo[]> {
        return new Promise<UserManagementInfo[]>((resolve, reject) => {
            databaseConnection.any(`
                WITH UploadCount AS (
                    SELECT "TextRegions"."uploadedBy" AS username, COUNT(*)
                        FROM public."TextRegions"
                        GROUP BY "TextRegions"."uploadedBy"
                ), LabelCount AS (
                    SELECT "TextRegions"."labeledBy" AS username, COUNT(*)
                        FROM public."TextRegions"
                        GROUP BY "TextRegions"."labeledBy"
                ), VerifyCount AS (
                    SELECT "TextRegions"."verifiedBy" As username, COUNT(*)
                        FROM public."TextRegions"
                        GROUP BY "TextRegions"."verifiedBy"
                ) SELECT 
                    "Users".*, 
                    COALESCE(UploadCount.count, 0) AS "uploadCount",
                    COALESCE(LabelCount.count, 0) AS "labelCount",
                    COALESCE(VerifyCount.count, 0) AS "verifyCount"
                    FROM public."Users"
                    LEFT JOIN UploadCount ON "Users".username = UploadCount.username
                    LEFT JOIN LabelCount ON "Users".username = LabelCount.username
                    LEFT JOIN VerifyCount ON "Users".username = VerifyCount.username;
            `).then((result) => {
                const users: UserManagementInfo[] = [];
                for (let item of result) {
                    delete item.password;
                    users.push(new UserManagementInfo(
                        User.parseFromJson(item),
                        +item.uploadCount,
                        +item.labelCount,
                        +item.verifyCount
                    ));
                }
                resolve(users);
            }, (reason) => {
                reject(`[getAllUser()] Error happened while getting all user: ${reason}`);
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
                    reject('[findUser()] No user with the provided username was found');
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
                    reject('[validateUser()] No user with the provided username was found');
                    return;
                }
                validate(password, user.password).then((same) => {
                    if (same) {
                        delete user.password;
                        resolve(User.parseFromJson(user));
                    } else {
                        reject('[validateUser()] Invalid password');
                    }
                }, (reason) => {
                    reject(`[validateUser()] Error happened while validating password: ${reason}`);
                });
            }, (reason) => {
                reject(`[validateUser()] Error happened while reading database: ${reason}`);
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
                    reject(`[addUser()] Error happened while writing user info into database: ${reason}`);
                });
            });
        });
    }

    public updateUser(user: User): Promise<void> {
        return new Promise((resolve, reject) => {
            databaseConnection.none(
                `
                        UPDATE public."Users"
                        SET "displayName" = $2, "canUpload" = $3, "canLabel" = $4, "canVerify" = $5, "canManageUsers" = $6
                        WHERE username = $1;
                    `,
                [user.username, user.displayName, user.canUpload, user.canLabel, user.canVerify, user.canManageUsers]
            ).then(() => {
                resolve();
            }, (reason) => {
                reject(`[updateUser()] Error happened while updating user into database: ${reason}`);
            });
        });
    }
};

export default UserDao;