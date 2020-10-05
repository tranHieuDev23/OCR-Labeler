import { Injectable } from "@angular/core";
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
class UserLoggedOutGuard implements CanActivate {
    constructor(
        private auth: AuthService,
        private router: Router
    ) { }

    canActivate(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.auth.isUserLoggedIn().then((result) => {
                if (result) {
                    this.router.navigateByUrl('/welcome');
                    resolve(false);
                } else {
                    resolve(true);
                }
            }, reject);
        });
    }
}

export default UserLoggedOutGuard;