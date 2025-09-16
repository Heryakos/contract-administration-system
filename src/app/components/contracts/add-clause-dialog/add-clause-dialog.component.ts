import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Clause } from '../../../interfaces/contract.interface';
import { ContractGeneratorService } from '../../../services/contract-generator.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-clause-dialog',
  templateUrl: './add-clause-dialog.component.html',
  styleUrls: ['./add-clause-dialog.component.scss']
})
export class AddClauseDialogComponent {
  clause: Clause = {
    title: '', content: '', category: '', tags: [],
    id: ''
  };
  categories: string[] = [];
  newCategory = '';
  tagsInput = '';

  constructor(
    private dialogRef: MatDialogRef<AddClauseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categories: string[] },
    private generator: ContractGeneratorService
  ) {
    this.categories = data.categories;
  }

  onSubmit(form: NgForm): void {
    if (form && form.valid) {
      const finalClause: Clause = {
        ...this.clause,
        id: this.clause.id || `clause-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        category: this.clause.category === 'new' ? this.newCategory : this.clause.category,
        tags: this.tagsInput ? this.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };
      this.generator.addClause(finalClause);
      this.dialogRef.close(finalClause);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}