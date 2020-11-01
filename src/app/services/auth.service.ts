import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import User, { UserManagementInfo } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User = null;
  public readonly loggedIn: EventEmitter<User> = new EventEmitter<User>()

  constructor(
    private http: HttpClient
  ) {
    this.getCurrentUser().then((user) => {
      this.currentUser = user;
      this.loggedIn.emit(user);
    }, () => {
      this.loggedIn.emit(null);
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
          this.loggedIn.emit(this.currentUser);
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
          this.loggedIn.emit(null);
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
        this.loggedIn.emit(this.currentUser);
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
          for (let item of response) {
            users.push(User.parseFromJson(item));
          }
          resolve(users);
        }, reject);
      }, reject);
    });
  }

  public getAllUserForManagement(): Promise<UserManagementInfo[]> {
    return new Promise<UserManagementInfo[]>((resolve, reject) => {
      this.getCurrentUser().then((user) => {
        if (!user.canManageUsers) {
          return reject('User is not authorized to manage users');
        }
        this.http.post<any[]>('/api/get-users-full', {}).toPromise().then((response) => {
          const users: UserManagementInfo[] = [];
          for (let item of response) {
            users.push(UserManagementInfo.parseFromJson(item));
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
