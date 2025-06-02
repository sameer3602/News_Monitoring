import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateSourceComponent } from './add-update-source.component';

describe('AddUpdateSourceComponent', () => {
  let component: AddUpdateSourceComponent;
  let fixture: ComponentFixture<AddUpdateSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateSourceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
