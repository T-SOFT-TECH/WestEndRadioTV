import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEventsManagementComponent } from './admin-events-management.component';

describe('AdminEventsManagementComponent', () => {
  let component: AdminEventsManagementComponent;
  let fixture: ComponentFixture<AdminEventsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEventsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEventsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
