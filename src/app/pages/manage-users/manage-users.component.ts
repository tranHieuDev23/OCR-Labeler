import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import User from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {
  public users: User[] = null;
  public createdUser: User = null;
  public edittedUserId: number = null;
  public edittedUser: User = null;

  constructor(
    private auth: AuthService,
    private notification: NzNotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.auth.getAllUser().then((users) => {
      this.users = users;
    }, (reason) => {
      this.notification.error('Failed to load all user data', `Reason: ${reason}`);
      this.router.navigateByUrl('/');
    });
  }

  getUserPermissionString(user: User): string {
    let result: string = '';
    if (user.canUpload) {
      result += 'Upload';
    }
    if (user.canLabel) {
      if (result.length > 0) {
        result += ', ';
      }
      result += 'Label'
    }
    if (user.canVerify) {
      if (result.length > 0) {
        result += ', ';
      }
      result += 'Verify'
    }
    if (user.canManageUsers) {
      if (result.length > 0) {
        result += ', ';
      }
      result += 'Manage users'
    }
    if (result.length == 0) {
      result = 'Do nothing';
    }
    return result;
  }

  openCreateUserModal(): void {
    this.createdUser = new User('', '', '', true, true, true, false);
  }

  cancelCreateUserModal(): void {
    this.createdUser = null;
  }

  createUser(): void {
    this.auth.addUser(this.createdUser).then(() => {
      this.users.push(this.createdUser);
      this.cancelCreateUserModal();
    }, (reason) => {
      this.notification.error('Failed to create new user', `Reason: ${reason}`);
    });
  }

  openEditUserModal(id: number): void {
    this.edittedUser = this.users[id];
    this.edittedUserId = id;
  }

  cancelEditUserModal(): void {
    this.edittedUser = null;
    this.edittedUserId = null;
  }

  editUser(): void {
    this.auth.updateUser(this.edittedUser).then(() => {
      this.users[this.edittedUserId] = this.edittedUser;
      this.cancelEditUserModal();
    }, (reason) => {
      this.notification.error('Failed to update user', `Reason: ${reason}`);
    });
  }
}
