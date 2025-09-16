import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ContractGeneratorService } from '../../../services/contract-generator.service';
import { Template } from '../../../interfaces/contract.interface';

@Component({
  selector: 'app-template-library-dialog',
  templateUrl: './template-library-dialog.component.html',
  styleUrls: ['./template-library-dialog.component.scss']
})
export class TemplateLibraryDialogComponent implements OnInit {
  templates: Template[] = [];
  filteredTemplates: Template[] = [];
  searchTerm = '';
  selectedCategory = '';
  categories: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<TemplateLibraryDialogComponent>,
    private generator: ContractGeneratorService
  ) {}

  ngOnInit(): void {
    this.generator.getTemplates().subscribe(templates => {
      this.templates = templates;
      this.categories = ['All', ...Array.from(new Set(templates.map(template => template.category)))];
      this.filterTemplates();
    });
  }

  onSearchChange(): void {
    this.filterTemplates();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterTemplates();
  }

  private filterTemplates(): void {
    const searchLower = this.searchTerm.toLowerCase();
    
    this.filteredTemplates = this.templates.filter(template => {
      const matchesSearch = !this.searchTerm || 
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower);

      const matchesCategory = !this.selectedCategory || 
        this.selectedCategory === 'All' || 
        template.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  applyTemplate(template: Template): void {
    this.generator.applyTemplate(template);
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  getTemplateIcon(category: string): string {
    switch (category) {
      case 'Business': return 'business';
      case 'Legal': return 'gavel';
      case 'HR': return 'people';
      case 'Real Estate': return 'home';
      default: return 'description';
    }
  }
}