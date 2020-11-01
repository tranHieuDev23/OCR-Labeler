import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllImageComponent } from './all-image.component';

const routes: Routes = [
  { path: '', component: AllImageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllImageRoutingModule { }
