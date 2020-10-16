import { Component } from '@angular/core';
import { Router } from '@angular/router';
import User from './models/user';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public loggedInUser: User = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.auth.getCurrentUser().then((result) => {
      this.loggedInUser = result;
      this.auth.loggedIn.subscribe((loggedInUser: User) => {
        this.loggedInUser = loggedInUser;
      });
    });
  }

  logOut(): void {
    this.auth.logOut().then(() => {
      this.router.navigateByUrl('/login');
    });
  }
}
