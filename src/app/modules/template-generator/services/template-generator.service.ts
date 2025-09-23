import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ContractBlock } from '../../../interfaces/contract-generator.interface';

export interface TemplateModel {
  templateID?: number;
  templateName: string;
  templateDescription?: string;
  templateCategory: string;
  templateContent: string; // JSON structure of blocks
  status: string;
  createdByUserID?: string;
  createdDate?: Date;
  approvedByUserID?: string;
  approvedDate?: Date;
  rejectionReason?: string;
  modificationNotes?: string;
  version: number;
  isActive: boolean;
}

export interface CreateTemplateDto {
  templateName: string;
  templateDescription?: string;
  templateCategory: string;
  templateContent: string;
  status: string;
  modificationNotes?: string;
}

export interface UpdateTemplateDto {
  templateName?: string;
  templateDescription?: string;
  templateCategory?: string;
  templateContent?: string;
  status?: string;
  modificationNotes?: string;
}

export interface TemplateBlock extends ContractBlock {
  isEditable?: boolean;
  isRequired?: boolean;
  helpText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateGeneratorService {
  private apiUrl = `${environment.rootApiPath}/api/templates`;

  constructor(private http: HttpClient) {}

  // Get all templates
  getTemplates(): Observable<TemplateModel[]> {
    return this.http.get<TemplateModel[]>(this.apiUrl);
  }

  // Get template by ID
  getTemplate(id: number): Observable<TemplateModel> {
    return this.http.get<TemplateModel>(`${this.apiUrl}/${id}`);
  }

  // Create new template
  createTemplate(template: CreateTemplateDto): Observable<TemplateModel> {
    return this.http.post<TemplateModel>(this.apiUrl, template);
  }

  // Update template
  updateTemplate(id: number, template: UpdateTemplateDto): Observable<TemplateModel> {
    return this.http.put<TemplateModel>(`${this.apiUrl}/${id}`, template);
  }

  // Delete template
  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Submit for approval
  submitForApproval(id: number): Observable<TemplateModel> {
    return this.http.post<TemplateModel>(`${this.apiUrl}/${id}/submit-approval`, {});
  }

  // Approve template
  approveTemplate(id: number, approverId: string): Observable<TemplateModel> {
    return this.http.post<TemplateModel>(`${this.apiUrl}/${id}/approve`, { approverId });
  }

  // Reject template
  rejectTemplate(id: number, rejectionReason: string): Observable<TemplateModel> {
    return this.http.post<TemplateModel>(`${this.apiUrl}/${id}/reject`, { rejectionReason });
  }

  // Get templates by category
  getTemplatesByCategory(category: string): Observable<TemplateModel[]> {
    return this.http.get<TemplateModel[]>(`${this.apiUrl}/category/${category}`);
  }

  // Get templates by status
  getTemplatesByStatus(status: string): Observable<TemplateModel[]> {
    return this.http.get<TemplateModel[]>(`${this.apiUrl}/status/${status}`);
  }

  // Search templates
  searchTemplates(query: string): Observable<TemplateModel[]> {
    return this.http.get<TemplateModel[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
  }

  // Get template categories
  getTemplateCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  // Duplicate template
  duplicateTemplate(id: number): Observable<TemplateModel> {
    return this.http.post<TemplateModel>(`${this.apiUrl}/${id}/duplicate`, {});
  }

  // Get template usage statistics
  getTemplateUsageStats(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/usage-stats`);
  }
}