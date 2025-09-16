import { Component, OnInit, OnDestroy } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ContractGeneratorService } from '../../services/contract-generator.service';
import { ContractService } from '../../services/contract.service';
import { ContractBlock, ContractMetadata, ContractCustomization, ComplianceIssue } from '../../interfaces/contract-generator.interface';
import { ClauseLibraryDialogComponent } from '../../components/contracts/clause-library-dialog/clause-library-dialog.component';
import { TemplateLibraryDialogComponent } from '../../components/contracts/template-library-dialog/template-library-dialog.component';
import { ExportService } from '../../services/export.service';
import { ActivatedRoute, Router } from '@angular/router';
import type { Contract, UpdateContract } from '../../models/contract.model';

@Component({
  selector: 'app-contract-generator',
  templateUrl: './contract-generator.component.html',
  styleUrls: ['./contract-generator.component.scss']
})
export class ContractGeneratorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  blocks: ContractBlock[] = [];
  metadata: ContractMetadata = {} as ContractMetadata;
  customization: ContractCustomization = {} as ContractCustomization;
  complianceIssues: ComplianceIssue[] = [];

  metadataForm!: FormGroup;
  customizationForm!: FormGroup;
  
  showPreview = true;
  activeTab = 0;
  isSaving = false;

  // Edit mode state
  isEditMode = false;
  currentContractId: string | null = null;
  loadedContract: Contract | null = null;
  
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

  currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
  jurisdictions = [
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'EU', label: 'European Union' }
  ];

  fontFamilies = ['Inter', 'Times New Roman', 'Arial', 'Helvetica', 'Georgia'];
  pageSizes = ['A4', 'Letter', 'Legal'];

  constructor(
    private contractGeneratorService: ContractGeneratorService,
    private contractService: ContractService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private exportService: ExportService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.subscribeToServices();
    // Detect edit mode by presence of id param in either pattern
    const idFromParams = this.route.snapshot.paramMap.get('id');
    if (idFromParams) {
      this.isEditMode = true;
      this.currentContractId = idFromParams;
      this.loadExistingContract(idFromParams);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.metadataForm = this.fb.group({
      templateId: [''],
      partyA: [''],
      partyB: [''],
      effectiveDate: [''],
      contractValue: [0],
      currency: ['USD'],
      jurisdiction: [''],
      language: ['en'],
      version: ['1.0']
    });

    this.customizationForm = this.fb.group({
      primaryColor: ['#2563eb'],
      textColor: ['#1e293b'],
      backgroundColor: ['#ffffff'],
      fontFamily: ['Inter'],
      fontSize: [14],
      lineHeight: [1.6],
      margins: [40],
      spacing: [16],
      pageSize: ['A4'],
      showLineNumbers: [false],
      trackChanges: [false],
      autoSave: [true]
    });

    // Subscribe to form changes
    this.metadataForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.contractGeneratorService.updateMetadata(value);
      });

    this.customizationForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        const customization: Partial<ContractCustomization> = {
          theme: {
            primaryColor: value.primaryColor,
            secondaryColor: '#64748b',
            backgroundColor: value.backgroundColor,
            textColor: value.textColor,
            accentColor: '#0ea5e9'
          },
          typography: {
            fontFamily: value.fontFamily,
            fontSize: value.fontSize,
            lineHeight: value.lineHeight,
            headingScale: 1.25
          },
          layout: {
            margins: value.margins,
            spacing: value.spacing,
            columns: 1,
            pageSize: value.pageSize,
            orientation: 'portrait'
          },
          features: {
            showLineNumbers: value.showLineNumbers,
            showWatermark: false,
            enableComments: true,
            trackChanges: value.trackChanges,
            requireSignatures: true,
            autoSave: value.autoSave
          }
        };
        this.contractGeneratorService.updateCustomization(customization);
      });
  }

  private subscribeToServices(): void {
    combineLatest([
      this.contractGeneratorService.blocks$,
      this.contractGeneratorService.metadata$,
      this.contractGeneratorService.customization$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([blocks, metadata, customization]) => {
        this.blocks = blocks;
        this.metadata = metadata;
        this.customization = customization;
        
        // Update forms without triggering value changes
        this.metadataForm.patchValue(metadata, { emitEvent: false });
        this.updateCustomizationForm(customization);
      });
  }

  private loadExistingContract(id: string): void {
    this.contractService.getContract(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contract) => {
          this.loadedContract = contract;
          // Map basic fields to metadata
          const metaUpdate: Partial<ContractMetadata> = {
            templateId: contract.contractNumber,
            effectiveDate: contract.startDate ? new Date(contract.startDate).toISOString() : '',
            contractValue: contract.contractValue ?? 0,
            currency: contract.currency,
            version: String(contract.version ?? '1.0')
          };
          this.contractGeneratorService.updateMetadata(metaUpdate);

          // Seed blocks from existing data if blocks are still default
          const seedBlocks: ContractBlock[] = [];
          seedBlocks.push({ id: `title-${Date.now()}`, type: 'heading', label: contract.contractTitle });
          if (contract.description) {
            seedBlocks.push({ id: `desc-${Date.now()}`, type: 'text', label: 'Description', value: contract.description });
          }
          this.contractGeneratorService.updateBlocks(seedBlocks.length > 0 ? seedBlocks : this.blocks);
        },
        error: () => {
          this.snackBar.open('Failed to load contract for editing', 'Close', { duration: 3000 });
        }
      });
  }

  private updateCustomizationForm(customization: ContractCustomization): void {
    this.customizationForm.patchValue({
      primaryColor: customization.theme.primaryColor,
      textColor: customization.theme.textColor,
      backgroundColor: customization.theme.backgroundColor,
      fontFamily: customization.typography.fontFamily,
      fontSize: customization.typography.fontSize,
      lineHeight: customization.typography.lineHeight,
      margins: customization.layout.margins,
      spacing: customization.layout.spacing,
      pageSize: customization.layout.pageSize,
      showLineNumbers: customization.features.showLineNumbers,
      trackChanges: customization.features.trackChanges,
      autoSave: customization.features.autoSave
    }, { emitEvent: false });
  }

  addBlock(type: ContractBlock['type']): void {
    this.contractGeneratorService.addBlock(type);
  }
 
  onAddElement(type: any): void {
    this.addBlock(type as ContractBlock['type']);
  }

  removeBlock(id: string): void {
    this.contractGeneratorService.removeBlock(id);
  }

  updateBlock(id: string, updates: Partial<ContractBlock>): void {
    this.contractGeneratorService.updateBlock(id, updates);
  }

  duplicateBlock(block: ContractBlock): void {
    const duplicatedBlock: ContractBlock = {
      ...block,
      id: `${block.id}-copy-${Date.now()}`
    };
    const blocks = [...this.blocks, duplicatedBlock];
    this.contractGeneratorService.updateBlocks(blocks);
  }

  onDrop(event: CdkDragDrop<ContractBlock[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      this.contractGeneratorService.reorderBlocks(event.previousIndex, event.currentIndex);
    }
  }

  openClauseLibrary(): void {
    this.dialog.open(ClauseLibraryDialogComponent, {
      width: '720px',
      maxHeight: '80vh'
    });
  }

  openTemplateLibrary(): void {
    this.dialog.open(TemplateLibraryDialogComponent, {
      width: '720px',
      maxHeight: '80vh'
    });
  }

  runComplianceCheck(): void {
    this.complianceIssues = this.contractGeneratorService.checkCompliance();
    this.snackBar.open(`Compliance check completed. Found ${this.complianceIssues.length} issues.`, 'Close', {
      duration: 3000
    });
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  onTabChange(index: number): void {
    this.activeTab = index;
  }

  async exportToPDF(): Promise<void> {
    try {
      await this.exportService.exportToPDF(this.blocks, this.metadata, this.customization);
      this.snackBar.open('Contract exported to PDF successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Error exporting to PDF', 'Close', { duration: 3000 });
    }
  }

  async exportToHTML(): Promise<void> {
    try {
      await this.exportService.exportToHTML(this.blocks, this.metadata, this.customization);
      this.snackBar.open('Contract exported to HTML successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Error exporting to HTML', 'Close', { duration: 3000 });
    }
  }

  async exportToDOCX(): Promise<void> {
    try {
      await this.exportService.exportToDOCX(this.blocks, this.metadata, this.customization);
      this.snackBar.open('Contract exported to DOCX successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Error exporting to DOCX', 'Close', { duration: 3000 });
    }
  }

  saveDraft(): void {
    this.isSaving = true;
    if (this.isEditMode && this.currentContractId) {
      const payload: UpdateContract = {
        contractTitle: this.loadedContract?.contractTitle || `${this.metadata.partyA || 'Party A'} - ${this.metadata.partyB || 'Party B'} Contract`,
        contractValue: this.metadata.contractValue,
        currency: this.metadata.currency,
        startDate: this.metadata.effectiveDate ? new Date(this.metadata.effectiveDate) : undefined,
        endDate: this.loadedContract?.endDate,
        description: this.loadedContract?.description || 'Updated via Contract Generator',
        riskLevel: this.loadedContract?.riskLevel || 'Low',
        status: this.loadedContract?.status || 'Draft',
        contractTypeID: undefined,
        categoryID: undefined,
        vendorID: undefined
      };
      this.contractService.updateContract(this.currentContractId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.snackBar.open('Contract updated successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.isSaving = false;
            this.snackBar.open('Error updating contract', 'Close', { duration: 3000 });
          }
        });
    } else {
      this.contractGeneratorService.saveContract()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.snackBar.open('Contract saved as draft successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.isSaving = false;
            this.snackBar.open('Error saving contract', 'Close', { duration: 3000 });
          }
        });
    }
  }

  submitForApproval(): void {
    // First save the contract, then submit for approval
    this.isSaving = true;
    if (this.isEditMode && this.currentContractId) {
      const payload: UpdateContract = {
        contractTitle: this.loadedContract?.contractTitle || `${this.metadata.partyA || 'Party A'} - ${this.metadata.partyB || 'Party B'} Contract`,
        contractValue: this.metadata.contractValue,
        currency: this.metadata.currency,
        startDate: this.metadata.effectiveDate ? new Date(this.metadata.effectiveDate) : undefined,
        endDate: this.loadedContract?.endDate,
        description: this.loadedContract?.description || 'Updated via Contract Generator',
        riskLevel: this.loadedContract?.riskLevel || 'Low',
        status: 'Under Review',
        contractTypeID: undefined,
        categoryID: undefined,
        vendorID: undefined
      };
      this.contractService.updateContract(this.currentContractId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.snackBar.open('Contract submitted for approval!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.isSaving = false;
            this.snackBar.open('Error submitting contract', 'Close', { duration: 3000 });
          }
        });
    } else {
      this.contractGeneratorService.saveContract()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.snackBar.open('Contract submitted for approval!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.isSaving = false;
            this.snackBar.open('Error submitting contract', 'Close', { duration: 3000 });
          }
        });
    }
  }

  print(): void {
    this.exportService.print(this.blocks, this.metadata, this.customization);
  }

  applyMergeFields(): void {
    const updatedBlocks = this.blocks.map(block => {
      const updated = { ...block };
      
      if (typeof updated.value === 'string') {
        updated.value = this.replaceMergeFields(updated.value);
      }
      
      if (updated.items) {
        updated.items = updated.items.map(item => this.replaceMergeFields(item));
      }
      
      if (updated.rows) {
        updated.rows = updated.rows.map(row => 
          row.map(cell => typeof cell === 'string' ? this.replaceMergeFields(cell) : cell)
        );
      }
      
      return updated;
    });
    
    this.contractGeneratorService.updateBlocks(updatedBlocks);
    this.snackBar.open('Merge fields applied successfully!', 'Close', { duration: 3000 });
  }

  private replaceMergeFields(text: string): string {
    return text
      .replace(/\{\{PartyA\}\}/g, this.metadata.partyA || '')
      .replace(/\{\{PartyB\}\}/g, this.metadata.partyB || '')
      .replace(/\{\{EffectiveDate\}\}/g, this.metadata.effectiveDate ? new Date(this.metadata.effectiveDate).toDateString() : '')
      .replace(/\{\{ContractValue\}\}/g, String(this.metadata.contractValue ?? ''))
      .replace(/\{\{Currency\}\}/g, this.metadata.currency || '');
  }

  // List and Table operations
  addListItem(block: ContractBlock): void {
    if (block.items) {
      const items = [...block.items, `Item ${block.items.length + 1}`];
      this.updateBlock(block.id, { items });
    }
  }

  removeListItem(block: ContractBlock, index: number): void {
    if (block.items) {
      const items = block.items.filter((_, i) => i !== index);
      this.updateBlock(block.id, { items });
    }
  }

  addTableRow(block: ContractBlock): void {
    if (block.rows && block.headers) {
      const rows = [...block.rows, new Array(block.headers.length).fill('')];
      this.updateBlock(block.id, { rows });
    }
  }

  removeTableRow(block: ContractBlock, index: number): void {
    if (block.rows) {
      const rows = block.rows.filter((_, i) => i !== index);
      this.updateBlock(block.id, { rows });
    }
  }

  addTableColumn(block: ContractBlock): void {
    if (block.headers && block.rows) {
      const headers = [...block.headers, `Column ${block.headers.length + 1}`];
      const rows = block.rows.map(row => [...row, '']);
      this.updateBlock(block.id, { headers, rows });
    }
  }

  removeTableColumn(block: ContractBlock, index: number): void {
    if (block.headers && block.rows) {
      const headers = block.headers.filter((_, i) => i !== index);
      const rows = block.rows.map(row => row.filter((_, i) => i !== index));
      this.updateBlock(block.id, { headers, rows });
    }
  }

  updateTableCell(block: ContractBlock, rowIndex: number, cellIndex: number, value: string): void {
    if (block.rows) {
      const rows = [...block.rows];
      rows[rowIndex] = [...rows[rowIndex]];
      rows[rowIndex][cellIndex] = value;
      this.updateBlock(block.id, { rows });
    }
  }

  updateTableHeader(block: ContractBlock, index: number, value: string): void {
    if (block.headers) {
      const headers = [...block.headers];
      headers[index] = value;
      this.updateBlock(block.id, { headers });
    }
  }

  getComplianceIssueIcon(type: string): string {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  getComplianceIssueColor(type: string): string {
    switch (type) {
      case 'error': return 'warn';
      case 'warning': return 'accent';
      case 'info': return 'primary';
      default: return 'primary';
    }
  }

  onAlignmentChange(block: ContractBlock, value: string): void {
    const style = { ...(block.style || {}), alignment: value } as NonNullable<ContractBlock['style']>;
    this.updateBlock(block.id, { style });
  }

  onFontWeightChange(block: ContractBlock, value: string): void {
    const style = { ...(block.style || {}), fontWeight: value } as NonNullable<ContractBlock['style']>;
    this.updateBlock(block.id, { style });
  }

  onRequiredToggle(block: ContractBlock, checked: boolean): void {
    this.updateBlock(block.id, { required: checked });
  }

  onListItemChange(block: ContractBlock, index: number, value: string): void {
    if (!block.items) return;
    const items = block.items.map((it, i) => (i === index ? value : it));
    this.updateBlock(block.id, { items });
  }

  onTableCellInput(block: ContractBlock, rowIndex: number, cellIndex: number, value: string): void {
    this.updateTableCell(block, rowIndex, cellIndex, value);
  }

  onTableHeaderInput(block: ContractBlock, index: number, value: string): void {
    this.updateTableHeader(block, index, value);
  }

  onConditionalFieldChange(block: ContractBlock, value: string): void {
    const conditional = { ...(block.conditional || { field: '', operator: 'equals', value: '' }), field: value };
    this.updateBlock(block.id, { conditional });
  }

  onConditionalOperatorChange(block: ContractBlock, value: string): void {
    const conditional = { ...(block.conditional || { field: '', operator: 'equals', value: '' }), operator: value };
    this.updateBlock(block.id, { conditional });
  }

  onConditionalValueChange(block: ContractBlock, value: string): void {
    const conditional = { ...(block.conditional || { field: '', operator: 'equals', value: '' }), value };
    this.updateBlock(block.id, { conditional });
  }
}