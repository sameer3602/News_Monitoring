import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchStoriesComponent } from './fetch-stories.component';

describe('FetchStoriesComponent', () => {
  let component: FetchStoriesComponent;
  let fixture: ComponentFixture<FetchStoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FetchStoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FetchStoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
