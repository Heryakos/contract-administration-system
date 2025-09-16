import { Injectable } from "@angular/core"
import type { Observable } from "rxjs"
import { ApiService } from "../../../services/api.service"

export interface ComplianceRequirement {
  id: number
  contractId: number
  contractTitle?: string
  requirementTitle: string
  requirementDescription?: string
  requirementType: string
  dueDate: Date
  status: string
  evidenceRequired?: string
  evidenceProvided?: string
  assignedToId?: number
  assignedToName?: string
  createdDate: Date
  completedDate?: Date
}

export interface CreateComplianceRequirement {
  contractId: number
  requirementTitle: string
  requirementDescription?: string
  requirementType: string
  dueDate: Date
  evidenceRequired?: string
  assignedToId?: number
}

export interface UpdateComplianceRequirement {
  requirementTitle: string
  requirementDescription?: string
  requirementType: string
  dueDate: Date
  status: string
  evidenceRequired?: string
  evidenceProvided?: string
  assignedToId?: number
}

export interface ComplianceDashboard {
  totalRequirements: number
  completedRequirements: number
  overdueRequirements: number
  dueSoon: number
  complianceRate: number
  requirementsByType: { [key: string]: number }
}

@Injectable({
  providedIn: "root",
})
export class ComplianceService {
  constructor(private api: ApiService) {}

  getComplianceRequirements(contractId?: number, type?: string, status?: string): Observable<ComplianceRequirement[]> {
    return this.api.getComplianceRequirements({ contractId, type, status })
  }

  getComplianceRequirement(id: number): Observable<ComplianceRequirement> {
    return this.api.getComplianceRequirement(id)
  }

  createComplianceRequirement(requirement: CreateComplianceRequirement): Observable<ComplianceRequirement> {
    return this.api.createComplianceRequirement(requirement)
  }

  updateComplianceRequirement(id: number, requirement: UpdateComplianceRequirement): Observable<void> {
    return this.api.updateComplianceRequirement(id, requirement)
  }

  getComplianceDashboard(): Observable<ComplianceDashboard> {
    return this.api.getComplianceDashboard()
  }

  getRequirementTypes(): string[] {
    return [
      "Legal",
      "Regulatory",
      "Financial",
      "Environmental",
      "Safety",
      "Quality",
      "Data Protection",
      "Tax",
      "Insurance",
    ]
  }

  getRequirementStatuses(): string[] {
    return ["Pending", "In Progress", "Completed", "Overdue"]
  }

  getStatusColor(status: string): string {
    switch (status) {
      case "Completed":
        return "primary"
      case "In Progress":
        return "accent"
      case "Overdue":
        return "warn"
      default:
        return ""
    }
  }

  isOverdue(dueDate: Date, status: string): boolean {
    return new Date(dueDate) < new Date() && status !== "Completed"
  }
}
