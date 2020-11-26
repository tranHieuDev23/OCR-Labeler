import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegionSelectorComponent } from './region-selector.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';


@NgModule({
  declarations: [RegionSelectorComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzRadioModule,
    NzButtonModule,
    NzIconModule
  ],
  exports: [
    RegionSelectorComponent
  ]
})
export class RegionSelectorModule { }
