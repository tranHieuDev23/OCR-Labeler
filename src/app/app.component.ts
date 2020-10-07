import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isLoggedIn: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.auth.isUserLoggedIn().then((result) => {
      this.isLoggedIn = result;
      this.auth.loggedIn.subscribe((isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;
      });
    });
  }

  logOut(): void {
    this.auth.logOut().then(() => {
      this.router.navigateByUrl('/login');
    });
  }
}
