import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClauseLibraryDialogComponent } from './clause-library-dialog.component';

describe('ClauseLibraryDialogComponent', () => {
  let component: ClauseLibraryDialogComponent;
  let fixture: ComponentFixture<ClauseLibraryDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClauseLibraryDialogComponent]
    });
    fixture = TestBed.createComponent(ClauseLibraryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
