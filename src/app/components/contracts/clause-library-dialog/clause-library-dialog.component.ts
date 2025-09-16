import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ContractGeneratorService } from '../../../services/contract-generator.service';
import { Clause } from '../../../interfaces/contract.interface';
import { AddClauseDialogComponent } from '../add-clause-dialog/add-clause-dialog.component';

@Component({
  selector: 'app-clause-library-dialog',
  templateUrl: './clause-library-dialog.component.html',
  styleUrls: ['./clause-library-dialog.component.scss']
})
export class ClauseLibraryDialogComponent implements OnInit {
  clauses: Clause[] = [];
  filteredClauses: Clause[] = [];
  searchTerm = '';
  selectedCategory = '';
  categories: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<ClauseLibraryDialogComponent>,
    private dialog: MatDialog, // Inject MatDialog
    private generator: ContractGeneratorService
  ) {}

  ngOnInit(): void {
    this.generator.getClauses().subscribe(clauses => {
      this.clauses = clauses;
      this.categories = ['All', ...Array.from(new Set(clauses.map(clause => clause.category)))];
      this.filterClauses();
    });
  }

  onSearchChange(): void {
    this.filterClauses();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterClauses();
  }

  private filterClauses(): void {
    const searchLower = this.searchTerm.toLowerCase();
    
    this.filteredClauses = this.clauses.filter(clause => {
      const matchesSearch = !this.searchTerm || 
        clause.title.toLowerCase().includes(searchLower) ||
        clause.content.toLowerCase().includes(searchLower) ||
        clause.tags.some(tag => tag.toLowerCase().includes(searchLower));

      const matchesCategory = !this.selectedCategory || 
        this.selectedCategory === 'All' || 
        clause.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  insertClause(clause: Clause): void {
    this.generator.insertClause({
      title: clause.title,
      content: clause.content
    });
    this.dialogRef.close();
  }

  openAddClauseDialog(): void {
    const dialogRef = this.dialog.open(AddClauseDialogComponent, {
      width: '600px',
      data: { categories: this.categories.filter(cat => cat !== 'All') } // Pass categories excluding 'All'
    });

    dialogRef.afterClosed().subscribe((newClause: Clause | undefined) => {
      if (newClause) {
        this.clauses.push(newClause);
        this.categories = ['All', ...Array.from(new Set(this.clauses.map(clause => clause.category)))];
        this.filterClauses();
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}