import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
class UserLoggedInGuard implements CanActivate {
    constructor(
        private auth: AuthService,
        private router: Router
    ) { }

    canActivate(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.auth.isUserLoggedIn().then((result) => {
                if (result) {
                    resolve(true);
                } else {
                    this.router.navigateByUrl('/login');
                    resolve(false);
                }
            }, reject);
        });
    }
}

export default UserLoggedInGuard;