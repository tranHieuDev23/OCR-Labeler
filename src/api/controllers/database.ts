import * as dotenv from 'dotenv';
dotenv.config();

import * as PgPromise from 'pg-promise';
import { lt, gte } from 'semver';
import {
  BASE_VERSION_DATABASE_QUERY,
  FIX_SUGGESTION_VERSION_DATABASE_QUERY,
  PRE_PUBLISH_VERSION_DATABASE_QUERY,
  SUGGESTION_VERSION_DATABASE_QUERY,
  REVIEW_VERSION_DATABASE_QUERY,
  REVAMP_EXPORT_VERSION_DATABASE_QUERY,
} from 'src/environments/constants';

const initOpitions = {};
const pgp = PgPromise(initOpitions);

const connectionInfo = {
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
const databaseConnection = pgp(connectionInfo);

export default databaseConnection;

export { pgp };
const REVAMP_EXPORT_VERSION: string = '4.0.0';
const REVIEW_VERSION: string = '3.0.0';
const FIX_SUGGESTION_VERSION: string = '2.1.1';
const SUGGESTION_VERSION: string = '2.1.0';
const PRE_PUBLISH_VERSION: string = '2.0.1';
const BASE_VERSION: string = '1.0.0';

const LATEST_VERSION: string = REVAMP_EXPORT_VERSION;

export async function initializeDatabase(): Promise<void> {
  const lastVersion: string = await getSchemaVersion();
  if (gte(lastVersion, LATEST_VERSION)) {
    return;
  }
  if (lt(lastVersion, BASE_VERSION)) {
    await databaseConnection.none(BASE_VERSION_DATABASE_QUERY);
  }
  if (lt(lastVersion, PRE_PUBLISH_VERSION)) {
    await databaseConnection.none(PRE_PUBLISH_VERSION_DATABASE_QUERY);
  }
  if (lt(lastVersion, SUGGESTION_VERSION)) {
    await databaseConnection.none(SUGGESTION_VERSION_DATABASE_QUERY);
  }
  if (lt(lastVersion, FIX_SUGGESTION_VERSION)) {
    await databaseConnection.none(FIX_SUGGESTION_VERSION_DATABASE_QUERY);
  }
  if (lt(lastVersion, REVIEW_VERSION)) {
    await databaseConnection.none(REVIEW_VERSION_DATABASE_QUERY);
  }
  if (lt(lastVersion, REVAMP_EXPORT_VERSION)) {
    await databaseConnection.none(REVAMP_EXPORT_VERSION_DATABASE_QUERY);
  }
  return setSchemaVersion(LATEST_VERSION);
}

async function getSchemaVersion(): Promise<string> {
  await databaseConnection.none(`
        CREATE TABLE IF NOT EXISTS public."SchemaVersions" (
            version text NOT NULL,
            "upgradedDate" bigint NOT NULL
        );
    `);
  const latestVersion = await databaseConnection.oneOrNone(`
        SELECT version from public."SchemaVersions"
            ORDER BY "SchemaVersions"."upgradedDate" DESC
            LIMIT 1;
    `);
  if (!latestVersion) {
    return '0.0.0';
  }
  return latestVersion.version;
}

async function setSchemaVersion(version: string): Promise<void> {
  return databaseConnection.none(
    `
        INSERT INTO public."SchemaVersions"(version, "upgradedDate")
            VALUES ($1, $2);
    `,
    [version, new Date().getTime()]
  );
}
