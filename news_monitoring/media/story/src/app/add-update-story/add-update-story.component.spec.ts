import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateStoryComponent } from './add-update-story.component';

describe('AddUpdateStoryComponent', () => {
  let component: AddUpdateStoryComponent;
  let fixture: ComponentFixture<AddUpdateStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateStoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
