import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPaqueteComponent } from './edit-paquete.component';

describe('EditPaqueteComponent', () => {
  let component: EditPaqueteComponent;
  let fixture: ComponentFixture<EditPaqueteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPaqueteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPaqueteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
