import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContractBlock, ContractMetadata, ContractCustomization } from '../../../interfaces/contract.interface';

@Component({
  selector: 'app-contract-preview',
  templateUrl: './contract-preview.component.html',
  styleUrls: ['./contract-preview.component.scss']
})
export class ContractPreviewComponent implements OnChanges {
  @Input() blocks: ContractBlock[] = [];
  @Input() metadata: ContractMetadata = {} as ContractMetadata;
  @Input() customization: ContractCustomization = {} as ContractCustomization;

  previewHtml: SafeHtml = '';
  previewStyle: any = {};

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.updatePreview();
  }

  private updatePreview(): void {
    this.updatePreviewStyle();
    const html = this.renderHtml();
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private updatePreviewStyle(): void {
    if (this.customization.theme && this.customization.typography && this.customization.layout) {
      this.previewStyle = {
        backgroundColor: this.customization.theme.backgroundColor,
        color: this.customization.theme.textColor,
        fontFamily: this.customization.typography.fontFamily,
        fontSize: `${this.customization.typography.fontSize}px`,
        lineHeight: this.customization.typography.lineHeight,
        padding: `${this.customization.layout.margins}px`
      };
    }
  }

  private renderHtml(): string {
    if (!this.metadata || !this.customization.theme) {
      return '<div class="loading">Loading preview...</div>';
    }

    const header = this.renderHeader();
    const body = this.renderBlocks();
    
    return `
      <div class="contract-document">
        ${header}
        <div class="contract-body" style="margin-top: ${this.customization.layout?.spacing || 16}px;">
          ${body}
        </div>
        ${this.customization.features?.showWatermark ? '<div class="watermark">DRAFT</div>' : ''}
      </div>
    `;
  }

  private renderHeader(): string {
    if (!this.hasMetadataContent() && !this.customization.branding?.companyName) {
      return '';
    }

    return `
      <div class="contract-header" style="
        background: ${this.customization.theme.primaryColor}10;
        border-left: 4px solid ${this.customization.theme.primaryColor};
        padding: 16px;
        margin-bottom: 24px;
        border-radius: 4px;
      ">
        ${this.renderBranding()}
        ${this.renderMetadata()}
      </div>
    `;
  }

  private renderBranding(): string {
    const branding = this.customization.branding;
    if (!branding?.companyName) return '';

    return `
      <div class="branding" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid ${this.customization.theme.primaryColor}20;">
        <h1 style="
          color: ${this.customization.theme.primaryColor};
          font-size: ${this.customization.typography.fontSize * this.customization.typography.headingScale}px;
          margin: 0 0 8px 0;
          font-weight: bold;
        ">${branding.companyName}</h1>
        ${branding.address ? `<p style="margin: 0; opacity: 0.75; font-size: 14px;">${branding.address}</p>` : ''}
        <div style="display: flex; gap: 16px; margin-top: 4px; font-size: 14px; opacity: 0.75;">
          ${branding.phone ? `<span>Tel: ${branding.phone}</span>` : ''}
          ${branding.email ? `<span>Email: ${branding.email}</span>` : ''}
          ${branding.website ? `<span>Web: ${branding.website}</span>` : ''}
        </div>
      </div>
    `;
  }

  private renderMetadata(): string {
    const meta = this.metadata;
    const items = [];

    if (meta.templateId) {
      items.push(`<p style="margin: 4px 0;"><strong>Template ID:</strong> ${meta.templateId}</p>`);
    }
    
    if (meta.partyA && meta.partyB) {
      items.push(`<p style="margin: 4px 0;"><strong>Parties:</strong> ${meta.partyA} and ${meta.partyB}</p>`);
    }
    
    if (meta.effectiveDate) {
      const date = this.formatDate(meta.effectiveDate);
      items.push(`<p style="margin: 4px 0;"><strong>Effective Date:</strong> ${date}</p>`);
    }
    
    if (meta.contractValue > 0) {
      const value = this.formatCurrency(meta.contractValue, meta.currency);
      items.push(`<p style="margin: 4px 0;"><strong>Contract Value:</strong> ${value}</p>`);
    }
    
    if (meta.jurisdiction) {
      items.push(`<p style="margin: 4px 0;"><strong>Jurisdiction:</strong> ${meta.jurisdiction}</p>`);
    }

    return items.length > 0 ? `<div class="metadata" style="font-size: 14px;">${items.join('')}</div>` : '';
  }

  private renderBlocks(): string {
    if (this.blocks.length === 0) {
      return '<div style="text-align: center; padding: 60px; color: #64748b;">Your contract preview will appear here</div>';
    }

    return this.blocks.map((block, index) => {
      const lineNumber = this.customization.features?.showLineNumbers ? 
        `<span style="position: absolute; left: -30px; font-size: 12px; opacity: 0.3;">${index + 1}</span>` : '';
      
      return `
        <div style="position: relative; margin-bottom: ${this.customization.layout?.spacing || 16}px;">
          ${lineNumber}
          ${this.renderBlock(block)}
        </div>
      `;
    }).join('');
  }

  private renderBlock(block: ContractBlock): string {
    const style = this.getBlockStyle(block);
    
    switch (block.type) {
      case 'heading':
        const headingSize = this.customization.typography.fontSize * this.customization.typography.headingScale;
        return `
          <h2 style="
            ${style}
            font-size: ${headingSize}px;
            color: ${this.customization.theme.primaryColor};
            font-weight: bold;
            margin: 16px 0 8px 0;
          ">
            ${block.label || 'Untitled Heading'}
            ${block.required ? '<span style="color: #ef4444; margin-left: 4px;">*</span>' : ''}
          </h2>
        `;

      case 'text':
        return `
          <div style="${style} margin-bottom: 16px;">
            ${block.label ? `
              <p style="
                font-weight: 600;
                margin: 0 0 4px 0;
                color: ${this.customization.theme.primaryColor};
              ">
                ${block.label}:${block.required ? '<span style="color: #ef4444; margin-left: 4px;">*</span>' : ''}
              </p>
            ` : ''}
            <p style="margin: 0; line-height: ${this.customization.typography.lineHeight}; white-space: pre-wrap;">
              ${block.value || 'Enter your text content...'}
            </p>
          </div>
        `;

      case 'date':
        const dateValue = block.value ? new Date(block.value).toLocaleDateString() : 'Select date';
        return `
          <p style="${style} margin-bottom: 16px;">
            <span style="font-weight: 600; color: ${this.customization.theme.primaryColor};">
              ${block.label || 'Date'}:${block.required ? '<span style="color: #ef4444; margin-left: 4px;">*</span>' : ''}
            </span> ${dateValue}
          </p>
        `;

      case 'number':
        return `
          <p style="${style} margin-bottom: 16px;">
            <span style="font-weight: 600; color: ${this.customization.theme.primaryColor};">
              ${block.label || 'Number'}:${block.required ? '<span style="color: #ef4444; margin-left: 4px;">*</span>' : ''}
            </span> ${block.value ?? 'Enter number'}
          </p>
        `;

      case 'list':
        const listItems = (block.items || []).map(item => `<li>${item}</li>`).join('');
        return `
          <div style="${style} margin-bottom: 16px;">
            ${block.label ? `
              <p style="
                font-weight: 600;
                margin: 0 0 8px 0;
                color: ${this.customization.theme.primaryColor};
              ">
                ${block.label}${block.required ? '<span style="color: #ef4444; margin-left: 4px;">*</span>' : ''}
              </p>
            ` : ''}
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
              ${listItems}
            </ul>
          </div>
        `;

      case 'table':
        return this.renderTable(block, style);

      case 'signature':
        return `
          <div style="${style} margin-bottom: 24px;">
            <p style="
              font-weight: 600;
              margin: 0 0 12px 0;
              color: ${this.customization.theme.primaryColor};
            ">
              ${block.label || 'Signature'}${block.required ? '<span style="color: #ef4444; margin-left: 4px;">*</span>' : ''}
            </p>
            <div style="
              border: 2px dashed ${this.customization.theme.primaryColor}40;
              border-radius: 8px;
              padding: 24px;
              text-align: center;
              background: ${this.customization.theme.primaryColor}05;
            ">
              <p style="margin: 0; opacity: 0.6;">Signature will appear here</p>
              <div style="
                margin-top: 16px;
                padding-top: 8px;
                border-top: 1px dashed ${this.customization.theme.primaryColor}20;
              ">
                <p style="margin: 0; font-size: 14px; opacity: 0.5;">Date: _______________</p>
              </div>
            </div>
          </div>
        `;

      case 'conditional':
        const shouldShow = this.evaluateCondition(block.conditional, {});
        if (shouldShow) {
          return `
            <div style="
              ${style}
              margin-bottom: 16px;
              padding: 12px;
              border-radius: 4px;
              border-left: 4px solid ${this.customization.theme.accentColor};
              background: ${this.customization.theme.accentColor}05;
            ">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="
                  background: ${this.customization.theme.accentColor}20;
                  color: ${this.customization.theme.accentColor};
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: 600;
                ">Conditional</span>
                <span style="font-size: 12px; opacity: 0.6;">
                  When ${block.conditional?.field} ${block.conditional?.operator} ${block.conditional?.value}
                </span>
              </div>
              <p style="margin: 0; line-height: ${this.customization.typography.lineHeight}; white-space: pre-wrap;">
                ${block.value || 'Conditional content...'}
              </p>
            </div>
          `;
        } else {
          return `
            <div style="margin-bottom: 8px; font-size: 12px; opacity: 0.4; font-style: italic;">
              [Conditional content hidden: ${block.conditional?.field} ${block.conditional?.operator} ${block.conditional?.value}]
            </div>
          `;
        }

      case 'divider':
        return `
          <div style="margin: 24px 0;">
            <hr style="
              border: none;
              height: 1px;
              background: ${this.customization.theme.primaryColor}20;
              margin: 0;
            ">
          </div>
        `;

      default:
        return '';
    }
  }

  private renderTable(block: ContractBlock, style: string): string {
    if (!block.headers || !block.rows) return '';

    const headerRow = block.headers.map(header => 
      `<th style="
        border: 1px solid ${this.customization.theme.primaryColor}40;
        padding: 12px;
        text-align: left;
        font-weight: 600;
        background: ${this.customization.theme.primaryColor}10;
        color: ${this.customization.theme.primaryColor};
      ">${header}</th>`
    ).join('');

    const bodyRows = block.rows.map(row => 
      `<tr>
        ${row.map(cell => 
          `<td style="
            border: 1px solid ${this.customization.theme.primaryColor}40;
            padding: 12px;
          ">${cell}</td>`
        ).join('')}
      </tr>`
    ).join('');

    return `
      <div style="${style} margin-bottom: 16px;">
        ${block.label ? `
          <p style="
            font-weight: 600;
            margin: 0 0 8px 0;
            color: ${this.customization.theme.primaryColor};
          ">
            ${block.label}${block.required ? '<span style="color: #ef4444; margin-left: 4px;">*</span>' : ''}
          </p>
        ` : ''}
        <table style="
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        ">
          <thead>
            <tr>${headerRow}</tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </div>
    `;
  }

  private getBlockStyle(block: ContractBlock): string {
    const styles = [];
    
    if (block.style?.fontSize) {
      styles.push(`font-size: ${block.style.fontSize}px`);
    }
    
    if (block.style?.fontWeight) {
      styles.push(`font-weight: ${block.style.fontWeight}`);
    }
    
    if (block.style?.color) {
      styles.push(`color: ${block.style.color}`);
    }
    
    if (block.style?.alignment) {
      styles.push(`text-align: ${block.style.alignment}`);
    }

    return styles.join('; ');
  }

  private hasMetadataContent(): boolean {
    return !!(
      this.metadata.templateId ||
      this.metadata.partyA ||
      this.metadata.partyB ||
      this.metadata.effectiveDate ||
      this.metadata.contractValue > 0 ||
      this.metadata.jurisdiction
    );
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(value);
  }

  private evaluateCondition(conditional: any, data: any): boolean {
    if (!conditional?.field) return true;

    const fieldValue = data[conditional.field] || '';
    const targetValue = conditional.value || '';

    switch (conditional.operator) {
      case 'equals':
        return fieldValue === targetValue;
      case 'not_equals':
        return fieldValue !== targetValue;
      case 'contains':
        return fieldValue.toString().includes(targetValue);
      case 'greater_than':
        return Number(fieldValue) > Number(targetValue);
      default:
        return true;
    }
  }
}