import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageImageComponent } from './manage-image.component';

const routes: Routes = [
  { path: '', component: ManageImageComponent },
  { path: ':id', component: ManageImageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageImageRoutingModule { }
