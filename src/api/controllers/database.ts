import * as dotenv from 'dotenv';
dotenv.config();

import * as PgPromise from 'pg-promise';
import { DATABASE_INITIALIZE_QUERY } from 'src/environments/constants';

const initOpitions = {};
const pgp = PgPromise(initOpitions);

const connectionInfo = {
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
};
const databaseConnection = pgp(connectionInfo);

export default databaseConnection;

export { pgp };

export function initializeDatabase(): Promise<void> {
    return databaseConnection.none(DATABASE_INITIALIZE_QUERY);
}