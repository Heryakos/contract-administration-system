import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ClauseGeneratorService, ClauseModel, CreateClauseDto } from '../../services/clause-generator.service';
import { ExportService } from '../../../../services/export.service';
import { ContractBlock, ContractMetadata, ContractCustomization } from '../../../../interfaces/contract-generator.interface';

@Component({
  selector: 'app-clause-generator',
  templateUrl: './clause-generator.component.html',
  styleUrls: ['./clause-generator.component.scss']
})
export class ClauseGeneratorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  clauseForm!: FormGroup;
  isCreating = false;
  isSubmitting = false;

  categories: string[] = [];
  availableTags: string[] = [];
  selectedTags: string[] = [];

  // Preview settings
  showPreview = true;
  previewContent = '';

  constructor(
    private fb: FormBuilder,
    private clauseGeneratorService: ClauseGeneratorService,
    private exportService: ExportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
    this.loadAvailableTags(); // This will now work
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.clauseForm = this.fb.group({
      clauseTitle: ['', [Validators.required, Validators.maxLength(300)]],
      clauseContent: ['', [Validators.required]],
      clauseCategory: ['', [Validators.required]],
      tags: [[]]
    });
  }

  private loadCategories(): void {
    this.clauseGeneratorService.getClauseCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories: string[]) => {
          this.categories = categories;
        },
        error: (error: any) => {
          console.error('Error loading categories:', error);
          this.snackBar.open('Error loading categories. Using default list.', 'Close', { duration: 3000 });
          // Fallback to default categories
          this.categories = ['Legal', 'Financial', 'Payment Terms', 'Delivery Terms', 'Warranty', 'Liability', 'Termination', 'Force Majeure', 'Confidentiality', 'Intellectual Property', 'Dispute Resolution', 'Governing Law', 'General'];
        }
      });
  }

  private loadAvailableTags(): void {
    // Try to load from API first, fallback to default if it fails
    this.clauseGeneratorService.getDefaultClauseTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tags: string[]) => {
          this.availableTags = tags;
        },
        error: (error: any) => {
          console.error('Error loading tags from API:', error);
          // Fallback to default tags
          this.availableTags = this.clauseGeneratorService.getDefaultClauseTagsFallback();
          this.snackBar.open('Using default tags.', 'Close', { duration: 2000 });
        }
      });
  }

  private setupFormSubscriptions(): void {
    this.clauseForm.get('clauseContent')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(content => {
        this.updatePreview(content || '');
      });
  }

  private updatePreview(content: string): void {
    // Simple preview - in real implementation, you might want to render markdown or rich text
    this.previewContent = content;
  }

  onTagSelectionChange(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.clauseForm.patchValue({ tags: [...this.selectedTags] }); // Create new array to trigger change detection
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  addCustomTag(event: any): void {
    const value = event.target.value.trim();
    if (value && !this.selectedTags.includes(value) && !this.availableTags.includes(value)) {
      this.availableTags.push(value); // Add to available tags for future use
      this.selectedTags.push(value);
      this.clauseForm.patchValue({ tags: [...this.selectedTags] });
      event.target.value = '';
    }
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.clauseForm.patchValue({ tags: [...this.selectedTags] });
    }
  }

  saveDraft(): void {
    if (this.clauseForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isCreating = true;
    const formValue = this.clauseForm.value;
    
    // Fixed: Removed createdByUserID and added status
    const createDto: CreateClauseDto = {
      clauseTitle: formValue.clauseTitle,
      clauseContent: formValue.clauseContent,
      clauseCategory: formValue.clauseCategory,
      clauseTags: JSON.stringify(formValue.tags || []),
      status: 'Draft' // Explicitly set status for draft
    };

    this.clauseGeneratorService.createClause(createDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open('Clause saved as draft successfully!', 'Close', { duration: 3000 });
          this.resetForm();
          this.isCreating = false;
        },
        error: (error) => {
          console.error('Error saving clause:', error);
          this.snackBar.open('Error saving clause. Please try again.', 'Close', { duration: 5000 });
          this.isCreating = false;
        }
      });
  }

  submitForApproval(): void {
    if (this.clauseForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    // First save the clause as draft
    this.isCreating = true;
    const formValue = this.clauseForm.value;
    
    // Fixed: Removed createdByUserID and added status
    const createDto: CreateClauseDto = {
      clauseTitle: formValue.clauseTitle,
      clauseContent: formValue.clauseContent,
      clauseCategory: formValue.clauseCategory,
      clauseTags: JSON.stringify(formValue.tags || []),
      status: 'Draft' // Create as draft first
    };

    this.clauseGeneratorService.createClause(createDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Now submit for approval - Fixed: Use clauseID and only pass id parameter
          this.isSubmitting = true;
          this.clauseGeneratorService.submitForApproval(response.clauseID!)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (approvalResponse) => {
                this.snackBar.open('Clause submitted for approval successfully!', 'Close', { duration: 3000 });
                this.resetForm();
                this.isCreating = false;
                this.isSubmitting = false;
              },
              error: (error) => {
                console.error('Error submitting for approval:', error);
                this.snackBar.open('Clause saved but failed to submit for approval.', 'Close', { duration: 5000 });
                this.isCreating = false;
                this.isSubmitting = false;
              }
            });
        },
        error: (error) => {
          console.error('Error saving clause:', error);
          this.snackBar.open('Error saving clause. Please try again.', 'Close', { duration: 5000 });
          this.isCreating = false;
        }
      });
  }

  exportToPDF(): void {
    const content = this.clauseForm.get('clauseContent')?.value;
    const title = this.clauseForm.get('clauseTitle')?.value || 'Clause';
    
    if (!content) {
      this.snackBar.open('Please add content before exporting.', 'Close', { duration: 3000 });
      return;
    }

    // Create a simple block structure for export
    const blocks: ContractBlock[] = [
      {
        id: '1',
        type: 'heading',
        label: title
      },
      {
        id: '2',
        type: 'text',
        label: 'Clause Content',
        value: content
      },
      {
        id: '3',
        type: 'text',
        label: 'Category',
        value: this.clauseForm.get('clauseCategory')?.value || 'General'
      }
    ];

    const metadata: ContractMetadata = {
      templateId: '',
      partyA: '',
      partyB: '',
      effectiveDate: new Date().toISOString(),
      contractValue: 0,
      currency: 'USD',
      jurisdiction: '',
      language: 'en',
      version: '1.0',
      contractTypeID: undefined,
      categoryID: undefined,
      vendorID: undefined,
      riskLevel: 'Low',
      duration: 12
    };

    const customization: ContractCustomization = {
      theme: {
        primaryColor: '#007acc',
        secondaryColor: '#6c757d',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        accentColor: '#28a745'
      },
      typography: {
        fontFamily: 'Arial',
        fontSize: 14,
        lineHeight: 1.6,
        headingScale: 1.25
      },
      layout: {
        margins: 40,
        spacing: 16,
        columns: 1,
        pageSize: 'A4',
        orientation: 'portrait'
      },
      branding: {
        logo: '',
        companyName: '',
        address: '',
        phone: '',
        email: '',
        website: ''
      },
      features: {
        showLineNumbers: false,
        showWatermark: false,
        enableComments: false,
        trackChanges: false,
        requireSignatures: false,
        autoSave: false
      }
    };

    this.exportService.exportToPDF(blocks, metadata, customization)
      .then(() => {
        this.snackBar.open('Clause exported to PDF successfully!', 'Close', { duration: 3000 });
      })
      .catch((error) => {
        console.error('Export error:', error);
        this.snackBar.open('Error exporting to PDF', 'Close', { duration: 3000 });
      });
  }

  print(): void {
    const content = this.clauseForm.get('clauseContent')?.value;
    if (!content) {
      this.snackBar.open('Please add content before printing.', 'Close', { duration: 3000 });
      return;
    }

    const title = this.clauseForm.get('clauseTitle')?.value || 'Clause';
    const category = this.clauseForm.get('clauseCategory')?.value || 'General';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { 
                font-family: 'Times New Roman', serif; 
                margin: 40px; 
                line-height: 1.6;
                color: #333;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #007acc;
                padding-bottom: 15px;
              }
              h1 { 
                color: #007acc; 
                margin: 0 0 10px 0;
                font-size: 24px;
              }
              .meta {
                color: #666;
                font-size: 14px;
                margin: 5px 0;
              }
              .content { 
                white-space: pre-wrap; 
                margin: 20px 0;
                padding: 20px;
                background: #f9f9f9;
                border-left: 4px solid #007acc;
                font-size: 14px;
              }
              .category {
                background: #e3f2fd;
                padding: 8px 12px;
                border-radius: 4px;
                display: inline-block;
                margin-bottom: 15px;
                font-weight: 500;
              }
              @media print {
                body { margin: 0; }
                .header { page-break-after: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${title}</h1>
              <div class="meta">Category: <span class="category">${category}</span></div>
              <div class="meta">Generated: ${new Date().toLocaleDateString()}</div>
            </div>
            <div class="content">${content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  resetForm(): void {
    this.clauseForm.reset();
    this.selectedTags = [];
    this.previewContent = '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clauseForm.controls).forEach(key => {
      const control = this.clauseForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.clauseForm.get(fieldName);
    if (control?.hasError('required')) {
      const labels = {
        clauseTitle: 'Clause title',
        clauseContent: 'Clause content',
        clauseCategory: 'Category'
      };
      return `${labels[fieldName as keyof typeof labels] || fieldName} is required`;
    }
    if (control?.hasError('maxlength')) {
      return 'This field is too long (max 300 characters)';
    }
    return '';
  }
}