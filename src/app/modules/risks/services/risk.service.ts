import { Injectable } from "@angular/core"
import { Observable, forkJoin } from "rxjs"
import { map } from "rxjs/operators"
import { ConService } from "../../../services/con.service"

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
  constructor(private con: ConService) {}

  getRisks(contractId?: number, category?: string, status?: string): Observable<Risk[]> {
    return this.con.getRisks({ contractId, category, status }).pipe(
      map((apiRisks: any[]) => {
        console.log('API Risks response:', apiRisks);
        return apiRisks.map(risk => this.mapApiRiskToRisk(risk));
      })
    );
  }

  getRisk(id: number): Observable<Risk> {
    return this.con.getRisk(id).pipe(
      map(apiRisk => this.mapApiRiskToRisk(apiRisk))
    );
  }

  createRisk(risk: CreateRisk): Observable<Risk> {
    const payload = {
      ContractID: risk.contractId,
      RiskTitle: risk.riskTitle,
      RiskDescription: risk.riskDescription,
      RiskCategory: risk.riskCategory,
      Likelihood: risk.likelihood,
      Impact: risk.impact,
      MitigationPlan: risk.mitigationPlan,
      AssignedToUserID: risk.assignedToId
    };
    
    return this.con.createRisk(payload).pipe(
      map(apiRisk => this.mapApiRiskToRisk(apiRisk))
    );
  }

  updateRisk(id: number, risk: UpdateRisk): Observable<void> {
    const payload = {
      RiskTitle: risk.riskTitle,
      RiskDescription: risk.riskDescription,
      RiskCategory: risk.riskCategory,
      Likelihood: risk.likelihood,
      Impact: risk.impact,
      Status: risk.status,
      MitigationPlan: risk.mitigationPlan,
      AssignedToUserID: risk.assignedToId
    };
    
    return this.con.updateRisk(id, payload);
  }

  getRiskDashboard(): Observable<RiskDashboard> {
    return this.getRisks().pipe(
      map((risks: Risk[]) => {
        const totalRisks = risks.length;
        const criticalRisks = risks.filter(risk => risk.riskScore >= 15).length;
        const highRisks = risks.filter(risk => risk.riskScore >= 10 && risk.riskScore < 15).length;
        const openRisks = risks.filter(risk => risk.status === 'Open').length;
        
        const risksByCategory: { [key: string]: number } = {};
        risks.forEach(risk => {
          risksByCategory[risk.riskCategory] = (risksByCategory[risk.riskCategory] || 0) + 1;
        });

        return {
          totalRisks,
          criticalRisks,
          highRisks,
          openRisks,
          risksByCategory
        };
      })
    );
  }

  private mapApiRiskToRisk(apiRisk: any): Risk {
    const likelihood = apiRisk.likelihood || 1;
    const impact = apiRisk.impact || 1;
    
    return {
      id: apiRisk.riskID,
      contractId: apiRisk.contractID,
      contractTitle: apiRisk.contractTitle,
      riskTitle: apiRisk.riskTitle,
      riskDescription: apiRisk.riskDescription,
      riskCategory: apiRisk.riskCategory,
      likelihood: likelihood,
      impact: impact,
      riskScore: likelihood * impact,
      status: apiRisk.status || 'Open',
      mitigationPlan: apiRisk.mitigationPlan,
      assignedToId: apiRisk.assignedToUserID,
      assignedToName: apiRisk.assignedToName,
      createdDate: new Date(apiRisk.createdDate || apiRisk.lastUpdated || new Date()),
      lastUpdated: new Date(apiRisk.lastUpdated || new Date())
    };
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