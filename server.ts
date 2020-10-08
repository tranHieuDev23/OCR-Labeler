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
import { THUMBNAIL_DIRECTORY, UPLOADED_IMAGE_DIRECTORY } from 'src/environments/constants';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/ocr-labeler/browser');
  const uploadedFolder = join(process.cwd(), UPLOADED_IMAGE_DIRECTORY);
  const thumbnailFolder = join(process.cwd(), THUMBNAIL_DIRECTORY);
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  server.use(bodyParser.json());
  server.use(bodyParser.raw({
    type: 'image/*',
    limit: '5mb'
  }));
  server.use(cookieParser());

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.use('/api', authRouter);
  server.use('/api', uploadRouter);

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

function run(): void {
  const port = process.env.PORT || 4000;
  mkdirp.sync(UPLOADED_IMAGE_DIRECTORY);
  mkdirp.sync(THUMBNAIL_DIRECTORY);
  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
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
