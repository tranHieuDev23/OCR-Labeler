import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import User from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User = null;
  public readonly loggedIn: EventEmitter<boolean> = new EventEmitter<boolean>()

  constructor(
    private http: HttpClient
  ) {
    this.getCurrentUser().then((user) => {
      this.currentUser = user;
      this.loggedIn.emit(user != null);
    }, () => {
      this.loggedIn.emit(false);
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
        this.http.post('/api/login', {
          username, password
        }).toPromise().then((response) => {
          this.currentUser = User.parseFromJson(response);
          this.loggedIn.emit(true);
          resolve(this.currentUser);
        }, reject);
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
        this.http.post('/api/logout', {}).toPromise().then(() => {
          this.currentUser = null;
          this.loggedIn.emit(false);
          resolve();
        }, reject);
      }, reject);
    });
  }

  public getCurrentUser(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      if (this.currentUser != null) {
        resolve(this.currentUser);
        return;
      }
      this.http.post('/api/validate', {}).toPromise().then((response) => {
        this.currentUser = User.parseFromJson(response);
        this.loggedIn.emit(true);
        resolve(this.currentUser);
      }, () => {
        resolve(null);
      });
    });
  }

  public getAllUser(): Promise<User[]> {
    return new Promise<User[]>((resolve, reject) => {
      this.getCurrentUser().then((user) => {
        if (!user.canManageUsers) {
          return reject('User is not authorized to manage users');
        }
        this.http.post<any[]>('/api/get-users', {}).toPromise().then((response) => {
          const users: User[] = [];
          for (let item in users) {
            users.push(User.parseFromJson(item));
          }
          resolve(users);
        }, reject);
      }, reject);
    });
  }

  public addUser(newUser: User): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getCurrentUser().then((user) => {
        if (!user.canManageUsers) {
          return reject('User is not authorized to manage users');
        }
        this.http.post('/api/register', newUser).toPromise().then(() => {
          resolve();
        }, reject);
      }, reject);
    });
  }

  public updateUser(updatedUser: User): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getCurrentUser().then((user) => {
        if (!user.canManageUsers) {
          return reject('User is not authorized to manage users');
        }
        this.http.post('/api/update-user', updatedUser).toPromise().then(() => {
          resolve();
        }, reject);
      }, reject);
    });
  }
}
