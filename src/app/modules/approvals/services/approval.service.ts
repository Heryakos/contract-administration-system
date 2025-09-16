import { Injectable } from "@angular/core"
import { type Observable } from "rxjs"
import { ApiService } from "../../../services/api.service"

export interface PendingApproval {
  approvalID: string
  contractID: string
  contractTitle: string
  contractNumber: string
  contractValue: number
  stepName: string
  stepOrder: number
  createdDate: Date
  daysWaiting: number
}

export interface ApprovalActionRequest {
  approverId: string
  comments?: string
}

export interface ContractApprovalStatus {
  contractID: string
  contractTitle: string
  overallStatus: string
  currentStepName?: string
  currentStepOrder?: number
  approvals: ContractApproval[]
}

export interface ContractApproval {
  approvalID: string
  stepName: string
  stepOrder: number
  approverName?: string
  status: string
  comments?: string
  approvalDate?: Date
  createdDate: Date
}

@Injectable({
  providedIn: "root",
})
export class ApprovalService {
  constructor(private api: ApiService) {}

  getPendingApprovals(userId: string): Observable<PendingApproval[]> {
    return this.api.getPendingApprovals(userId)
  }

  getContractApprovalStatus(contractId: string): Observable<ContractApprovalStatus> {
    return this.api.getContractApprovalStatus(contractId)
  }

  submitContractForApproval(contractId: string, comments?: string): Observable<any> {
    return this.api.submitContractForApproval(contractId, comments)
  }

  approveStep(approvalId: string, request: ApprovalActionRequest): Observable<any> {
    return this.api.approveStep(approvalId, request)
  }

  rejectStep(approvalId: string, request: ApprovalActionRequest): Observable<any> {
    return this.api.rejectStep(approvalId, request)
  }
}
