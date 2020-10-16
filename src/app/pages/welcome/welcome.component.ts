import { Component, OnInit } from '@angular/core';
import User from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  public loggedInUser: User = null;
  public noPrivilege: boolean = false;

  constructor(
    private auth: AuthService
  ) {
    this.auth.getCurrentUser().then((result) => {
      this.setLoggedInUser(result);
      this.auth.loggedIn.subscribe((loggedInUser: User) => {
        this.setLoggedInUser(loggedInUser);
      });
    });
  }

  private setLoggedInUser(user: User): void {
    this.loggedInUser = user;
    this.noPrivilege = !(user.canUpload || user.canLabel || user.canVerify || user.canManageUsers);
  }

  ngOnInit() {
  }
}
