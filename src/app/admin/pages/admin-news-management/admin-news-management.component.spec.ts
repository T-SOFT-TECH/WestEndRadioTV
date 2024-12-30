import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNewsManagementComponent } from './admin-news-management.component';

describe('AdminNewsManagementComponent', () => {
  let component: AdminNewsManagementComponent;
  let fixture: ComponentFixture<AdminNewsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNewsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNewsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
