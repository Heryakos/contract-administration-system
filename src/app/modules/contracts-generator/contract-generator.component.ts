// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
// import { ContractGeneratorService } from '../../services/contract-generator.service';
// import { ContractBlock } from '../../interfaces/contract-generator.interface';
// import { ContractService } from '../../services/contract.service';
// import type { ContractType, ContractCategory, Vendor } from '../../models/contract.model';
//
// @Component({
//   selector: 'app-contract-generator',
//   templateUrl: './contract-generator.component.html',
//   styleUrls: ['./contract-generator.component.scss']
// })
// export class ContractGeneratorComponent implements OnInit {
//   blocks: ContractBlock[] = [];
//   metadataForm!: FormGroup;
//   customizationForm!: FormGroup;
//   isSaving = false;
//   showPreview = true;
//   activeTab = 0;
//
//   // Lists loaded from API
//   contractTypes: ContractType[] = [];
//   contractCategories: ContractCategory[] = [];
//   vendors: Vendor[] = [];
//
//   // Snapshots for template bindings
//   metadata: any;
//   customization: any;
//
//   // UI options (could be moved to service)
//   blockTypes = [
//     { type: 'heading', label: 'Heading', icon: 'title' },
//     { type: 'text', label: 'Text', icon: 'notes' },
//     { type: 'date', label: 'Date', icon: 'event' },
//     { type: 'number', label: 'Number', icon: 'pin' },
//     { type: 'list', label: 'List', icon: 'format_list_bulleted' },
//     { type: 'table', label: 'Table', icon: 'table_chart' },
//     { type: 'signature', label: 'Signature', icon: 'draw' },
//     { type: 'conditional', label: 'Conditional', icon: 'rule' },
//     { type: 'divider', label: 'Divider', icon: 'horizontal_rule' },
//   ];
//
//   jurisdictions = [
//     { value: 'US', label: 'United States' },
//     { value: 'UK', label: 'United Kingdom' },
//     { value: 'EU', label: 'European Union' }
//   ];
//
//   currencies = ['USD', 'EUR', 'GBP'];
//   fontFamilies = ['Inter', 'Arial', 'Roboto', 'Georgia'];
//   pageSizes = ['A4', 'Letter'];
//   riskLevels = ['Low', 'Medium', 'High'];
//
//   constructor(
//     private fb: FormBuilder,
//     private generator: ContractGeneratorService,
//     private contracts: ContractService,
//   ) {}
//
//   ngOnInit(): void {
//     this.blocks = this.generator.getBlocks();
//     this.metadataForm = this.fb.group({
//       templateId: [''],
//       partyA: [''],
//       partyB: [''],
//       effectiveDate: [''],
//       contractValue: [0],
//       currency: ['USD'],
//       jurisdiction: [''],
//       contractTypeID: [null],
//       categoryID: [null],
//       vendorID: [null],
//       riskLevel: ['Low'],
//       duration: [12],
//       version: ['1']
//     });
//
//     this.customizationForm = this.fb.group({
//       primaryColor: ['#2563eb'],
//       textColor: ['#1e293b'],
//       backgroundColor: ['#ffffff'],
//       fontFamily: ['Inter'],
//       fontSize: [14],
//       lineHeight: [1.6],
//       margins: [40],
//       pageSize: ['A4'],
//       showLineNumbers: [false],
//       trackChanges: [false],
//       autoSave: [true]
//     });
//
//     // Keep snapshots for template bindings
//     this.metadata = this.metadataForm.value;
//     this.customization = {
//       primaryColor: '#2563eb',
//       textColor: '#1e293b',
//       backgroundColor: '#ffffff',
//       fontFamily: 'Inter',
//       fontSize: 14,
//       lineHeight: 1.6,
//       margins: 40,
//       pageSize: 'A4',
//       showLineNumbers: false,
//       trackChanges: false,
//       autoSave: true,
//       theme: { primaryColor: '#2563eb', secondaryColor: '#64748b', backgroundColor: '#ffffff', textColor: '#1e293b', accentColor: '#0ea5e9' }
//     };
//
//     this.metadataForm.valueChanges.subscribe(val => {
//       this.generator.updateMetadata(val);
//       this.metadata = val;
//     });
//     this.customizationForm.valueChanges.subscribe(val => {
//       this.generator.updateCustomization(val);
//       this.customization = { ...this.customization, ...val, theme: { ...(this.customization.theme || {}), primaryColor: val.primaryColor, textColor: val.textColor, backgroundColor: val.backgroundColor } };
//     });
//
//     // Load dropdown lists
//     this.contracts.getContractTypes().subscribe(types => this.contractTypes = types || []);
//     this.contracts.getContractCategories().subscribe(cats => this.contractCategories = cats || []);
//     this.contracts.getVendors().subscribe(vs => this.vendors = vs || []);
//   }
//
//   onDrop(event: CdkDragDrop<ContractBlock[]>): void {
//     if (event.previousIndex !== event.currentIndex) {
//       moveItemInArray(this.blocks, event.previousIndex, event.currentIndex);
//       this.generator.reorderBlocks(event.previousIndex, event.currentIndex);
//     }
//   }
//
//   onAddElement(type: any): void {
//     this.generator.addBlock(type);
//     this.blocks = this.generator.getBlocks();
//   }
//
//   addBlock(type: any): void {
//     this.onAddElement(type);
//   }
//
//   updateBlock(id: string, updates: Partial<ContractBlock>): void {
//     this.generator.updateBlock(id, updates);
//   }
//
//   removeBlock(id: string): void {
//     this.generator.removeBlock(id);
//     this.blocks = this.generator.getBlocks();
//   }
//
//   duplicateBlock(block: ContractBlock): void {
//     const copy: ContractBlock = { ...block, id: `copy-${Date.now()}` } as any;
//     this.generator.updateBlocks([ ...this.blocks, copy ] as any);
//     this.blocks = this.generator.getBlocks();
//   }
//
//   addListItem(block: ContractBlock): void {
//     const items = [...(block.items || [])];
//     items.push('');
//     this.updateBlock(block.id, { items });
//   }
//
//   removeListItem(block: ContractBlock, index: number): void {
//     const items = [...(block.items || [])];
//     items.splice(index, 1);
//     this.updateBlock(block.id, { items });
//   }
//
//   onListItemChange(block: ContractBlock, idx: number, value: string): void {
//     const items = [...(block.items || [])];
//     items[idx] = value;
//     this.updateBlock(block.id, { items });
//   }
//
//   addTableColumn(block: ContractBlock): void {
//     const headers = [...(block.headers || [])];
//     headers.push('');
//     const rows = (block.rows || []).map(r => [...r, '']);
//     this.updateBlock(block.id, { headers, rows });
//   }
//
//   removeTableColumn(block: ContractBlock, index: number): void {
//     const headers = [...(block.headers || [])];
//     headers.splice(index, 1);
//     const rows = (block.rows || []).map(r => r.filter((_, i) => i !== index));
//     this.updateBlock(block.id, { headers, rows });
//   }
//
//   addTableRow(block: ContractBlock): void {
//     const rows = [...(block.rows || [])];
//     const cols = (block.headers || []).length;
//     rows.push(new Array(cols).fill(''));
//     this.updateBlock(block.id, { rows });
//   }
//
//   removeTableRow(block: ContractBlock, index: number): void {
//     const rows = [...(block.rows || [])];
//     rows.splice(index, 1);
//     this.updateBlock(block.id, { rows });
//   }
//
//   onConditionalOperatorChange(_block: ContractBlock, _value: string): void {}
//   onAlignmentChange(_block: ContractBlock, _value: string): void {}
//   onFontWeightChange(_block: ContractBlock, _value: string): void {}
//   onRequiredToggle(_block: ContractBlock, _checked: boolean): void {}
// }