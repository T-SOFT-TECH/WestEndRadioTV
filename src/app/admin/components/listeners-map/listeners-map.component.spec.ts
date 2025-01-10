import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListenersMapComponent } from './listeners-map.component';

describe('ListenersMapComponent', () => {
  let component: ListenersMapComponent;
  let fixture: ComponentFixture<ListenersMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListenersMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListenersMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
