import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import User from 'src/app/models/user';

export class ManageUserModalConfig {
  public username: boolean = true;
  public password: boolean = true;
  public displayName: boolean = true;
  public canUpload: boolean = true;
  public canLabel: boolean = true;
  public canVerify: boolean = true;
  public canManageUsers: boolean = true;
}

@Component({
  selector: 'app-manage-user-modal',
  templateUrl: './manage-user-modal.component.html',
  styleUrls: ['./manage-user-modal.component.scss']
})
export class ManageUserModalComponent implements OnInit {
  @Input('title') title: string;
  @Input('config') config: ManageUserModalConfig;

  @Output('cancel') cancel: EventEmitter<void> = new EventEmitter<void>();
  @Output('submit') submit: EventEmitter<User> = new EventEmitter<User>();

  baseUser: User = null;

  constructor() { }

  ngOnInit(): void {
  }

  openModal(baseUser: User): void {
    this.baseUser = User.parseFromJson(baseUser);
  }

  closeModal(): void {
    this.baseUser = null;
  }

  onCancel(): void {
    this.closeModal();
  }

  onSubmit(): void {
    this.submit.emit(this.baseUser);
  }
}
