import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ClauseModel {
  clauseID?: number;
  clauseTitle: string;
  clauseContent: string;
  clauseCategory: string;
  clauseTags?: string;
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

export interface CreateClauseDto {
  clauseTitle: string;
  clauseContent: string;
  clauseCategory: string;
  clauseTags?: string;
  status?: string; // Optional status for create
  modificationNotes?: string;
}

export interface UpdateClauseDto {
  clauseTitle?: string;
  clauseContent?: string;
  clauseCategory?: string;
  clauseTags?: string;
  status?: string;
  modificationNotes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClauseGeneratorService {
  private apiUrl = `${environment.rootApiPath}/api/clauses`;

  constructor(private http: HttpClient) {}

  // Get all clauses
  getClauses(): Observable<ClauseModel[]> {
    return this.http.get<ClauseModel[]>(this.apiUrl);
  }

  // Get clause by ID
  getClause(id: number): Observable<ClauseModel> {
    return this.http.get<ClauseModel>(`${this.apiUrl}/${id}`);
  }

  // Create new clause
  createClause(clause: CreateClauseDto): Observable<ClauseModel> {
    return this.http.post<ClauseModel>(this.apiUrl, clause);
  }

  // Update clause
  updateClause(id: number, clause: UpdateClauseDto): Observable<ClauseModel> {
    return this.http.put<ClauseModel>(`${this.apiUrl}/${id}`, clause);
  }

  // Delete clause
  deleteClause(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Submit for approval - Fixed: only takes id parameter
  submitForApproval(id: number): Observable<ClauseModel> {
    return this.http.post<ClauseModel>(`${this.apiUrl}/${id}/submit-approval`, {});
  }

  // Approve clause
  approveClause(id: number, approverId: string): Observable<ClauseModel> {
    return this.http.post<ClauseModel>(`${this.apiUrl}/${id}/approve`, { approverId });
  }

  // Reject clause
  rejectClause(id: number, rejectionReason: string): Observable<ClauseModel> {
    return this.http.post<ClauseModel>(`${this.apiUrl}/${id}/reject`, { rejectionReason });
  }

  // Get clauses by category
  getClausesByCategory(category: string): Observable<ClauseModel[]> {
    return this.http.get<ClauseModel[]>(`${this.apiUrl}/category/${category}`);
  }

  // Get clauses by status
  getClausesByStatus(status: string): Observable<ClauseModel[]> {
    return this.http.get<ClauseModel[]>(`${this.apiUrl}/status/${status}`);
  }

  // Search clauses
  searchClauses(query: string): Observable<ClauseModel[]> {
    return this.http.get<ClauseModel[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
  }

  // Get clause categories
  getClauseCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  // Get default clause tags - NEW METHOD
  getDefaultClauseTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/default-tags`);
  }

  // Get default clause tags (fallback method without API call)
  getDefaultClauseTagsFallback(): string[] {
    return ['standard', 'essential', 'optional', 'critical', 'regulatory', 'commercial', 'technical', 'legal-required'];
  }

  // Duplicate clause
  duplicateClause(id: number): Observable<ClauseModel> {
    return this.http.post<ClauseModel>(`${this.apiUrl}/${id}/duplicate`, {});
  }

  // Get clause usage statistics
  getClauseUsageStats(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/usage-stats`);
  }
}