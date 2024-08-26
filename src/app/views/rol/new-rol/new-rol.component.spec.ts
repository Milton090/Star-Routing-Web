import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRolComponent } from './new-rol.component';

describe('NewRolComponent', () => {
  let component: NewRolComponent;
  let fixture: ComponentFixture<NewRolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewRolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
