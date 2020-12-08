import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import User from '../models/user';
import { AuthService } from './auth.service';

@Injectable()
class UserLoggedInGuard implements CanActivate {
    constructor(
        private auth: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot
    ): Promise<boolean | UrlTree> {
        return new Promise<boolean | UrlTree>((resolve, reject) => {
            this.auth.getCurrentUser().then((user) => {
                if (!user) {
                    return resolve(this.router.parseUrl('/login'));
                }
                if (!this.isUserAuthorized(route, user)) {
                    return resolve(this.router.parseUrl('/welcome'));
                }
                return resolve(true);
            }, reject);
        });
    }

    private isUserAuthorized(route: ActivatedRouteSnapshot, user: User): boolean {
        if (route.url.length == 0) {
            return true;
        }
        switch (route.url[0].path) {
            case 'upload':
            case 'manage-image':
            case 'my-images':
                return user.canUpload;
            case 'label':
                return user.canLabel;
            case 'verify':
                return user.canVerify;
            case 'export':
                return user.canExport;
            case 'manage-users':
                return user.canManageUsers;
            case 'all-image':
                return user.canManageAllImage;
            default:
                return true;
        }
    }
}

export default UserLoggedInGuard;