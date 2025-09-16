export interface ContractBlock {
    id: string;
    type: 'heading' | 'text' | 'date' | 'number' | 'divider' | 'list' | 'table' | 'signature' | 'conditional';
    label?: string;
    value?: any;
    items?: string[];
    headers?: string[];
    rows?: string[][];
    style?: {
      fontSize?: number;
      fontWeight?: string;
      color?: string;
      alignment?: string;
      spacing?: number;
    };
    conditional?: {
      field: string;
      operator: string;
      value: string;
    };
    required?: boolean;
    validation?: {
      type: string;
      message: string;
    };
  }
  
  export interface ContractMetadata {
    templateId: string;
    partyA: string;
    partyB: string;
    effectiveDate: string;
    contractValue: number;
    currency: string;
    jurisdiction: string;
    language: string;
    version: string;
  }
  
  export interface ContractCustomization {
    theme: {
      primaryColor: string;
      secondaryColor: string;
      backgroundColor: string;
      textColor: string;
      accentColor: string;
    };
    typography: {
      fontFamily: string;
      fontSize: number;
      lineHeight: number;
      headingScale: number;
    };
    layout: {
      margins: number;
      spacing: number;
      columns: number;
      pageSize: string;
      orientation: string;
    };
    branding: {
      logo: string;
      companyName: string;
      address: string;
      phone: string;
      email: string;
      website: string;
    };
    features: {
      showLineNumbers: boolean;
      showWatermark: boolean;
      enableComments: boolean;
      trackChanges: boolean;
      requireSignatures: boolean;
      autoSave: boolean;
    };
  }
  
  export interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    blocks: ContractBlock[];
    metadata: Partial<ContractMetadata>;
    customization?: Partial<ContractCustomization>;
  }
  
  export interface Clause {
    id: string;
    title: string;
    content: string;
    tags: string[];
    category: string;
  }
  
  export interface ComplianceIssue {
    type: 'error' | 'warning' | 'info';
    message: string;
    field?: string;
  }