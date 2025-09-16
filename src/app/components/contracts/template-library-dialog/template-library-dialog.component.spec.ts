import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateLibraryDialogComponent } from './template-library-dialog.component';

describe('TemplateLibraryDialogComponent', () => {
  let component: TemplateLibraryDialogComponent;
  let fixture: ComponentFixture<TemplateLibraryDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TemplateLibraryDialogComponent]
    });
    fixture = TestBed.createComponent(TemplateLibraryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
