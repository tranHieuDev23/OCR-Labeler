// import * as bcrypt from 'bcrypt';

const SALT_ROUND = 10;

function encrypt(data: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        resolve(data);
        // bcrypt.hash(data, SALT_ROUND, (err, hash) => {
        //     if (err) {
        //         reject(err);
        //         return;
        //     }
        //     resolve(hash);
        // });
    });
}

function validate(data: any, hash: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        resolve(data);
        // bcrypt.compare(data, hash, (err, same) => {
        //     if (err) {
        //         reject(err);
        //         return;
        //     }
        //     resolve(same);
        // })
    });
}

export { encrypt, validate };