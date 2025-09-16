import { Component, type OnInit } from "@angular/core"
import { RiskService, type RiskDashboard } from "../../services/risk.service"
import { ComplianceService, type ComplianceDashboard } from "../../services/compliance.service"

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

    Promise.all([
      this.riskService.getRiskDashboard().toPromise(),
      this.complianceService.getComplianceDashboard().toPromise(),
    ])
      .then(([riskData, complianceData]) => {
        this.riskDashboard = riskData!
        this.complianceDashboard = complianceData!
        this.loading = false
      })
      .catch((error) => {
        console.error("Error loading dashboard data:", error)
        this.error = "Failed to load dashboard data"
        this.loading = false
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
