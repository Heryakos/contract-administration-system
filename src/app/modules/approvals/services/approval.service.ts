import { Injectable } from "@angular/core"
import { type Observable } from "rxjs"
import { ConService } from "../../../services/con.service"

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
  constructor(private con: ConService) {}

  getPendingApprovals(userId: string): Observable<PendingApproval[]> {
    return this.con.getPendingApprovals(userId)
  }

  getContractApprovalStatus(contractId: string): Observable<ContractApprovalStatus> {
    return this.con.getContractApprovalStatus(Number(contractId))
  }

  submitContractForApproval(contractId: string, comments?: string): Observable<any> {
    return this.con.submitContractForApproval(Number(contractId), comments)
  }

  approveStep(approvalId: string, request: ApprovalActionRequest): Observable<any> {
    // Create the exact structure the API expects
    const apiRequest = {
      ApproverUserID: request.approverId,
      Comments: request.comments
    };
    
    return this.con.approveStep(Number(approvalId), apiRequest)
  }

  rejectStep(approvalId: string, request: ApprovalActionRequest): Observable<any> {
    // Create the exact structure the API expects
    const apiRequest = {
      ApproverUserID: request.approverId,
      Comments: request.comments
    };
    
    return this.con.rejectStep(Number(approvalId), apiRequest)
  }
}