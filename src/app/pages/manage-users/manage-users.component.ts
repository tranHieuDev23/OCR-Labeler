import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ManageUserModalComponent, ManageUserModalConfig } from 'src/app/components/manage-user-modal/manage-user-modal.component';
import User, { UserManagementInfo } from 'src/app/models/user';
import { compareByDisplayName, compareByLabelCount, compareByUploadCount, compareByUsername, compareByVerifyCount, reverseCompareFunc } from 'src/app/models/user-compare-funcs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {
  @ViewChild('createUserModal', { static: false }) createModal: ManageUserModalComponent;
  @ViewChild('updateUserModal', { static: false }) updateModal: ManageUserModalComponent;

  public sortOptions: any[] = [
    { label: 'Username (A-Z)', comparator: compareByUsername },
    { label: 'Username (Z-A)', comparator: reverseCompareFunc(compareByUsername) },
    { label: 'Display name (A-Z)', comparator: compareByDisplayName },
    { label: 'Display name (Z-A)', comparator: reverseCompareFunc(compareByDisplayName) },
    { label: 'Upload count (Asc.)', comparator: compareByUploadCount },
    { label: 'Upload count (Desc.)', comparator: reverseCompareFunc(compareByUploadCount) },
    { label: 'Label count (Asc.)', comparator: compareByLabelCount },
    { label: 'Label count (Desc.)', comparator: reverseCompareFunc(compareByLabelCount) },
    { label: 'Verify count (Asc.)', comparator: compareByVerifyCount },
    { label: 'Verify count (Desc.)', comparator: reverseCompareFunc(compareByVerifyCount) },
  ];
  public userComparator: (a: UserManagementInfo, b: UserManagementInfo) => number;
  public users: UserManagementInfo[] = null;
  public createModalConfig: ManageUserModalConfig;
  public updateModalConfig: ManageUserModalConfig;

  private updatedUserId: number = null;

  constructor(
    private auth: AuthService,
    private notification: NzNotificationService,
    private router: Router
  ) {
    this.userComparator = this.sortOptions[0].comparator;
    this.createModalConfig = new ManageUserModalConfig();
    this.updateModalConfig = new ManageUserModalConfig();
    this.updateModalConfig.username = false;
    this.updateModalConfig.password = false;
  }

  ngOnInit(): void {
    this.auth.getAllUser().then((users) => {
      this.users = users.sort(this.userComparator);
      console.log(this.userComparator);
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

  sortUser(): void {
    this.users = this.users.sort(this.userComparator);
    console.log(this.userComparator);
  }

  openCreateUserModal(): void {
    this.createModal.openModal(new User('', '', '', true, true, true, false));
  }

  createUser(user: User): void {
    this.auth.addUser(user).then(() => {
      this.users.push(new UserManagementInfo(user, 0, 0, 0));
      this.sortUser();
      this.notification.success(`Successfully created user ${user.displayName}`, '');
      this.createModal.closeModal();
    }, (reason) => {
      this.notification.error('Failed to create new user', `Reason: ${reason}`);
    });
  }

  openEditUserModal(id: number): void {
    this.updatedUserId = id;
    this.updateModal.openModal(this.users[id].user);
  }

  updateUser(user: User): void {
    this.auth.updateUser(user).then(() => {
      this.users[this.updatedUserId] = new UserManagementInfo(
        user,
        this.users[this.updatedUserId].uploadCount,
        this.users[this.updatedUserId].labelCount,
        this.users[this.updatedUserId].verifyCount,
      );
      this.sortUser();
      this.notification.success(`Successfully updated user ${user.displayName}`, '');
      this.updateModal.closeModal();
    }, (reason) => {
      this.notification.error('Failed to update user', `Reason: ${reason}`);
    });
  }
}
