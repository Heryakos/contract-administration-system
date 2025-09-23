import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { TemplateGeneratorService, TemplateModel, CreateTemplateDto } from '../../services/template-generator.service';
import { ContractBlock } from '../../../../interfaces/contract-generator.interface';

@Component({
  selector: 'app-template-generator',
  templateUrl: './template-generator.component.html',
  styleUrls: ['./template-generator.component.scss']
})
export class TemplateGeneratorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  templateForm!: FormGroup;
  isSaving = false;
  isSubmitting = false;

  categories = [
    'Service Agreement',
    'Purchase Order',
    'Employment Contract',
    'NDA',
    'License Agreement',
    'Partnership Agreement',
    'Consulting Agreement',
    'Lease Agreement',
    'Sales Contract',
    'Maintenance Agreement'
  ];

  blockTypes = [
    { type: 'heading', icon: 'article', label: 'Heading' },
    { type: 'text', icon: 'text_fields', label: 'Text Block' },
    { type: 'date', icon: 'calendar_today', label: 'Date Field' },
    { type: 'number', icon: 'pin', label: 'Number Field' },
    { type: 'list', icon: 'format_list_bulleted', label: 'List' },
    { type: 'table', icon: 'table_chart', label: 'Table' },
    { type: 'signature', icon: 'draw', label: 'Signature Block' },
    { type: 'conditional', icon: 'settings', label: 'Conditional Text' },
    { type: 'divider', icon: 'horizontal_rule', label: 'Divider' }
  ];

  templateBlocks: ContractBlock[] = [];

  constructor(
    private fb: FormBuilder,
    private templateService: TemplateGeneratorService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
    this.initializeDefaultBlocks();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.templateForm = this.fb.group({
      templateName: ['', [Validators.required, Validators.minLength(3)]],
      templateDescription: [''],
      templateCategory: ['', Validators.required],
      modificationNotes: ['']
    });
  }

  private initializeDefaultBlocks(): void {
    this.templateBlocks = [
      {
        id: 'title-block',
        type: 'heading',
        label: 'Contract Title',
        value: '{{ContractTitle}}',
        required: true
      },
      {
        id: 'parties-block',
        type: 'text',
        label: 'Parties',
        value: 'This agreement is entered into between {{PartyA}} and {{PartyB}}.',
        required: true
      },
      {
        id: 'effective-date',
        type: 'date',
        label: 'Effective Date',
        value: '{{EffectiveDate}}',
        required: true
      }
    ];
  }

  addBlock(type: ContractBlock['type']): void {
    const newBlock: ContractBlock = {
      id: `block-${Date.now()}`,
      type: type,
      label: this.getBlockLabel(type),
      value: this.getDefaultValue(type),
      required: false
    };
    this.templateBlocks.push(newBlock);
  }

  removeBlock(id: string): void {
    this.templateBlocks = this.templateBlocks.filter(block => block.id !== id);
  }

  updateBlock(id: string, updates: Partial<ContractBlock>): void {
    const index = this.templateBlocks.findIndex(block => block.id === id);
    if (index !== -1) {
      this.templateBlocks[index] = { ...this.templateBlocks[index], ...updates };
    }
  }

  duplicateBlock(block: ContractBlock): void {
    const duplicatedBlock: ContractBlock = {
      ...block,
      id: `block-${Date.now()}`
    };
    this.templateBlocks.push(duplicatedBlock);
  }

  private getBlockLabel(type: ContractBlock['type']): string {
    const blockType = this.blockTypes.find(bt => bt.type === type);
    return blockType ? blockType.label : 'Block';
  }

  private getDefaultValue(type: ContractBlock['type']): string {
    switch (type) {
      case 'heading':
        return '{{Heading}}';
      case 'text':
        return '{{TextContent}}';
      case 'date':
        return '{{Date}}';
      case 'number':
        return '{{Number}}';
      case 'list':
        return '{{ListItems}}';
      case 'table':
        return '{{TableData}}';
      case 'signature':
        return '{{Signature}}';
      case 'conditional':
        return '{{ConditionalText}}';
      case 'divider':
        return '';
      default:
        return '';
    }
  }

  onSaveDraft(): void {
    if (this.templateForm.valid && this.templateBlocks.length > 0) {
      this.isSaving = true;
      const formData = this.templateForm.value;
      
      const templateData: CreateTemplateDto = {
        templateName: formData.templateName,
        templateDescription: formData.templateDescription,
        templateCategory: formData.templateCategory,
        templateContent: JSON.stringify(this.templateBlocks),
        modificationNotes: formData.modificationNotes,
        status: 'Draft'
      };

      this.templateService.createTemplate(templateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isSaving = false;
            this.snackBar.open('Template saved as draft successfully!', 'Close', { duration: 3000 });
            this.resetForm();
          },
          error: (error) => {
            this.isSaving = false;
            this.snackBar.open('Error saving template', 'Close', { duration: 3000 });
            console.error('Error saving template:', error);
          }
        });
    } else {
      this.markFormGroupTouched();
      if (this.templateBlocks.length === 0) {
        this.snackBar.open('Please add at least one block to the template', 'Close', { duration: 3000 });
      }
    }
  }

  onSubmitForApproval(): void {
    if (this.templateForm.valid && this.templateBlocks.length > 0) {
      this.isSubmitting = true;
      const formData = this.templateForm.value;
      
      const templateData: CreateTemplateDto = {
        templateName: formData.templateName,
        templateDescription: formData.templateDescription,
        templateCategory: formData.templateCategory,
        templateContent: JSON.stringify(this.templateBlocks),
        modificationNotes: formData.modificationNotes,
        status: 'Under Review'
      };

      this.templateService.createTemplate(templateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.snackBar.open('Template submitted for approval successfully!', 'Close', { duration: 3000 });
            this.resetForm();
          },
          error: (error) => {
            this.isSubmitting = false;
            this.snackBar.open('Error submitting template', 'Close', { duration: 3000 });
            console.error('Error submitting template:', error);
          }
        });
    } else {
      this.markFormGroupTouched();
      if (this.templateBlocks.length === 0) {
        this.snackBar.open('Please add at least one block to the template', 'Close', { duration: 3000 });
      }
    }
  }

  onPreview(): void {
    if (this.templateForm.valid && this.templateBlocks.length > 0) {
      this.snackBar.open('Preview functionality coming soon!', 'Close', { duration: 3000 });
    } else {
      this.markFormGroupTouched();
      if (this.templateBlocks.length === 0) {
        this.snackBar.open('Please add at least one block to the template', 'Close', { duration: 3000 });
      }
    }
  }

  onReset(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.templateForm.reset();
    this.initializeDefaultBlocks();
    this.isSaving = false;
    this.isSubmitting = false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.templateForm.controls).forEach(key => {
      const control = this.templateForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.templateForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${fieldName} is required`;
      }
      if (control.errors['minlength']) {
        return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.templateForm.get(fieldName);
    return !!(control?.invalid && control.touched);
  }
}
