import { Injectable } from '@angular/core';
import { ContractBlock, ContractMetadata, ContractCustomization } from '../interfaces/contract.interface';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun } from 'docx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  async exportToPDF(blocks: ContractBlock[], metadata: ContractMetadata, customization: ContractCustomization): Promise<void> {
    const html = this.renderHtmlForExport(blocks, metadata, customization);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('contract.pdf');
    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  async exportToHTML(blocks: ContractBlock[], metadata: ContractMetadata, customization: ContractCustomization): Promise<void> {
    const html = this.renderCompleteHtml(blocks, metadata, customization);
    const blob = new Blob([html], { type: 'text/html' });
    this.downloadBlob(blob, 'contract.html');
  }

  async exportToDOCX(blocks: ContractBlock[], metadata: ContractMetadata, customization: ContractCustomization): Promise<void> {
    const doc = new Document({
      sections: [{
        children: [
          // Header with metadata
          new Paragraph({
            text: `${metadata.partyA || ""} and ${metadata.partyB || ""} (Effective: ${metadata.effectiveDate ? new Date(metadata.effectiveDate).toDateString() : ""}) Value: ${metadata.contractValue} ${metadata.currency}`,
            heading: 'Heading1',
          }),
          // Convert blocks to DOCX elements
          ...blocks.map(block => this.convertBlockToDOCX(block))
        ]
      }]
    });

    try {
      const blob = await Packer.toBlob(doc);
      this.downloadBlob(blob, 'contract.docx');
    } catch (error) {
      console.error('Error generating DOCX:', error);
    }
  }

  print(blocks: ContractBlock[], metadata: ContractMetadata, customization: ContractCustomization): void {
    const html = this.renderCompleteHtml(blocks, metadata, customization, true);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }

  private renderCompleteHtml(blocks: ContractBlock[], metadata: ContractMetadata, customization: ContractCustomization, forPrint = false): string {
    const styles = this.generateCSS(customization, forPrint);
    const body = this.renderHtmlForExport(blocks, metadata, customization);

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Contract</title>
    <style>${styles}</style>
</head>
<body>
    ${body}
</body>
</html>`;
  }

  private renderHtmlForExport(blocks: ContractBlock[], metadata: ContractMetadata, customization: ContractCustomization): string {
    const header = this.renderHeader(metadata, customization);
    const body = this.renderBlocks(blocks, customization);
    
    return `
      <div class="contract-document">
        ${header}
        <div class="contract-body">
          ${body}
        </div>
      </div>
    `;
  }

  private renderHeader(metadata: ContractMetadata, customization: ContractCustomization): string {
    if (!this.hasMetadataContent(metadata) && !customization.branding?.companyName) {
      return '';
    }

    return `
      <div class="contract-header">
        ${this.renderBranding(customization)}
        ${this.renderMetadata(metadata)}
      </div>
    `;
  }

  private renderBranding(customization: ContractCustomization): string {
    const branding = customization.branding;
    if (!branding?.companyName) return '';

    return `
      <div class="branding">
        <h1 class="company-name">${branding.companyName}</h1>
        ${branding.address ? `<p class="company-address">${branding.address}</p>` : ''}
        <div class="company-contacts">
          ${branding.phone ? `<span>Tel: ${branding.phone}</span>` : ''}
          ${branding.email ? `<span>Email: ${branding.email}</span>` : ''}
          ${branding.website ? `<span>Web: ${branding.website}</span>` : ''}
        </div>
      </div>
    `;
  }

  private renderMetadata(metadata: ContractMetadata): string {
    const items = [];

    if (metadata.templateId) items.push(`<p><strong>Template ID:</strong> ${metadata.templateId}</p>`);
    if (metadata.partyA && metadata.partyB) items.push(`<p><strong>Parties:</strong> ${metadata.partyA} and ${metadata.partyB}</p>`);
    if (metadata.effectiveDate) items.push(`<p><strong>Effective Date:</strong> ${new Date(metadata.effectiveDate).toDateString()}</p>`);
    if (metadata.contractValue > 0) items.push(`<p><strong>Contract Value:</strong> ${this.formatCurrency(metadata.contractValue, metadata.currency)}</p>`);
    if (metadata.jurisdiction) items.push(`<p><strong>Jurisdiction:</strong> ${metadata.jurisdiction}</p>`);

    return items.length > 0 ? `<div class="metadata">${items.join('')}</div>` : '';
  }

  private renderBlocks(blocks: ContractBlock[], customization: ContractCustomization): string {
    if (blocks.length === 0) return '';

    return blocks.map((block, index) => {
      const lineNumber = customization.features?.showLineNumbers ? 
        `<span class="line-number">${index + 1}</span>` : '';
      
      return `
        <div class="block-container">
          ${lineNumber}
          ${this.renderBlock(block, customization)}
        </div>
      `;
    }).join('');
  }

  private renderBlock(block: ContractBlock, customization: ContractCustomization): string {
    switch (block.type) {
      case 'heading':
        return `<h2 class="block-heading">${block.label || 'Untitled Heading'}</h2>`;
        
      case 'text':
        return `
          <div class="text-block">
            ${block.label ? `<p class="text-label">${block.label}:</p>` : ''}
            <p class="text-content">${block.value || ''}</p>
          </div>
        `;
        
      case 'date':
        const dateValue = block.value ? new Date(block.value).toLocaleDateString() : '';
        return `<p class="date-block"><strong>${block.label || 'Date'}:</strong> ${dateValue}</p>`;
        
      case 'number':
        return `<p class="number-block"><strong>${block.label || 'Number'}:</strong> ${block.value ?? ''}</p>`;
        
      case 'list':
        const listItems = (block.items || []).map(item => `<li>${item}</li>`).join('');
        return `
          <div class="list-block">
            ${block.label ? `<p class="list-label">${block.label}</p>` : ''}
            <ul>${listItems}</ul>
          </div>
        `;
        
      case 'table':
        return this.renderTableBlock(block);
        
      case 'signature':
        return `
          <div class="signature-block">
            <p class="signature-label">${block.label || 'Signature'}</p>
            <div class="signature-area">
              <p>____________________________</p>
              <p>Date: _______________</p>
            </div>
          </div>
        `;
        
      case 'divider':
        return '<hr class="divider">';
        
      default:
        return '';
    }
  }

  private renderTableBlock(block: ContractBlock): string {
    if (!block.headers || !block.rows) return '';

    const headerRow = block.headers.map(header => `<th>${header}</th>`).join('');
    const bodyRows = block.rows.map(row => 
      `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
    ).join('');

    return `
      <div class="table-block">
        ${block.label ? `<p class="table-label">${block.label}</p>` : ''}
        <table>
          <thead><tr>${headerRow}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
    `;
  }

  private convertBlockToDOCX(block: ContractBlock): any {
    switch (block.type) {
      case 'heading':
        return new Paragraph({ text: block.label || '', heading: 'Heading2' });
        
      case 'text':
        return new Paragraph({ 
          text: `${block.label ? `${block.label}: ` : ''}${block.value || ''}` 
        });
        
      case 'date':
        return new Paragraph({ 
          text: `${block.label || ''}: ${block.value ? new Date(block.value).toDateString() : ''}` 
        });
        
      case 'number':
        return new Paragraph({ 
          text: `${block.label || ''}: ${block.value ?? ''}` 
        });
        
      case 'divider':
        return new Paragraph({ text: '-------------------', spacing: { after: 200 } });
        
      case 'list':
        return new Paragraph({
          text: (block.items || []).join('\n'),
          bullet: { level: 0 }
        });
        
      case 'table':
        if (!block.headers || !block.rows) return new Paragraph('');
        return new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: block.headers.map(header => 
                new TableCell({ children: [new Paragraph(header)] })
              )
            }),
            ...block.rows.map(row => new TableRow({
              children: row.map(cell => 
                new TableCell({ children: [new Paragraph(cell.toString())] })
              )
            }))
          ]
        });
        
      default:
        return new Paragraph('');
    }
  }

  private generateCSS(customization: ContractCustomization, forPrint = false): string {
    return `
      body {
        font-family: ${customization.typography?.fontFamily || 'Arial'};
        font-size: ${customization.typography?.fontSize || 14}px;
        line-height: ${customization.typography?.lineHeight || 1.6};
        color: ${customization.theme?.textColor || '#000'};
        background: ${forPrint ? '#fff' : customization.theme?.backgroundColor || '#fff'};
        margin: 0;
        padding: ${customization.layout?.margins || 40}px;
      }
      
      .contract-document {
        max-width: 800px;
        margin: 0 auto;
      }
      
      .contract-header {
        background: ${customization.theme?.primaryColor || '#2563eb'}10;
        border-left: 4px solid ${customization.theme?.primaryColor || '#2563eb'};
        padding: 16px;
        margin-bottom: 24px;
        border-radius: 4px;
      }
      
      .branding {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid ${customization.theme?.primaryColor || '#2563eb'}20;
      }
      
      .company-name {
        color: ${customization.theme?.primaryColor || '#2563eb'};
        font-size: ${(customization.typography?.fontSize || 14) * (customization.typography?.headingScale || 1.25)}px;
        margin: 0 0 8px 0;
        font-weight: bold;
      }
      
      .company-address {
        margin: 0;
        opacity: 0.75;
        font-size: 14px;
      }
      
      .company-contacts {
        display: flex;
        gap: 16px;
        margin-top: 4px;
        font-size: 14px;
        opacity: 0.75;
      }
      
      .metadata {
        font-size: 14px;
      }
      
      .metadata p {
        margin: 4px 0;
      }
      
      .contract-body {
        margin-top: ${customization.layout?.spacing || 16}px;
      }
      
      .block-container {
        position: relative;
        margin-bottom: ${customization.layout?.spacing || 16}px;
      }
      
      .line-number {
        position: absolute;
        left: -30px;
        font-size: 12px;
        opacity: 0.3;
      }
      
      .block-heading {
        color: ${customization.theme?.primaryColor || '#2563eb'};
        font-size: ${(customization.typography?.fontSize || 14) * (customization.typography?.headingScale || 1.25)}px;
        font-weight: bold;
        margin: 16px 0 8px 0;
      }
      
      .text-block {
        margin-bottom: 16px;
      }
      
      .text-label {
        font-weight: 600;
        margin: 0 0 4px 0;
        color: ${customization.theme?.primaryColor || '#2563eb'};
      }
      
      .text-content {
        margin: 0;
        white-space: pre-wrap;
      }
      
      .date-block, .number-block {
        margin-bottom: 16px;
      }
      
      .list-block {
        margin-bottom: 16px;
      }
      
      .list-label {
        font-weight: 600;
        margin: 0 0 8px 0;
        color: ${customization.theme?.primaryColor || '#2563eb'};
      }
      
      .list-block ul {
        margin: 0;
        padding-left: 20px;
      }
      
      .table-block {
        margin-bottom: 16px;
      }
      
      .table-label {
        font-weight: 600;
        margin: 0 0 8px 0;
        color: ${customization.theme?.primaryColor || '#2563eb'};
      }
      
      .table-block table {
        width: 100%;
        border-collapse: collapse;
        margin: 0;
      }
      
      .table-block th, .table-block td {
        border: 1px solid ${customization.theme?.primaryColor || '#2563eb'}40;
        padding: 12px;
        text-align: left;
      }
      
      .table-block th {
        background: ${customization.theme?.primaryColor || '#2563eb'}10;
        font-weight: 600;
        color: ${customization.theme?.primaryColor || '#2563eb'};
      }
      
      .signature-block {
        margin-bottom: 24px;
      }
      
      .signature-label {
        font-weight: 600;
        margin: 0 0 12px 0;
        color: ${customization.theme?.primaryColor || '#2563eb'};
      }
      
      .signature-area {
        border: 2px dashed ${customization.theme?.primaryColor || '#2563eb'}40;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        background: ${customization.theme?.primaryColor || '#2563eb'}05;
      }
      
      .signature-area p {
        margin: 0;
      }
      
      .divider {
        border: none;
        height: 1px;
        background: ${customization.theme?.primaryColor || '#2563eb'}20;
        margin: 24px 0;
      }
      
      ${forPrint ? `
        @media print {
          body { margin: 0; padding: 20px; }
          .contract-header { break-inside: avoid; }
          .block-container { break-inside: avoid; }
        }
      ` : ''}
    `;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Generic helpers for dashboard/reports exports
  async exportElementAsPNG(element: HTMLElement, filename = 'export.png'): Promise<void> {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const dataUrl = canvas.toDataURL('image/png');
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    this.downloadBlob(blob, filename);
  }

  async exportElementAsPDF(element: HTMLElement, filename = 'export.pdf', orientation: 'p'|'l' = 'p'): Promise<void> {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF(orientation, 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
    const imgWidth = imgProps.width * ratio;
    const imgHeight = imgProps.height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = 10; // small top margin
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(filename);
  }

  exportToCSV(rows: Array<Record<string, any>>, filename = 'export.csv'): void {
    if (!rows || rows.length === 0) {
      const blob = new Blob([''], { type: 'text/csv;charset=utf-8;' });
      this.downloadBlob(blob, filename);
      return;
    }
    const headersSet = rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((k) => set.add(k))
      return set
    }, new Set<string>())
    const headers = Array.from(headersSet);

    const escapeCell = (val: any): string => {
      if (val === null || val === undefined) return '';
      const s = String(val).replace(/"/g, '""');
      if (/[",\n]/.test(s)) return `"${s}` + '"';
      return s;
    };

    const headerLine = headers.map(escapeCell).join(',');
    const lines = rows.map((row) => headers.map((h) => escapeCell(row[h])).join(','));
    const csv = [headerLine, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, filename);
  }

  // Convenience: export a table (array of arrays) to CSV with optional headers
  exportTableToCSV(headers: string[], rows: any[][], filename = 'export.csv'): void {
    const escapeCell = (val: any): string => {
      if (val === null || val === undefined) return '';
      const s = String(val).replace(/"/g, '""');
      if (/[",\n]/.test(s)) return `"${s}` + '"';
      return s;
    };
    const lines: string[] = [];
    if (headers && headers.length) lines.push(headers.map(escapeCell).join(','));
    for (const row of rows) lines.push(row.map(escapeCell).join(','));
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, filename);
  }

  private hasMetadataContent(metadata: ContractMetadata): boolean {
    return !!(
      metadata.templateId ||
      metadata.partyA ||
      metadata.partyB ||
      metadata.effectiveDate ||
      metadata.contractValue > 0 ||
      metadata.jurisdiction
    );
  }

  private formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(value);
  }
}