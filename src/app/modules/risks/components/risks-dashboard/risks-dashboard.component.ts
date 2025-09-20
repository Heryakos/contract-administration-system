import { Component, OnInit } from "@angular/core"
import { RiskService, type RiskDashboard } from "../../services/risk.service"
import { ComplianceService, type ComplianceDashboard } from "../../services/compliance.service"
import { forkJoin } from "rxjs"

@Component({
  selector: "app-risks-dashboard",
  templateUrl: "./risks-dashboard.component.html",
  styleUrls: ["./risks-dashboard.component.scss"],
})
export class RisksDashboardComponent implements OnInit {
  riskDashboard: RiskDashboard | null = null
  complianceDashboard: ComplianceDashboard | null = null
  loading = true
  error: string | null = null

  constructor(
    private riskService: RiskService,
    private complianceService: ComplianceService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData()
  }

  private loadDashboardData(): void {
    this.loading = true
    this.error = null

    console.log('Loading dashboard data...');

    forkJoin([
      this.riskService.getRiskDashboard(),
      this.complianceService.getComplianceDashboard()
    ]).subscribe({
      next: ([riskData, complianceData]) => {
        console.log('Risk dashboard data:', riskData);
        console.log('Compliance dashboard data:', complianceData);
        
        this.riskDashboard = riskData
        this.complianceDashboard = complianceData
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading dashboard data:", error)
        this.error = "Failed to load dashboard data. Please check console for details."
        this.loading = false
      }
    })
  }

  getRiskCategoryEntries(): Array<[string, number]> {
    return this.riskDashboard ? Object.entries(this.riskDashboard.risksByCategory) : []
  }

  getComplianceTypeEntries(): Array<[string, number]> {
    return this.complianceDashboard ? Object.entries(this.complianceDashboard.requirementsByType) : []
  }

  refresh(): void {
    this.loadDashboardData()
  }
}