import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ContractService } from './contract.service';
import { ContractBlock, ContractMetadata, ContractCustomization, Template, Clause, ComplianceIssue } from '../interfaces/contract-generator.interface';

@Injectable({
  providedIn: 'root'
})
export class ContractGeneratorService {
  private blocksSubject = new BehaviorSubject<ContractBlock[]>([
    { id: 'default-heading', type: 'heading', label: 'Service Agreement' }
  ]);

  private mockClauses: Clause[] = [
    {
      id: '1',
      title: 'Payment Terms',
      content: 'Payment shall be due within thirty (30) days of invoice date. Late payments may incur a service charge of 1.5% per month.',
      tags: ['payment', 'invoice', 'terms'],
      category: 'Financial'
    },
    {
      id: '2',
      title: 'Confidentiality',
      content: 'Both parties agree to maintain confidentiality of all proprietary information shared during the course of this agreement.',
      tags: ['confidential', 'nda', 'proprietary'],
      category: 'Legal'
    },
    {
      id: '3',
      title: 'Termination Clause',
      content: 'Either party may terminate this agreement with thirty (30) days written notice to the other party.',
      tags: ['termination', 'notice', 'end'],
      category: 'Legal'
    }
  ];

  addClause(clause: Clause): void {
    const withId: Clause = {
      ...clause,
      id: clause.id && clause.id.trim() ? clause.id : `clause-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    };
    this.mockClauses.push(withId);
  }


  private metadataSubject = new BehaviorSubject<ContractMetadata>({
    templateId: '',
    partyA: '',
    partyB: '',
    effectiveDate: '',
    contractValue: 0,
    currency: 'USD',
    jurisdiction: '',
    language: 'en',
    version: '1.0'
  });

  private customizationSubject = new BehaviorSubject<ContractCustomization>({
    theme: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      accentColor: '#0ea5e9'
    },
    typography: {
      fontFamily: 'Inter',
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
      enableComments: true,
      trackChanges: false,
      requireSignatures: true,
      autoSave: true
    }
  });

  blocks$ = this.blocksSubject.asObservable();
  metadata$ = this.metadataSubject.asObservable();
  customization$ = this.customizationSubject.asObservable();

  constructor(private contractService: ContractService) {}

  getBlocks(): ContractBlock[] {
    return this.blocksSubject.value;
  }

  updateBlocks(blocks: ContractBlock[]): void {
    this.blocksSubject.next(blocks);
  }

  addBlock(type: ContractBlock['type']): void {
    const blocks = this.getBlocks();
    const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const customization = this.customizationSubject.value;
    
    const newBlock: ContractBlock = {
      id,
      type,
      label: this.getDefaultLabel(type),
      style: {
        fontSize: customization.typography.fontSize,
        fontWeight: type === 'heading' ? 'bold' : 'normal',
        color: customization.theme.textColor,
        alignment: 'left',
        spacing: customization.layout.spacing
      },
      required: false,
      ...(type === 'list' && { items: ['Item 1'] }),
      ...(type === 'table' && {
        headers: ['Column 1', 'Column 2'],
        rows: [['Cell 1', 'Cell 2']]
      }),
      ...(type === 'conditional' && {
        conditional: { field: '', operator: 'equals', value: '' }
      })
    };

    this.updateBlocks([...blocks, newBlock]);
  }

  removeBlock(id: string): void {
    const blocks = this.getBlocks().filter(block => block.id !== id);
    this.updateBlocks(blocks);
  }

  updateBlock(id: string, updates: Partial<ContractBlock>): void {
    const blocks = this.getBlocks().map(block => 
      block.id === id ? { ...block, ...updates } : block
    );
    this.updateBlocks(blocks);
  }

  reorderBlocks(fromIndex: number, toIndex: number): void {
    const blocks = [...this.getBlocks()];
    const [movedBlock] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, movedBlock);
    this.updateBlocks(blocks);
  }

  updateMetadata(metadata: Partial<ContractMetadata>): void {
    const current = this.metadataSubject.value;
    this.metadataSubject.next({ ...current, ...metadata });
  }

  updateCustomization(customization: Partial<ContractCustomization>): void {
    const current = this.customizationSubject.value;
    this.customizationSubject.next({ ...current, ...customization } as ContractCustomization);
  }

  getTemplates(): Observable<Template[]> {
    return of([
      {
        id: 'service-agreement',
        name: 'Service Agreement',
        description: 'Standard service contract template',
        category: 'Business',
        blocks: [
          { id: 'title', type: 'heading', label: 'Service Agreement' },
          { id: 'parties', type: 'text', label: 'Parties', value: 'This agreement is between {{PartyA}} and {{PartyB}}' },
          { id: 'services', type: 'text', label: 'Services', value: 'The following services will be provided:' },
          { id: 'payment', type: 'number', label: 'Payment Amount', value: 0 },
          { id: 'signature', type: 'signature', label: 'Signature' }
        ],
        metadata: {
          templateId: 'SA-001',
          jurisdiction: 'US'
        }
      },
      {
        id: 'nda',
        name: 'Non-Disclosure Agreement',
        description: 'Confidentiality agreement template',
        category: 'Legal',
        blocks: [
          { id: 'title', type: 'heading', label: 'Non-Disclosure Agreement' },
          { id: 'purpose', type: 'text', label: 'Purpose', value: 'This NDA is for the purpose of...' },
          { id: 'confidential-info', type: 'text', label: 'Confidential Information', value: 'Confidential information includes...' },
          { id: 'term', type: 'date', label: 'Term', value: '' },
          { id: 'signature', type: 'signature', label: 'Signature' }
        ],
        metadata: {
          templateId: 'NDA-001',
          jurisdiction: 'US'
        }
      }
    ]);
  }

  getClauses(): Observable<Clause[]> {
    return of([...this.mockClauses]);
  }

  checkCompliance(): ComplianceIssue[] {
    const blocks = this.getBlocks();
    const metadata = this.metadataSubject.value;
    const issues: ComplianceIssue[] = [];

    if (!metadata.partyA) issues.push({ type: 'error', message: 'Party A is required', field: 'partyA' });
    if (!metadata.partyB) issues.push({ type: 'error', message: 'Party B is required', field: 'partyB' });
    if (!metadata.effectiveDate) issues.push({ type: 'warning', message: 'Effective date should be specified', field: 'effectiveDate' });

    const hasSignature = blocks.some(block => block.type === 'signature');
    if (!hasSignature) issues.push({ type: 'warning', message: 'Consider adding signature blocks' });

    if (!metadata.jurisdiction) issues.push({ type: 'info', message: 'Specify jurisdiction for legal clarity', field: 'jurisdiction' });

    return issues;
  }

  applyTemplate(template: Template): void {
    this.updateBlocks(template.blocks);
    this.updateMetadata(template.metadata);
    if (template.customization) {
      this.updateCustomization(template.customization);
    }
  }

  insertClause(clause: { title: string; content: string }): void {
    const blocks = this.getBlocks();
    const headingId = `clause-heading-${Date.now()}`;
    const textId = `clause-text-${Date.now()}`;

    const newBlocks: ContractBlock[] = [
      { id: headingId, type: 'heading', label: clause.title },
      { id: textId, type: 'text', label: '', value: clause.content }
    ];

    this.updateBlocks([...blocks, ...newBlocks]);
  }

  saveContract(): Observable<any> {
    const meta = this.metadataSubject.value;
    const payload = {
      contractNumber: meta.templateId || `CNT-${Date.now()}`,
      contractTitle: `${meta.partyA || 'Party A'} - ${meta.partyB || 'Party B'} Contract`,
      contractValue: meta.contractValue,
      currency: meta.currency,
      startDate: meta.effectiveDate ? new Date(meta.effectiveDate) : undefined,
      description: 'Generated via Contract Generator',
      riskLevel: 'Low'
    };

    return this.contractService.createContract(payload as any);
  }

  private getDefaultLabel(type: ContractBlock['type']): string {
    switch (type) {
      case 'heading': return 'New Heading';
      case 'text': return 'Text Block';
      case 'date': return 'Date';
      case 'number': return 'Number';
      case 'list': return 'List';
      case 'table': return 'Table';
      case 'signature': return 'Signature';
      case 'conditional': return 'Conditional Text';
      case 'divider': return 'Divider';
      default: return 'Block';
    }
  }
}