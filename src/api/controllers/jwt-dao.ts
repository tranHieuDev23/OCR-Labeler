import * as dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import * as jwt from 'jsonwebtoken';
import uid from 'uid';
import databaseConnection from "./database";

class BlacklistedJwtDao {
    private readonly secretKey: string = process.env.JWT_SECRET;
    private constructor() { }

    public static getInstance(): BlacklistedJwtDao {
        return new BlacklistedJwtDao();
    }

    public generateJwt(username: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            jwt.sign({}, this.secretKey, {
                subject: username,
                expiresIn: '30d',
                jwtid: uid(32)
            }, (err, token) => {
                if (err) {
                    reject(`[generateJwt] Error happened while generating JWT: ${err}`);
                    return;
                }
                resolve(token);
            });
        });
    }

    public blacklistJwt(token: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            jwt.verify(token, this.secretKey, (err, decoded) => {
                if (err) {
                    reject(`[blacklistSession()] Error happened while blacklisting JWT: ${err}`);
                    return;
                }
                const jwtid: string = decoded['jti'];
                const exp: number = decoded['exp'];
                databaseConnection.none(
                    `
                        INSERT INTO public."BlacklistedJwts"(jwtid, exp)
                        VALUES($1, $2);
                    `,
                    [jwtid, exp]
                ).then(resolve, (reason) => {
                    reject(`[blacklistSession()] Error happened while blacklisting JWT: ${reason}`);
                });
            });
        });
    }

    public getUsernameFrowJwt(token: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            jwt.verify(token, this.secretKey, (err, decoded) => {
                if (err) {
                    reject(err);
                    return;
                }
                const jwtid: string = decoded['jti'];
                databaseConnection.oneOrNone(
                    `
                        SELECT * FROM public."BlacklistedJwts"
                        WHERE jwtid = $1;
                    `,
                    [jwtid]
                ).then((session) => {
                    if (session) {
                        const sessionExp: number = session.exp;
                        if (sessionExp < Date.now()) {
                            reject(`[isSessionBlacklisted()] Error happened while validating JWT: JWT is blacklisted`);
                            return;
                        }
                        this.unblacklistSession(jwtid);
                    }
                    const username: string = decoded['sub'];
                    resolve(username);
                }, (reason) => {
                    reject(`[isSessionBlacklisted()] Error happened while validating JWT: ${reason}`)
                });
            });
        });
    }

    public isValidJwt(token: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.getUsernameFrowJwt(token).then(() => {
                resolve(true);
            }, reject);
        });

    }

    private unblacklistSession(jwtid: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            databaseConnection.none(
                `
                    DELETE FROM public."BlacklistedJwts"
                    WHERE jwtid = $1;
                `,
                [jwtid]
            ).then(resolve, (reason) => {
                reject(`[unblacklistSession()] Error happened while unblacklisting JWT: ${reason}`);
            });
        });
    }
};

export default BlacklistedJwtDao;