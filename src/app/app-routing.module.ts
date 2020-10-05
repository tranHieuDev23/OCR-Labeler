import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import UserLoggedInGuard from './services/logged-in-guard';
import UserLoggedOutGuard from './services/logged-out-guard';

const routes: Routes = [
  {
    path: 'welcome',
    loadChildren: () =>
      import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
    canActivate: [UserLoggedInGuard]
  },
  {
    path: 'upload',
    loadChildren: () =>
      import('./pages/upload/upload.module').then((m) => m.UploadModule),
    canActivate: [UserLoggedInGuard]
  },
  {
    path: 'label',
    loadChildren: () =>
      import('./pages/label/label.module').then((m) => m.LabelModule),
    canActivate: [UserLoggedInGuard]
  },
  {
    path: 'verify',
    loadChildren: () =>
      import('./pages/verify/verify.module').then((m) => m.VerifyModule),
    canActivate: [UserLoggedInGuard]
  },
  {
    path: 'my-images',
    loadChildren: () =>
      import('./pages/my-images/my-images.module').then((m) => m.MyImagesModule),
    canActivate: [UserLoggedInGuard]
  },
  {
    path: 'manage-image',
    loadChildren: () =>
      import('./pages/manage-image/manage-image.module').then((m) => m.ManageImageModule),
    canActivate: [UserLoggedInGuard]
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginModule),
    canActivate: [UserLoggedOutGuard]
  },
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
