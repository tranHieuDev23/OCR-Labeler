import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageRegionViewerComponent } from './image-region-viewer.component';

describe('ImageRegionViewerComponent', () => {
  let component: ImageRegionViewerComponent;
  let fixture: ComponentFixture<ImageRegionViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageRegionViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageRegionViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
