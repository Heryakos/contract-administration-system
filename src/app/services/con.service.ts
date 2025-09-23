import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable, BehaviorSubject, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import { environment } from "../../environments/environment"
import type { Contract, CreateContract, UpdateContract, ContractSummary, Vendor, ContractType, ContractCategory, ContractDocument } from "../models/contract.model"
import type { PaymentSchedule, Invoice, FinancialSummary } from "../modules/financial/services/financial.service"
import type { PendingApproval, ContractApprovalStatus, ApprovalActionRequest } from "../modules/approvals/services/approval.service"
import type { Risk } from "../modules/risks/services/risk.service"
import type { ComplianceRequirement } from "../modules/risks/services/compliance.service"

@Injectable({ providedIn: "root" })
export class ConService {
  private readonly API = environment.rootPath2
  constructor(private http: HttpClient) {
    // Initialize current employee from environment username if available
    const employeeId = environment.username
    if (employeeId && String(employeeId).trim().length > 0) {
      this.getEmployeeById(employeeId).subscribe({
        next: (emp) => this.currentEmployeeSubject.next(emp),
        error: (err) => {
          console.error('Failed to load employee data:', err);
          this.currentEmployeeSubject.next(null);
        },
      })
    } else {
      // If no employee ID is available, emit null immediately
      this.currentEmployeeSubject.next(null);
    }
  }

  // Current employee context
  private currentEmployeeSubject = new BehaviorSubject<any | null>(null)
  public currentEmployee$ = this.currentEmployeeSubject.asObservable()

  getCurrentEmployeeSnapshot(): any | null {
    return this.currentEmployeeSubject.value
  }

  getCurrentEmployeeId(): string | null {
    const emp = this.currentEmployeeSubject.value
    return emp?.employee_Id ?? null
  }

  getCurrentUserGuid(): string | null {
    const emp = this.currentEmployeeSubject.value;
    // The new API response is a direct employee object, not wrapped in c_Employees
    return emp?.user_ID ?? emp?.employee_Id ?? null;
  }

  // HRA Employee endpoint

  private readonly EmployeeProfile = `${environment.rootPath2}/EmployeeProfile`;

  getEmployeeById(employeeId: string): Observable<any> {
    return this.http.get<any>(`${this.EmployeeProfile}/get/employee/my/Profiles/${employeeId}`).pipe(
      catchError((err) => throwError(() => err))
    );
  }
  

  // private readonly CEmployee = `${this.API}/HRA/CEmployee/`

  // getEmployeeById(employeeId: string): Observable<any> {
  //   return this.http.get<any>(`${this.CEmployee}EmployeeId/${employeeId}`).pipe(
  //     catchError((err) => {
  //       return throwError(() => err)
  //     }),
  //   )
  // }
//   private EmployeeProfile=environment.rootPath2+'EmployeeProfile';

//   getMyProfiles(employeeid: string){
//   return this.http.get(this.EmployeeProfile+'/get/employee/my/Profiles/'+employeeid)
// }

  // Contracts
  getContracts(params?: { search?: string; status?: string }): Observable<Contract[]> {
    let hp = new HttpParams()
    if (params?.search) hp = hp.set("search", params.search)
    if (params?.status) hp = hp.set("status", params.status)
    return this.http.get<Contract[]>(`${this.API}/CON_contracts`, { params: hp })
  }
  getContract(id: string | number): Observable<Contract> {
    return this.http.get<Contract>(`${this.API}/CON_contracts/${id}`)
  }
  // Document endpoints
  getContractDocuments(contractId: number): Observable<ContractDocument[]> {
    return this.http.get<ContractDocument[]>(`${this.API}/CON_contracts/${contractId}/documents`)
  }
  uploadContractDocument(contractId: number, file: File, uploadedByUserId?: string): Observable<ContractDocument> {
    const form = new FormData()
    form.append("file", file)
    if (uploadedByUserId) form.append("uploadedByUserID", uploadedByUserId)
    return this.http.post<ContractDocument>(`${this.API}/CON_contracts/${contractId}/documents`, form)
  }
  deleteContractDocument(contractId: number, documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/CON_contracts/${contractId}/documents/${documentId}`)
  }
  createContract(payload: CreateContract): Observable<any> {
    return this.http.post(`${this.API}/CON_contracts`, payload)
  }
  updateContract(id: string | number, payload: UpdateContract): Observable<void> {
    return this.http.put<void>(`${this.API}/CON_contracts/${id}`, payload as any)
  }
  deleteContract(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.API}/CON_contracts/${id}`)
  }
  getContractSummary(): Observable<ContractSummary> {
    return this.http.get<ContractSummary>(`${this.API}/CON_Contracts/contract-summary`)
  }
  getVendors(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.API}/CON_contracts/vendors`)
  }
  getContractTypes(): Observable<ContractType[]> {
    return this.http.get<ContractType[]>(`${this.API}/CON_contracts/types`)
  }
  getContractCategories(): Observable<ContractCategory[]> {
    return this.http.get<ContractCategory[]>(`${this.API}/CON_contracts/categories`)
  }

  // Financial
  getFinancialSummary(): Observable<FinancialSummary> {
    return this.http.get<FinancialSummary>(`${this.API}/CON_financial/financial-summary`)
  }
  getPaymentSchedulesByContract(contractId: number): Observable<PaymentSchedule[]> {
    return this.http.get<PaymentSchedule[]>(`${this.API}/CON_financial/payment-schedules/contract/${contractId}`)
  }
  getUpcomingPayments(days = 30): Observable<PaymentSchedule[]> {
    return this.http.get<PaymentSchedule[]>(`${this.API}/CON_financial/payment-schedules/upcoming`, { params: new HttpParams().set("days", String(days)) })
  }
  createPaymentSchedule(schedule: any): Observable<PaymentSchedule> {
    return this.http.post<PaymentSchedule>(`${this.API}/CON_financial/payment-schedules`, schedule)
  }
  updatePaymentSchedule(id: number, schedule: any): Observable<void> {
    return this.http.put<void>(`${this.API}/CON_financial/payment-schedules/${id}`, schedule)
  }
  deletePaymentSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/CON_financial/payment-schedules/${id}`)
  }
  getInvoices(status?: string): Observable<Invoice[]> {
    const params = status ? new HttpParams().set("status", status) : undefined
    return this.http.get<Invoice[]>(`${this.API}/CON_financial/invoices`, { params })
  }
  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.API}/CON_financial/invoices/${id}`)
  }
  createInvoice(invoice: any): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.API}/CON_financial/invoices`, invoice)
  }
  approveInvoice(id: number, approvedBy: number): Observable<any> {
    return this.http.post(`${this.API}/CON_financial/invoices/${id}/approve`, approvedBy)
  }
  rejectInvoice(id: number, rejectedBy: number): Observable<any> {
    return this.http.post(`${this.API}/CON_financial/invoices/${id}/reject`, rejectedBy)
  }
  markInvoicePaid(id: number): Observable<any> {
    return this.http.post(`${this.API}/CON_financial/invoices/${id}/mark-paid`, {})
  }

  // Approvals
  getPendingApprovals(userGuid: string): Observable<PendingApproval[]> {
    return this.http.get<PendingApproval[]>(`${this.API}/CON_approvals/pending/${userGuid}`);
  }

  getContractApprovalStatus(contractId: number): Observable<ContractApprovalStatus> {
    return this.http.get<ContractApprovalStatus>(`${this.API}/CON_approvals/contract/${contractId}/current`)
  }
  submitContractForApproval(contractId: number, comments?: string): Observable<any> {
    return this.http.post(`${this.API}/CON_approvals/contract/${contractId}/submit`, { comments })
  }
  approveStep(approvalId: number, request: any): Observable<any> {
    return this.http.post(`${this.API}/CON_approvals/approve/${approvalId}`, request)
  }
  rejectStep(approvalId: number, request: any): Observable<any> {
    return this.http.post(`${this.API}/CON_approvals/reject/${approvalId}`, request)
  }

  // Risks & Compliance
  getRisks(params?: { contractId?: number; category?: string; status?: string }): Observable<Risk[]> {
    let hp = new HttpParams()
    if (params?.contractId) hp = hp.set("contractId", String(params.contractId))
    if (params?.category) hp = hp.set("category", params.category)
    if (params?.status) hp = hp.set("status", params.status)
    return this.http.get<Risk[]>(`${this.API}/CON_riskcompliance/risks`, { params: hp })
  }
  getRisk(id: number): Observable<Risk> {
    return this.http.get<Risk>(`${this.API}/CON_riskcompliance/risks/${id}`)
  }
  createRisk(risk: any): Observable<Risk> {
    return this.http.post<Risk>(`${this.API}/CON_riskcompliance/risks`, risk)
  }
  updateRisk(id: number, risk: any): Observable<void> {
    return this.http.put<void>(`${this.API}/CON_riskcompliance/risks/${id}`, risk)
  }
  getComplianceRequirements(params?: { contractId?: number; type?: string; status?: string }): Observable<ComplianceRequirement[]> {
    let hp = new HttpParams()
    if (params?.contractId) hp = hp.set("contractId", String(params.contractId))
    if (params?.type) hp = hp.set("type", params.type)
    if (params?.status) hp = hp.set("status", params.status)
    return this.http.get<ComplianceRequirement[]>(`${this.API}/CON_riskcompliance/compliance`, { params: hp })
  }
  getComplianceRequirement(id: number): Observable<ComplianceRequirement> {
    return this.http.get<ComplianceRequirement>(`${this.API}/CON_riskcompliance/compliance/${id}`)
  }
  createComplianceRequirement(req: any): Observable<ComplianceRequirement> {
    return this.http.post<ComplianceRequirement>(`${this.API}/CON_riskcompliance/compliance`, req)
  }
  updateComplianceRequirement(id: number, req: any): Observable<void> {
    return this.http.put<void>(`${this.API}/CON_riskcompliance/compliance/${id}`, req)
  }

  // Obligations
  getObligations(params?: { contractId?: number; type?: string; status?: string; dueWithinDays?: number }): Observable<any[]> {
    let hp = new HttpParams()
    if (params?.contractId) hp = hp.set("contractId", String(params.contractId))
    if (params?.type) hp = hp.set("type", params.type)
    if (params?.status) hp = hp.set("status", params.status)
    if (params?.dueWithinDays) hp = hp.set("dueWithinDays", String(params.dueWithinDays))
    return this.http.get<any[]>(`${this.API}/CON_ObligationsReports/obligations`, { params: hp })
  }
  getObligation(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/CON_ObligationsReports/obligations/${id}`)
  }
  createObligation(payload: any): Observable<{ obligationId: number }> {
    return this.http.post<{ obligationId: number }>(`${this.API}/CON_ObligationsReports/obligations`, payload)
  }
  updateObligation(id: number, payload: any): Observable<void> {
    return this.http.put<void>(`${this.API}/CON_ObligationsReports/obligations/${id}`, payload)
  }
  deleteObligation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/CON_ObligationsReports/obligations/${id}`)
  }
  getObligationsDashboard(): Observable<any> {
    return this.http.get<any>(`${this.API}/CON_ObligationsReports/obligations/dashboard`)
  }

  // Reports
  getReportsDashboard(): Observable<any> {
    return this.http.get<any>(`${this.API}/CON_ObligationsReports/reports/dashboard`)
  }
}