import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'welcome',
    loadChildren: () =>
      import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
  },
  {
    path: 'upload',
    loadChildren: () =>
      import('./pages/upload/upload.module').then((m) => m.UploadModule),
  },
  {
    path: 'label',
    loadChildren: () =>
      import('./pages/label/label.module').then((m) => m.LabelModule),
  },
  {
    path: 'verify',
    loadChildren: () =>
      import('./pages/verify/verify.module').then((m) => m.VerifyModule),
  },
  {
    path: 'my-images',
    loadChildren: () =>
      import('./pages/my-images/my-images.module').then((m) => m.MyImagesModule),
  },
  {
    path: 'manage-image',
    loadChildren: () =>
      import('./pages/manage-image/manage-image.module').then((m) => m.ManageImageModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginModule),
  },
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
