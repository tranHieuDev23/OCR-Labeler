import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public username: string = "";
  public password: string = "";

  constructor(
    private auth: AuthService,
    private router: Router,
    private notification: NzNotificationService
  ) { }

  login(): void {
    if (this.username.length == 0 || this.password.length == 0) {
      return;
    }
    this.auth.login(this.username, this.password).then((user) => {
      this.router.navigateByUrl('/welcome');
    }, (reason) => {
      this.notification.error('Login failed', `Reason: ${reason}`);
    });
  }
}
