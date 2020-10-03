import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';

@NgModule({
  imports: [CommonModule, LoginRoutingModule, NzFormModule, NzInputModule, NzButtonModule, NzGridModule],
  declarations: [LoginComponent],
  exports: [LoginComponent],
})
export class LoginModule { }
