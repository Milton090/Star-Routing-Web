import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListNovedadesComponent } from './list-novedades.component';

describe('ListNovedadesComponent', () => {
  let component: ListNovedadesComponent;
  let fixture: ComponentFixture<ListNovedadesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListNovedadesComponent]
    });
    fixture = TestBed.createComponent(ListNovedadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
