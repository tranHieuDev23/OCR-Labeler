import * as bcrypt from 'bcryptjs';

const SALT_ROUND = 5;

function encrypt(data: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        bcrypt.hash(data, SALT_ROUND, (err, hash) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(hash);
        })
    });
}

function validate(data: any, hash: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        bcrypt.compare(data, hash, (err, same) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(same);
        })
    });
}

export { encrypt, validate };