import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ManageUserModalComponent, ManageUserModalConfig } from 'src/app/components/manage-user-modal/manage-user-modal.component';
import User from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {
  @ViewChild('createUserModal', { static: false }) createModal: ManageUserModalComponent;
  @ViewChild('updateUserModal', { static: false }) updateModal: ManageUserModalComponent;

  public users: User[] = null;
  public createModalConfig: ManageUserModalConfig;
  public updateModalConfig: ManageUserModalConfig;

  private updatedUserId: number = null;

  constructor(
    private auth: AuthService,
    private notification: NzNotificationService,
    private router: Router
  ) {
    this.createModalConfig = new ManageUserModalConfig();
    this.updateModalConfig = new ManageUserModalConfig();
    this.updateModalConfig.username = false;
    this.updateModalConfig.password = false;
  }

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
    this.createModal.openModal(new User('', '', '', true, true, true, false));
  }

  createUser(user: User): void {
    this.auth.addUser(user).then(() => {
      this.users.push(user);
      this.notification.success(`Successfully created user ${user.displayName}`, '');
      this.createModal.closeModal();
    }, (reason) => {
      this.notification.error('Failed to create new user', `Reason: ${reason}`);
    });
  }

  openEditUserModal(id: number): void {
    this.updatedUserId = id;
    this.updateModal.openModal(this.users[id]);
  }

  updateUser(user: User): void {
    this.auth.updateUser(user).then(() => {
      this.users[this.updatedUserId] = user;
      this.notification.success(`Successfully updated user ${user.displayName}`, '');
      this.updateModal.closeModal();
    }, (reason) => {
      this.notification.error('Failed to update user', `Reason: ${reason}`);
    });
  }
}
