import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubberListComponent } from './rubber-list.component';

describe('RubberListComponent', () => {
  let component: RubberListComponent;
  let fixture: ComponentFixture<RubberListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RubberListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RubberListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
