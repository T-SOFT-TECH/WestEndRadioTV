import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedShowsComponent } from './featured-shows.component';

describe('FeaturedShoiwsComponent', () => {
  let component: FeaturedShowsComponent;
  let fixture: ComponentFixture<FeaturedShowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedShowsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedShowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
