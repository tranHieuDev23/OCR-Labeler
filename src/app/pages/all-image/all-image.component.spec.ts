import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllImageComponent } from './all-image.component';

describe('AllImageComponent', () => {
  let component: AllImageComponent;
  let fixture: ComponentFixture<AllImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllImageComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
