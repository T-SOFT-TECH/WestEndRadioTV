import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveBadgeComponent } from './live-badge.component';

describe('LiveBadgeComponent', () => {
  let component: LiveBadgeComponent;
  let fixture: ComponentFixture<LiveBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
