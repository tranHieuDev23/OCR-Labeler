import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import UserLoggedInGuard from './services/logged-in-guard';
import UserLoggedOutGuard from './services/logged-out-guard';
import { NzIconModule, NZ_ICONS } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import {
  UserOutline,
  EditOutline,
  ZoomInOutline,
  ZoomOutOutline,
  UndoOutline,
  ExportOutline,
  PlusOutline,
  DeleteOutline,
  CheckCircleOutline,
  LeftOutline,
  RightOutline,
  InboxOutline,
  AppstoreOutline
} from '@ant-design/icons-angular/icons';
import { DragToSelectModule } from 'ngx-drag-to-select';

const icons: IconDefinition[] = [UserOutline,
  EditOutline,
  ZoomInOutline,
  ZoomOutOutline,
  UndoOutline,
  ExportOutline,
  PlusOutline,
  DeleteOutline,
  CheckCircleOutline,
  LeftOutline,
  RightOutline,
  InboxOutline,
  AppstoreOutline,
];

registerLocaleData(vi);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    NzBackTopModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DragToSelectModule.forRoot()
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    UserLoggedInGuard,
    UserLoggedOutGuard,
    { provide: NZ_ICONS, useValue: icons }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
