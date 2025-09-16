import { Injectable } from "@angular/core"
import { type Observable } from "rxjs"
import { ApiService } from "../../../services/api.service"

export interface Risk {
  id: number
  contractId: number
  contractTitle?: string
  riskTitle: string
  riskDescription?: string
  riskCategory: string
  likelihood: number
  impact: number
  riskScore: number
  status: string
  mitigationPlan?: string
  assignedToId?: number
  assignedToName?: string
  createdDate: Date
  lastUpdated: Date
}

export interface CreateRisk {
  contractId: number
  riskTitle: string
  riskDescription?: string
  riskCategory: string
  likelihood: number
  impact: number
  mitigationPlan?: string
  assignedToId?: number
}

export interface UpdateRisk {
  riskTitle: string
  riskDescription?: string
  riskCategory: string
  likelihood: number
  impact: number
  status: string
  mitigationPlan?: string
  assignedToId?: number
}

export interface RiskDashboard {
  totalRisks: number
  criticalRisks: number
  highRisks: number
  openRisks: number
  risksByCategory: { [key: string]: number }
}

@Injectable({
  providedIn: "root",
})
export class RiskService {
  constructor(private api: ApiService) {}

  getRisks(contractId?: number, category?: string, status?: string): Observable<Risk[]> {
    return this.api.getRisks({ contractId, category, status })
  }

  getRisk(id: number): Observable<Risk> {
    return this.api.getRisk(id)
  }

  createRisk(risk: CreateRisk): Observable<Risk> {
    return this.api.createRisk(risk)
  }

  updateRisk(id: number, risk: UpdateRisk): Observable<void> {
    return this.api.updateRisk(id, risk)
  }

  getRiskDashboard(): Observable<RiskDashboard> {
    return this.api.getRiskDashboard()
  }

  getRiskCategories(): string[] {
    return ["Financial", "Legal", "Operational", "Strategic", "Regulatory", "Technical", "Reputational"]
  }

  getRiskStatuses(): string[] {
    return ["Open", "In Progress", "Mitigated", "Closed"]
  }

  getRiskLevel(score: number): string {
    if (score >= 15) return "Critical"
    if (score >= 10) return "High"
    if (score >= 5) return "Medium"
    return "Low"
  }

  getRiskLevelColor(score: number): string {
    if (score >= 15) return "warn"
    if (score >= 10) return "accent"
    if (score >= 5) return "primary"
    return ""
  }
}
