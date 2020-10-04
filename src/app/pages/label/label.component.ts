import { Component, OnInit } from '@angular/core';
import TextRegion from 'src/app/models/text-region';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent implements OnInit {
  public textRegions: TextRegion[] = [];
  public selectedId: number = 0;
  public selectedRegion: TextRegion = null;
  public canLabelSelected: boolean = false;
  public selectedLabel: string = '';
  public isVisible: boolean = false;

  constructor(
    private backend: BackendService
  ) { }

  ngOnInit(): void {
    this.backend.loadRegionsForLabel('123', 10).then((result) => {
      this.textRegions = result;
    }, (reason) => {

    });
  }

  showModal(id: number): void {
    this.selectedId = id;
    this.selectedRegion = this.textRegions[id];
    this.canLabelSelected = false;
    this.selectedLabel = '';
    this.isVisible = true;
  }

  hideModal(): void {
    this.selectedId = 0;
    this.selectedRegion = null;
    this.canLabelSelected = false;
    this.selectedLabel = '';
    this.isVisible = false;
  }

  submit(): void {
    this.backend.labelRegion(this.selectedRegion, this.canLabelSelected, this.selectedLabel).then(() => {
      this.backend.loadRegionsForLabel("123", 1).then((result) => {
        this.textRegions[this.selectedId] = result[0];
        this.hideModal();
      }, (reason) => {

      });
    }, (reason) => {

    });
  }
}
