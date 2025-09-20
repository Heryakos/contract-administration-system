import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { ConService } from "../../../services/con.service"

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
  assignedToId?: string
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
  constructor(private con: ConService) {}

  getComplianceRequirements(contractId?: number, type?: string, status?: string): Observable<ComplianceRequirement[]> {
    return this.con.getComplianceRequirements({ contractId, type, status }).pipe(
      map((apiRequirements: any[]) => {
        console.log('API Compliance response:', apiRequirements);
        return apiRequirements.map(req => this.mapApiRequirementToRequirement(req));
      })
    );
  }

  getComplianceRequirement(id: number): Observable<ComplianceRequirement> {
    return this.con.getComplianceRequirement(id).pipe(
      map(apiReq => this.mapApiRequirementToRequirement(apiReq))
    );
  }

  createComplianceRequirement(requirement: CreateComplianceRequirement): Observable<ComplianceRequirement> {
    const payload: any = { 
      ContractID: requirement.contractId, 
      RequirementTitle: requirement.requirementTitle, 
      RequirementDescription: requirement.requirementDescription, 
      RequirementType: requirement.requirementType, 
      DueDate: requirement.dueDate, 
      EvidenceRequired: requirement.evidenceRequired, 
      AssignedToUserID: requirement.assignedToId 
    }
    return this.con.createComplianceRequirement(payload).pipe(
      map(apiReq => this.mapApiRequirementToRequirement(apiReq))
    );
  }

  updateComplianceRequirement(id: number, requirement: UpdateComplianceRequirement): Observable<void> {
    const payload: any = { 
      RequirementTitle: requirement.requirementTitle, 
      RequirementDescription: requirement.requirementDescription, 
      RequirementType: requirement.requirementType, 
      DueDate: requirement.dueDate, 
      Status: requirement.status, 
      EvidenceRequired: requirement.evidenceRequired, 
      EvidenceProvided: requirement.evidenceProvided, 
      AssignedToUserID: requirement.assignedToId 
    }
    return this.con.updateComplianceRequirement(id, payload);
  }

  getComplianceDashboard(): Observable<ComplianceDashboard> {
    return this.getComplianceRequirements().pipe(
      map((requirements: ComplianceRequirement[]) => {
        const totalRequirements = requirements.length;
        const completedRequirements = requirements.filter(req => req.status === 'Completed').length;
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const overdueRequirements = requirements.filter(req => 
          new Date(req.dueDate) < now && req.status !== 'Completed'
        ).length;
        
        const dueSoon = requirements.filter(req => {
          const dueDate = new Date(req.dueDate);
          return dueDate > now && dueDate <= sevenDaysFromNow && req.status !== 'Completed';
        }).length;
        
        const complianceRate = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;

        const requirementsByType: { [key: string]: number } = {};
        requirements.forEach(req => {
          requirementsByType[req.requirementType] = (requirementsByType[req.requirementType] || 0) + 1;
        });

        return {
          totalRequirements,
          completedRequirements,
          overdueRequirements,
          dueSoon,
          complianceRate,
          requirementsByType
        };
      })
    );
  }

  private mapApiRequirementToRequirement(apiReq: any): ComplianceRequirement {
    return {
      id: apiReq.requirementID,
      contractId: apiReq.contractID,
      contractTitle: apiReq.contractTitle,
      requirementTitle: apiReq.requirementTitle,
      requirementDescription: apiReq.requirementDescription,
      requirementType: apiReq.requirementType,
      dueDate: new Date(apiReq.dueDate),
      status: apiReq.status || 'Pending',
      evidenceRequired: apiReq.evidenceRequired,
      evidenceProvided: apiReq.evidenceProvided,
      assignedToId: apiReq.assignedToUserID,
      assignedToName: apiReq.assignedToName,
      createdDate: new Date(apiReq.createdDate || new Date()),
      completedDate: apiReq.completedDate ? new Date(apiReq.completedDate) : undefined
    };
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