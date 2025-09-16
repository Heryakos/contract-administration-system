import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { type Observable, of } from "rxjs"
import { delay } from "rxjs/operators"
import { environment } from "../../environments/environment"
import { type Contract, type CreateContract, type UpdateContract, type ContractSummary, type Vendor, type ContractType, type ContractCategory } from "../models/contract.model"
import { type FinancialSummary, type Invoice, type PaymentSchedule } from "../modules/financial/services/financial.service"
import { type PendingApproval, type ContractApprovalStatus, type ApprovalActionRequest } from "../modules/approvals/services/approval.service"
import { type Risk, type CreateRisk, type UpdateRisk, type RiskDashboard } from "../modules/risks/services/risk.service"
import { type ComplianceRequirement, type CreateComplianceRequirement, type UpdateComplianceRequirement, type ComplianceDashboard } from "../modules/risks/services/compliance.service"
import { type ContractBlock } from "../interfaces/contract.interface"

@Injectable({ providedIn: "root" })
export class ApiService {
  public readonly api = environment.apiUrl
  constructor(public readonly http: HttpClient) {}

  // Toggle mocks here (or wire to environment flag)
  private readonly useMocks = true
  private mock<T>(data: T, ms = 200): Observable<T> {
    return of(data).pipe(delay(ms))
  }

  // Contracts
  getContracts(params?: { page?: number; pageSize?: number; search?: string; status?: string; vendorId?: string }): Observable<Contract[]> {
    if (this.useMocks) {
      const all: Contract[] = [
        {
          contractID: "C-001",
          contractNumber: "CNT-2025-001",
          contractTitle: "IT Support Services",
          contractType: "Service",
          category: "IT",
          vendorName: "TechCorp",
          contractValue: 120000,
          currency: "USD",
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
          status: "Active",
          description: "Annual IT support and maintenance",
          riskLevel: "Medium",
          version: 1,
          createdBy: "admin",
          createdDate: new Date(),
          modifiedBy: "admin",
          modifiedDate: new Date(),
          daysToExpiry: 300,
          expiryStatus: "On Track",
          completionPercentage: 10,
        },
        {
          contractID: "C-002",
          contractNumber: "CNT-2025-002",
          contractTitle: "Office Supplies",
          contractType: "Purchase",
          category: "Procurement",
          vendorName: "OfficePlus",
          contractValue: 30000,
          currency: "USD",
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          status: "Approved",
          description: "Supply of office materials",
          riskLevel: "Low",
          version: 1,
          createdBy: "buyer1",
          createdDate: new Date(),
          modifiedBy: "buyer1",
          modifiedDate: new Date(),
          daysToExpiry: 150,
          expiryStatus: "On Track",
          completionPercentage: 30,
        },
      ]
      return this.mock(all)
    }
    let httpParams = new HttpParams()
    if (params) {
      if (params.page) httpParams = httpParams.set("page", String(params.page))
      if (params.pageSize) httpParams = httpParams.set("pageSize", String(params.pageSize))
      if (params.search) httpParams = httpParams.set("search", params.search)
      if (params.status) httpParams = httpParams.set("status", params.status)
      if (params.vendorId) httpParams = httpParams.set("vendorId", params.vendorId)
    }
    return this.http.get<Contract[]>(`${this.api}/contracts`, { params: httpParams })
  }
  getContract(id: string): Observable<Contract> {
    if (this.useMocks) {
      const one: Contract = {
        contractID: id,
        contractNumber: "CNT-TEST-001",
        contractTitle: "Mock Contract",
        contractType: "Service",
        category: "General",
        vendorName: "Mock Vendor",
        contractValue: 50000,
        currency: "USD",
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        status: "Active",
        description: "Mock description",
        riskLevel: "Low",
        version: 1,
        createdBy: "system",
        createdDate: new Date(),
        modifiedBy: "system",
        modifiedDate: new Date(),
        daysToExpiry: 80,
        expiryStatus: "On Track",
        completionPercentage: 50,
      }
      return this.mock(one)
    }
    return this.http.get<Contract>(`${this.api}/contracts/${id}`)
  }
  createContract(contract: CreateContract): Observable<Contract> {
    if (this.useMocks) {
      const created: Contract = {
        contractID: "C-NEW",
        contractNumber: contract.contractNumber,
        contractTitle: contract.contractTitle,
        contractType: "Service",
        category: "General",
        vendorName: "Vendor X",
        contractValue: contract.contractValue ?? 0,
        currency: contract.currency,
        startDate: contract.startDate || new Date(),
        endDate: contract.endDate || new Date(),
        status: "Draft",
        description: contract.description,
        riskLevel: contract.riskLevel,
        version: 1,
        createdBy: "you",
        createdDate: new Date(),
        modifiedBy: "you",
        modifiedDate: new Date(),
        daysToExpiry: 90,
        expiryStatus: "On Track",
        completionPercentage: 0,
      }
      return this.mock(created)
    }
    return this.http.post<Contract>(`${this.api}/contracts`, contract)
  }
  updateContract(id: string, contract: UpdateContract): Observable<void> {
    if (this.useMocks) return this.mock(void 0)
    return this.http.put<void>(`${this.api}/contracts/${id}`, contract)
  }
  deleteContract(id: string): Observable<void> {
    if (this.useMocks) return this.mock(void 0)
    return this.http.delete<void>(`${this.api}/contracts/${id}`)
  }
  getContractSummary(): Observable<ContractSummary> {
    if (this.useMocks) {
      const summary: ContractSummary = {
        totalContracts: 12,
        activeContracts: 7,
        expiringContracts: 2,
        expiredContracts: 1,
        totalValue: 800000,
        pendingApprovals: 3,
        overdueObligations: 1,
      }
      return this.mock(summary)
    }
    return this.http.get<ContractSummary>(`${this.api}/contracts/summary`)
  }
  getVendors(): Observable<Vendor[]> {
    if (this.useMocks) {
      const vendors: Vendor[] = [
        { vendorID: "V-1", vendorName: "TechCorp", vendorCode: "TC", rating: 5, isActive: true, totalContracts: 3, totalContractValue: 200000 },
        { vendorID: "V-2", vendorName: "OfficePlus", vendorCode: "OP", rating: 4, isActive: true, totalContracts: 2, totalContractValue: 60000 },
      ]
      return this.mock(vendors)
    }
    return this.http.get<Vendor[]>(`${this.api}/vendors`)
  }
  getContractTypes(): Observable<ContractType[]> {
    if (this.useMocks) {
      const types: ContractType[] = [
        { contractTypeID: "CT-1", typeName: "Service", description: "Service type", isActive: true },
        { contractTypeID: "CT-2", typeName: "Purchase", description: "Purchase type", isActive: true },
      ] as any
      return this.mock(types)
    }
    return this.http.get<ContractType[]>(`${this.api}/contract-types`)
  }
  getContractCategories(): Observable<ContractCategory[]> {
    if (this.useMocks) {
      const cats: ContractCategory[] = [
        { categoryID: "CAT-1", categoryName: "IT", description: "IT related", isActive: true },
        { categoryID: "CAT-2", categoryName: "Procurement", description: "Procurement", isActive: true },
      ] as any
      return this.mock(cats)
    }
    return this.http.get<ContractCategory[]>(`${this.api}/contract-categories`)
  }

  // Financial
  getFinancialSummary(): Observable<FinancialSummary> {
    if (this.useMocks) {
      const fs: FinancialSummary = {
        totalContractValue: 800000,
        totalScheduledPayments: 500000,
        totalPaidAmount: 300000,
        totalPendingPayments: 200000,
        totalOverduePayments: 20000,
        totalPenalties: 1000,
        upcomingPaymentsCount: 4,
        pendingInvoicesCount: 2,
        overduePaymentsCount: 1,
      }
      return this.mock(fs)
    }
    return this.http.get<FinancialSummary>(`${this.api}/financial/summary`)
  }
  getInvoices(status?: string): Observable<Invoice[]> {
    if (this.useMocks) {
      const invs: Invoice[] = [
        { invoiceID: "I-1", contractID: "C-001", contractTitle: "IT Support Services", contractNumber: "CNT-2025-001", invoiceNumber: "INV-1001", invoiceDate: new Date(), amount: 10000, status: "Submitted", submittedBy: "john", submittedDate: new Date() },
        { invoiceID: "I-2", contractID: "C-001", contractTitle: "IT Support Services", contractNumber: "CNT-2025-001", invoiceNumber: "INV-1002", invoiceDate: new Date(), amount: 8000, status: "Approved", approvedBy: "manager", approvalDate: new Date(), submittedDate: new Date() },
      ]
      return this.mock(invs)
    }
    const params = status ? new HttpParams().set("status", status) : undefined
    return this.http.get<Invoice[]>(`${this.api}/invoices`, { params })
  }
  getInvoice(id: string): Observable<Invoice> {
    if (this.useMocks) {
      const inv: Invoice = { invoiceID: id, contractID: "C-001", contractTitle: "IT Support Services", contractNumber: "CNT-2025-001", invoiceNumber: "INV-1001", invoiceDate: new Date(), amount: 10000, status: "Submitted", submittedBy: "john", submittedDate: new Date() }
      return this.mock(inv)
    }
    return this.http.get<Invoice>(`${this.api}/invoices/${id}`)
  }
  createInvoice(invoice: any): Observable<Invoice> {
    if (this.useMocks) {
      const created: Invoice = { ...invoice, invoiceID: "I-NEW", status: "Submitted", submittedDate: new Date() }
      return this.mock(created)
    }
    return this.http.post<Invoice>(`${this.api}/invoices`, invoice)
  }
  approveInvoice(id: string, approvedBy: string): Observable<any> {
    if (this.useMocks) return this.mock({ ok: true })
    return this.http.post(`${this.api}/invoices/${id}/approve`, { approvedBy })
  }
  rejectInvoice(id: string, rejectedBy: string): Observable<any> {
    if (this.useMocks) return this.mock({ ok: true })
    return this.http.post(`${this.api}/invoices/${id}/reject`, { rejectedBy })
  }
  markInvoicePaid(id: string): Observable<any> {
    if (this.useMocks) return this.mock({ ok: true })
    return this.http.post(`${this.api}/invoices/${id}/mark-paid`, {})
  }
  getUpcomingPayments(days = 30): Observable<PaymentSchedule[]> {
    if (this.useMocks) {
      const pays: PaymentSchedule[] = [
        { paymentScheduleID: "P-1", contractID: "C-001", contractTitle: "IT Support Services", contractNumber: "CNT-2025-001", paymentNumber: 1, scheduledAmount: 5000, scheduledDate: new Date(), status: "Due", createdDate: new Date(), invoiceCount: 1, paidAmount: 0, daysUntilDue: 5 },
        { paymentScheduleID: "P-2", contractID: "C-002", contractTitle: "Office Supplies", contractNumber: "CNT-2025-002", paymentNumber: 1, scheduledAmount: 3000, scheduledDate: new Date(), status: "Overdue", createdDate: new Date(), invoiceCount: 0, paidAmount: 0, daysUntilDue: -2 },
      ]
      return this.mock(pays)
    }
    return this.http.get<PaymentSchedule[]>(`${this.api}/payment-schedules/upcoming`, {
      params: new HttpParams().set("days", String(days)),
    })
  }
  getPaymentSchedulesByContract(contractId: string): Observable<PaymentSchedule[]> {
    if (this.useMocks) {
      const pays: PaymentSchedule[] = [
        { paymentScheduleID: "P-1", contractID: contractId, contractTitle: "IT Support Services", contractNumber: "CNT-2025-001", paymentNumber: 1, scheduledAmount: 5000, scheduledDate: new Date(), status: "Due", createdDate: new Date(), invoiceCount: 1, paidAmount: 0, daysUntilDue: 5 },
      ]
      return this.mock(pays)
    }
    return this.http.get<PaymentSchedule[]>(`${this.api}/payment-schedules/contract/${contractId}`)
  }
  createPaymentSchedule(schedule: any): Observable<PaymentSchedule> {
    if (this.useMocks) return this.mock({ ...schedule, paymentScheduleID: "P-NEW" })
    return this.http.post<PaymentSchedule>(`${this.api}/payment-schedules`, schedule)
  }
  updatePaymentSchedule(id: string, schedule: any): Observable<void> {
    if (this.useMocks) return this.mock(void 0)
    return this.http.put<void>(`${this.api}/payment-schedules/${id}`, schedule)
  }
  deletePaymentSchedule(id: string): Observable<void> {
    if (this.useMocks) return this.mock(void 0)
    return this.http.delete<void>(`${this.api}/payment-schedules/${id}`)
  }

  // Approvals
  getPendingApprovals(userId: string): Observable<PendingApproval[]> {
    if (this.useMocks) {
      const items: PendingApproval[] = [
        { approvalID: "A-1", contractID: "C-001", contractTitle: "IT Support Services", contractNumber: "CNT-2025-001", contractValue: 120000, stepName: "Department Head", stepOrder: 1, createdDate: new Date(), daysWaiting: 2 },
      ]
      return this.mock(items)
    }
    return this.http.get<PendingApproval[]>(`${this.api}/approval-workflows/pending/${userId}`)
  }
  getContractApprovalStatus(contractId: string): Observable<ContractApprovalStatus> {
    if (this.useMocks) {
      const status: ContractApprovalStatus = {
        contractID: contractId,
        contractTitle: "IT Support Services",
        overallStatus: "Under Review",
        currentStepName: "Department Head",
        currentStepOrder: 1,
        approvals: [
          { approvalID: "A-1", stepName: "Department Head", stepOrder: 1, approverName: "Jane", status: "Pending", createdDate: new Date() },
        ],
      }
      return this.mock(status)
    }
    return this.http.get<ContractApprovalStatus>(`${this.api}/approval-workflows/contract/${contractId}/current`)
  }
  submitContractForApproval(contractId: string, comments?: string): Observable<any> {
    if (this.useMocks) return this.mock({ ok: true })
    return this.http.post(`${this.api}/approval-workflows/contract/${contractId}/submit`, { comments })
  }
  approveStep(approvalId: string, request: ApprovalActionRequest): Observable<any> {
    if (this.useMocks) return this.mock({ ok: true })
    return this.http.post(`${this.api}/approval-workflows/approve/${approvalId}`, request)
  }
  rejectStep(approvalId: string, request: ApprovalActionRequest): Observable<any> {
    if (this.useMocks) return this.mock({ ok: true })
    return this.http.post(`${this.api}/approval-workflows/reject/${approvalId}`, request)
  }

  // Risks & Compliance
  getRisks(params?: { contractId?: number; category?: string; status?: string }): Observable<Risk[]> {
    if (this.useMocks) {
      const risks: Risk[] = [
        { id: 1, contractId: 1, contractTitle: "IT Support Services", riskTitle: "Vendor SLA Risk", riskDescription: "Potential SLA breach", riskCategory: "Operational", likelihood: 2, impact: 3, riskScore: 6, status: "Open", mitigationPlan: "Monitor SLAs", assignedToId: 1, assignedToName: "Alex", createdDate: new Date(), lastUpdated: new Date() },
      ]
      return this.mock(risks)
    }
    let hp = new HttpParams()
    if (params?.contractId) hp = hp.set("contractId", String(params.contractId))
    if (params?.category) hp = hp.set("category", params.category)
    if (params?.status) hp = hp.set("status", params.status)
    return this.http.get<Risk[]>(`${this.api}/risks`, { params: hp })
  }
  getRisk(id: number): Observable<Risk> {
    if (this.useMocks) {
      const risk: Risk = { id, contractId: 1, contractTitle: "IT Support Services", riskTitle: "Vendor SLA Risk", riskDescription: "Potential SLA breach", riskCategory: "Operational", likelihood: 2, impact: 3, riskScore: 6, status: "Open", mitigationPlan: "Monitor SLAs", assignedToId: 1, assignedToName: "Alex", createdDate: new Date(), lastUpdated: new Date() }
      return this.mock(risk)
    }
    return this.http.get<Risk>(`${this.api}/risks/${id}`)
  }
  createRisk(risk: CreateRisk): Observable<Risk> {
    if (this.useMocks) return this.mock({ ...(risk as any), id: Math.floor(Math.random() * 1000), riskScore: (risk.likelihood || 1) * (risk.impact || 1), status: "Open", createdDate: new Date(), lastUpdated: new Date() })
    return this.http.post<Risk>(`${this.api}/risks`, risk)
  }
  updateRisk(id: number, risk: UpdateRisk): Observable<void> {
    if (this.useMocks) return this.mock(void 0)
    return this.http.put<void>(`${this.api}/risks/${id}`, risk)
  }
  getRiskDashboard(): Observable<RiskDashboard> {
    if (this.useMocks) {
      const db: RiskDashboard = {
        totalRisks: 8,
        criticalRisks: 1,
        highRisks: 2,
        openRisks: 5,
        risksByCategory: {
          Operational: 3,
          Legal: 2,
          Financial: 1,
          Compliance: 2,
        },
      }
      return this.mock(db)
    }
    return this.http.get<RiskDashboard>(`${this.api}/risks/dashboard`)
  }
  getComplianceRequirements(params?: { contractId?: number; type?: string; status?: string }): Observable<ComplianceRequirement[]> {
    if (this.useMocks) {
      const reqs: ComplianceRequirement[] = [
        { id: 1, contractId: 1, contractTitle: "IT Support Services", requirementTitle: "ISO Compliance", requirementType: "Regulatory", dueDate: new Date(), status: "In Progress", createdDate: new Date() },
      ] as any
      return this.mock(reqs)
    }
    let hp = new HttpParams()
    if (params?.contractId) hp = hp.set("contractId", String(params.contractId))
    if (params?.type) hp = hp.set("type", params.type)
    if (params?.status) hp = hp.set("status", params.status)
    return this.http.get<ComplianceRequirement[]>(`${this.api}/compliance`, { params: hp })
  }
  getComplianceRequirement(id: number): Observable<ComplianceRequirement> {
    if (this.useMocks) {
      const req: ComplianceRequirement = { id, contractId: 1, contractTitle: "IT Support Services", requirementTitle: "ISO Compliance", requirementType: "Regulatory", dueDate: new Date(), status: "In Progress", createdDate: new Date() } as any
      return this.mock(req)
    }
    return this.http.get<ComplianceRequirement>(`${this.api}/compliance/${id}`)
  }
  createComplianceRequirement(req: CreateComplianceRequirement): Observable<ComplianceRequirement> {
    if (this.useMocks) return this.mock({ ...(req as any), id: Math.floor(Math.random() * 1000), createdDate: new Date(), status: "Pending" })
    return this.http.post<ComplianceRequirement>(`${this.api}/compliance`, req)
  }
  updateComplianceRequirement(id: number, req: UpdateComplianceRequirement): Observable<void> {
    if (this.useMocks) return this.mock(void 0)
    return this.http.put<void>(`${this.api}/compliance/${id}`, req)
  }
  getComplianceDashboard(): Observable<ComplianceDashboard> {
    if (this.useMocks) {
      const cdb: ComplianceDashboard = {
        totalRequirements: 12,
        completedRequirements: 6,
        overdueRequirements: 2,
        dueSoon: 3,
        complianceRate: 75,
        requirementsByType: {
          Regulatory: 5,
          Legal: 3,
          Financial: 2,
          Safety: 2,
        },
      }
      return this.mock(cdb)
    }
    return this.http.get<ComplianceDashboard>(`${this.api}/compliance/dashboard`)
  }

  // Authoring: Templates & Clauses (Mocks)
  getTemplates(): Observable<Array<{ id: string; name: string; type: string; blocks?: ContractBlock[] }>> {
    if (this.useMocks) {
      return this.mock([
        { 
          id: "T-1", 
          name: "Procurement", 
          type: "Procurement",
          blocks: [
            { id: "b1", type: "heading", label: "Procurement Contract" },
            { id: "b2", type: "text", label: "Terms", value: "Standard procurement terms apply" }
          ]
        },
        { 
          id: "T-2", 
          name: "Service Agreement", 
          type: "Service",
          blocks: [
            { id: "b1", type: "heading", label: "Service Agreement" },
            { id: "b2", type: "text", label: "Scope", value: "Service scope and deliverables" }
          ]
        }
      ])
    }
    return this.http.get<Array<{ id: string; name: string; type: string; blocks?: ContractBlock[] }>>(`${this.api}/templates`)
  }
  

  getClauses(): Observable<Array<{ id: string; title: string; text: string; tags: string[] }>> {
    if (this.useMocks) {
      return this.mock([
        { id: "C-Conf", title: "Confidentiality", text: "Both parties agree to confidentiality...", tags: ["Mandatory"] },
        { id: "C-Term", title: "Termination", text: "Either party may terminate with 30 days notice...", tags: ["Optional"] },
        { id: "C-Liab", title: "Liability", text: "Liability is limited to fees paid...", tags: ["Risky"] },
        { id: "C-Disp", title: "Dispute Resolution", text: "Disputes will be resolved via arbitration...", tags: ["Jurisdiction-Specific"] },
      ])
    }
    return this.http.get<Array<{ id: string; title: string; text: string; tags: string[] }>>(`${this.api}/clauses`)
  }

  saveDraft(payload: any): Observable<{ draftId: string; version: number; createdAt: string }> {
    if (this.useMocks) {
      return this.mock({ draftId: `D-${Math.floor(Math.random() * 10000)}`, version: 1, createdAt: new Date().toISOString() })
    }
    return this.http.post<{ draftId: string; version: number; createdAt: string }>(`${this.api}/drafts`, payload)
  }

  submitDraftForApproval(draftId: string): Observable<{ ok: boolean }> {
    if (this.useMocks) return this.mock({ ok: true })
    return this.http.post<{ ok: boolean }>(`${this.api}/drafts/${draftId}/submit-approval`, {})
  }
}


