import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegionSelectorComponent } from './region-selector.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [RegionSelectorComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzRadioModule
  ],
  exports: [
    RegionSelectorComponent
  ]
})
export class RegionSelectorModule { }
