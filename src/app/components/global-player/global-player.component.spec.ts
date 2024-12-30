import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalPlayerComponent } from './global-player.component';

describe('GlobalPlayerComponent', () => {
  let component: GlobalPlayerComponent;
  let fixture: ComponentFixture<GlobalPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
