import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import User from 'src/app/models/user';
import { validateDisplayName, validatePassword, validateUsername } from 'src/app/models/user-validate-funcs';

export class ManageUserModalConfig {
  public username: boolean = true;
  public password: boolean = true;
  public displayName: boolean = true;
  public canUpload: boolean = true;
  public canLabel: boolean = true;
  public canVerify: boolean = true;
  public canExport: boolean = true;
  public canManageUsers: boolean = true;
}

@Component({
  selector: 'app-manage-user-modal',
  templateUrl: './manage-user-modal.component.html',
  styleUrls: ['./manage-user-modal.component.scss']
})
export class ManageUserModalComponent implements OnInit {
  @Input('title') title: string;
  @Input('config') config: ManageUserModalConfig = new ManageUserModalConfig();

  @Output('cancel') cancel: EventEmitter<void> = new EventEmitter<void>();
  @Output('submit') submit: EventEmitter<User> = new EventEmitter<User>();

  showModal: boolean = false;
  formGroup: FormGroup;

  constructor(
    formBuilder: FormBuilder
  ) {
    this.formGroup = formBuilder.group({
      username: ['', [this.usernameValidator()]],
      password: ['', [this.passwordValidator()]],
      checkPassword: ['', [this.checkPasswordValidator()]],
      displayName: ['', [this.displayNameValidator()]],
      canUpload: [true],
      canLabel: [true],
      canVerify: [true],
      canExport: [false],
      canManageUsers: [false],
    });
  }

  private usernameValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      if (!this.config.username) {
        return null;
      }
      const username: string = control.value;
      return validateUsername(username);
    };
  }

  private passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      if (!this.config.password) {
        return null;
      }
      const password: string = control.value;
      return validatePassword(password);
    };
  }

  private checkPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      if (!this.config.password) {
        return null;
      }
      if (!control.value) {
        return { error: true, required: true };
      }
      if (control.value != this.formGroup.controls.password.value) {
        return { error: true, checkPassword: true };
      }
      return null;
    };
  }


  private displayNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [k: string]: boolean } | null => {
      if (!this.config.displayName) {
        return null;
      }
      const displayName: string = control.value;
      return validateDisplayName(displayName);
    };
  }

  ngOnInit(): void { }

  openModal(baseUser: User): void {
    this.formGroup.reset(baseUser);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onCancel(): void {
    this.closeModal();
  }

  onSubmit(): void {
    this.formGroup.updateValueAndValidity();
    if (this.formGroup.invalid) {
      return;
    }
    this.submit.emit(User.parseFromJson(this.formGroup.value));
  }
}
