import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPaqueteComponent } from './new-paquete.component';

describe('NewPaqueteComponent', () => {
  let component: NewPaqueteComponent;
  let fixture: ComponentFixture<NewPaqueteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPaqueteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPaqueteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
