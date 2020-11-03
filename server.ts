import * as dotenv from 'dotenv';
dotenv.config();

import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import authRouter from 'src/api/routes/auth';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import uploadRouter from 'src/api/routes/upload';
import * as mkdirp from 'mkdirp';
import UserDao from 'src/api/controllers/user-dao';
import User from 'src/app/models/user';
import imageRouter from 'src/api/routes/image';
import labelRouter from 'src/api/routes/label';
import verifyRouter from 'src/api/routes/verify';
import * as compression from 'compression';
import exportRouter from 'src/api/routes/export';
import { initializeDatabase } from 'src/api/controllers/database';
import * as waitPort from 'wait-port';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/ocr-labeler/browser');
  const uploadedFolder = process.env.UPLOADED_DIRECTORY;
  const thumbnailFolder = process.env.THUMBNAIL_DIRECTORY;
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  server.use(bodyParser.json());
  server.use(cookieParser());
  server.use(compression());

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.use('/api', authRouter);
  server.use('/api', uploadRouter);
  server.use('/api', imageRouter);
  server.use('/api', labelRouter);
  server.use('/api', verifyRouter);
  server.use('/api', exportRouter);

  // Server uploaded images from /uploaded
  server.get(`*.*`, express.static(uploadedFolder, {
    maxAge: '1y'
  }));


  // Server uploaded images from /uploaded
  server.get(`*.*`, express.static(thumbnailFolder, {
    maxAge: '1y'
  }));

  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

async function waitForService(host: string, port: number): Promise<boolean> {
  const open: boolean = await waitPort({ host, port });
  if (!open) {
    console.log(`${host}:${port} did not open!`);
  }
  return open;
}

function createFirstAdminUser(): Promise<void> {
  const userDao: UserDao = UserDao.getInstance();
  return new Promise<void>((resolve, reject) => {
    userDao.getUserCount().then((userCount) => {
      if (userCount > 0) {
        return resolve();
      }
      console.log('No user was created, request for creation of the first admin user before launching the server');
      const displayName = process.env.DEFAULT_ADMIN_DISPLAYNAME;
      const username = process.env.DEFAULT_ADMIN_USERNAME;
      const password = process.env.DEFAULT_ADMIN_PASSWORD;
      userDao.addUser(User.newAdminUser(displayName, username, password)).then(resolve, reject);
    }, reject);
  });
}

async function run() {
  const port = process.env.PORT || 4000;
  mkdirp.sync(process.env.UPLOADED_DIRECTORY);
  mkdirp.sync(process.env.THUMBNAIL_DIRECTORY);
  const serviceOpen = await waitForService(process.env.POSTGRES_HOST, +process.env.POSTGRES_PORT)
    && await waitForService(process.env.EXPORT_HOST, +process.env.EXPORT_PORT);
  if (!serviceOpen) {
    return;
  }
  initializeDatabase().then(() => {
    // In case no user was created, request for creation of the first admin user before launching the server
    createFirstAdminUser().then(() => {
      const server = app();
      server.listen(port, () => {
        console.log(`Node Express server listening on http://localhost:${port}`);
      });
    }, (reason) => {
      console.log(`Problem when initialize server: ${reason}`);
    });
  }, (reason) => {
    console.log(`Problem when initialize database: ${reason}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
