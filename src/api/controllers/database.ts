import * as dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import * as PgPromise from 'pg-promise';

const initOpitions = {};
const pgp = PgPromise(initOpitions);

const DATABASE_NAME = 'ocrlabeler';

const connectionInfo = {
    host: 'localhost',
    port: 5432,
    database: DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
};
const databaseConnection = pgp(connectionInfo);

export default databaseConnection;