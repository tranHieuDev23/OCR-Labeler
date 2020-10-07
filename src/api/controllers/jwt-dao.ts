import * as dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import * as jwt from 'jsonwebtoken';
import databaseConnection from "./database";

class BlacklistedJwtDao {
    private readonly secretKey: string = process.env.JWT_SECRET;
    private readonly idPattern: string = 'xxxx-xxxx-xxxx-xxxx';
    private constructor() { }

    public static getInstance(): BlacklistedJwtDao {
        return new BlacklistedJwtDao();
    }

    public generateJwt(username: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            jwt.sign({}, this.secretKey, {
                subject: username,
                expiresIn: '30d',
                jwtid: this.createFromPattern(this.idPattern)
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
                const jwtid: string = decoded['jti'];
                const exp: number = decoded['exp'];
                databaseConnection.none(
                    `
                        INSERT INTO BlacklistedSessions VALUES($1, $2);
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
                databaseConnection.one(
                    `
                        SELECT * FROM BlacklistedSessions
                        WHERE jwt == $1
                    `,
                    [jwtid]
                ).then((session) => {
                    if (!session) {
                        reject(`[isSessionBlacklisted()] Error happened while validating JWT: No username found`)
                        return;
                    }
                    const exp: number = session.exp;
                    const username: number = session.sub;
                    resolve(session.sub);
                }, (reason) => {
                    reject(`[isSessionBlacklisted()] Error happened while validating JWT: ${reason}`)
                });
            });
        });
    }

    public isValidJwt(token: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.getUsernameFrowJwt(token).then((username) => {
                resolve(!username);
            }, reject);
        });

    }

    private randomAlphaNumeric(): string {
        return Math.random().toString(36).charAt(2);
    };

    private createFromPattern(pattern: string): string {
        const chars: string[] = pattern.split('');
        return chars.map(x => x.replace('x', this.randomAlphaNumeric())).join('');
    };

    private unblacklistSession(jwtid: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            databaseConnection.none(
                `
                    DELETE FROM BlacklistedSessions
                    WHERE jwtid == $1;
                `,
                [jwtid]
            ).then(resolve, (reason) => {
                reject(`[unblacklistSession()] Error happened while unblacklisting JWT: ${reason}`);
            });
        });
    }
};

export default BlacklistedJwtDao;