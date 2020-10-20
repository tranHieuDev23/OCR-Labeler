import * as dotenv from 'dotenv';
dotenv.config();

import * as PgPromise from 'pg-promise';
import { DATABASE_INITIALIZE_QUERY } from 'src/environments/constants';

const initOpitions = {};
const pgp = PgPromise(initOpitions);

const connectionInfo = {
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
};
const databaseConnection = pgp(connectionInfo);

export default databaseConnection;

export { pgp };

export function initializeDatabase(): Promise<void> {
    return databaseConnection.none(DATABASE_INITIALIZE_QUERY);
}