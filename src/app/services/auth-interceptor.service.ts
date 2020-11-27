import * as dotenv from 'dotenv';
dotenv.config();

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { Request } from 'express';
import { isPlatformServer } from '@angular/common';

const PORT = process.env.PORT || 4000;

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject(REQUEST) private request: Request
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!isPlatformServer(this.platformId)) {
      return next.handle(req);
    }
    const cookieString = Object.keys(this.request.cookies).reduce((accumulator, cookieName) => {
      accumulator += cookieName + '=' + this.request.cookies[cookieName] + ';';
      return accumulator;
    }, '');
    const newReq = req.clone({
      headers: req.headers.set('Cookie', cookieString),
      url: `http://127.0.0.1:${PORT}${req.url}`
    });
    return next.handle(newReq);
  }
}
