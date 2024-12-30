import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklySchedulesComponent } from './weekly-schedules.component';

describe('WeeklySchedulesComponent', () => {
  let component: WeeklySchedulesComponent;
  let fixture: ComponentFixture<WeeklySchedulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklySchedulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklySchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
