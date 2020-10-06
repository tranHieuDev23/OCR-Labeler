import { EventEmitter, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import User from '../models/user';

const AUTH_COOKIE_NAME = 'ocr-auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User = null;
  public readonly loggedIn: EventEmitter<boolean> = new EventEmitter<boolean>()

  constructor(
    private cookie: CookieService
  ) {
    this.isUserLoggedIn().then((isLoggedIn) => {
      this.loggedIn.emit(isLoggedIn);
    }, () => {
      this.logOut().then(() => {
        this.loggedIn.emit(false);
      });
    });
  }

  public isUserLoggedIn(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.getCurrentUser().then((user) => {
        resolve(user != null);
      }, reject);
    });
  }

  public login(username: string, password: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.isUserLoggedIn().then((isLoggedIn) => {
        if (isLoggedIn) {
          reject("User already logged in");
          return;
        }
        if (username != 'admin' || password != 'admin') {
          reject("Incorrect username or password");
          return;
        }
        this.cookie.set(AUTH_COOKIE_NAME, '123');
        this.currentUser = new User("Tran Minh Hieu", username);
        this.loggedIn.emit(true);
        resolve(this.currentUser);
      }, reject);
    });
  }

  public logOut(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.isUserLoggedIn().then((isLoggedIn) => {
        if (!isLoggedIn) {
          reject("User already logged out");
          return;
        }
        this.cookie.delete(AUTH_COOKIE_NAME);
        this.currentUser = null;
        this.loggedIn.emit(false);
        resolve();
      }, reject);
    });
  }

  public getCurrentUser(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      if (this.currentUser != null) {
        resolve(this.currentUser);
        return;
      }
      if (!this.cookie.check(AUTH_COOKIE_NAME)) {
        resolve(null);
        return;
      }
      this.currentUser = new User("Tran Minh Hieu", 'admin');
      resolve(this.currentUser);
    });
  }
}
