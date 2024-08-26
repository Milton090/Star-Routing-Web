import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPaquetesComponent } from './list-paquetes.component';

describe('ListPaquetesComponent', () => {
  let component: ListPaquetesComponent;
  let fixture: ComponentFixture<ListPaquetesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPaquetesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPaquetesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
