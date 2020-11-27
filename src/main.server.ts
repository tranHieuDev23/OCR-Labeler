import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';

import * as xhr2 from 'xhr2';

//HACK - enables setting cookie header
xhr2.prototype._restrictedHeaders.cookie = false;

if (environment.production) {
  enableProdMode();
}

export { AppServerModule } from './app/app.server.module';
export { renderModule, renderModuleFactory } from '@angular/platform-server';
