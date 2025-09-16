import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClauseDialogComponent } from './add-clause-dialog.component';

describe('AddClauseDialogComponent', () => {
  let component: AddClauseDialogComponent;
  let fixture: ComponentFixture<AddClauseDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddClauseDialogComponent]
    });
    fixture = TestBed.createComponent(AddClauseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
