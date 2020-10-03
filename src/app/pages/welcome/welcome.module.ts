import { NgModule } from '@angular/core';

import { WelcomeRoutingModule } from './welcome-routing.module';
import { NzTypographyModule } from "ng-zorro-antd/typography";
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { WelcomeComponent } from './welcome.component';


@NgModule({
  imports: [WelcomeRoutingModule, NzTypographyModule, NzButtonModule, NzIconModule],
  declarations: [WelcomeComponent],
  exports: [WelcomeComponent]
})
export class WelcomeModule { }
