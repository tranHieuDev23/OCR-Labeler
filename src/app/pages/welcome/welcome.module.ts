import { NgModule } from '@angular/core';

import { WelcomeRoutingModule } from './welcome-routing.module';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule, NZ_ICONS } from 'ng-zorro-antd/icon';
import { WelcomeComponent } from './welcome.component';
import { IconDefinition } from '@ant-design/icons-angular';
import { EditOutline, UploadOutline, SearchOutline } from '@ant-design/icons-angular/icons';

const icons: IconDefinition[] = [EditOutline, UploadOutline, SearchOutline];


@NgModule({
  imports: [WelcomeRoutingModule, NzTypographyModule, NzButtonModule, NzIconModule],
  declarations: [WelcomeComponent],
  exports: [WelcomeComponent],
  providers: [
    { provide: NZ_ICONS, useValue: icons }
  ]
})
export class WelcomeModule { }
