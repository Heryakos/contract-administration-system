import { Component, type OnInit, ViewChild, ElementRef } from "@angular/core"
import { Observable, forkJoin } from "rxjs"
import { ContractService } from "../../services/contract.service"
import { type ContractSummary, type Contract } from "../../models/contract.model"
import { ExportService } from "../../services/export.service"
import { ChartComponent, ApexChart, ApexResponsive, ApexLegend, ApexNonAxisChartSeries, ApexDataLabels, ApexFill, ApexPlotOptions } from "ng-apexcharts"

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries
  chart: ApexChart
  labels: string[]
  dataLabels: ApexDataLabels
  fill: ApexFill
  legend: ApexLegend
  responsive: ApexResponsive[]
  plotOptions: ApexPlotOptions
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  summary$: Observable<ContractSummary>
  recentContracts: Contract[] = []
  expiringContracts: Contract[] = []
  loading = true

  @ViewChild("portfolioChart") portfolioChart?: ChartComponent
  @ViewChild("portfolioExport", { static: false }) portfolioExport?: ElementRef<HTMLDivElement>

  donutOptions: DonutChartOptions = {
    series: [],
    chart: { type: "donut", height: 300 },
    labels: [],
    dataLabels: { enabled: true },
    fill: {},
    legend: { show: true },
    plotOptions: { pie: { donut: { size: "55%" } } },
    responsive: [],
  }

  constructor(private contractService: ContractService, private exporter: ExportService) {
    this.summary$ = this.contractService.getContractSummary()
  }

  ngOnInit(): void {
    this.loadDashboardData()
    this.summary$.subscribe((summary) => {
      if (!summary) return
      const active = summary.activeContracts || 0
      const expiring = summary.expiringContracts || 0
      const total = summary.totalContracts || 0
      const draft = Math.max(total - (active + expiring), 0)

      this.donutOptions = {
        series: [active, expiring, draft],
        chart: { type: "donut", height: 300, toolbar: { show: false } },
        labels: ["Active", "Expiring Soon", "Draft/Other"],
        dataLabels: { enabled: true },
        fill: { type: "gradient" },
        legend: { position: "bottom", show: true },
        plotOptions: { pie: { donut: { size: "55%" } } },
        responsive: [{ breakpoint: 768, options: { chart: { height: 280 } } }],
      }
    })
  }

  private loadDashboardData(): void {
    forkJoin({
      summary: this.contractService.getContractSummary(),
      recent: this.contractService.getContracts({ page: 1, pageSize: 5 }),
      expiring: this.contractService.getContracts({ page: 1, pageSize: 5, status: "Active" }),
    }).subscribe({
      next: (data) => {
        this.recentContracts = data.recent.slice(0, 5)
        this.expiringContracts = data.expiring.filter((c) => c.daysToExpiry <= 30).slice(0, 5)
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading dashboard data:", error)
        this.loading = false
      },
    })
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case "active":
        return "status-badge active"
      case "pending":
        return "status-badge pending"
      case "expired":
        return "status-badge expired"
      case "draft":
        return "status-badge draft"
      default:
        return "status-badge"
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  async exportPortfolioPNG(): Promise<void> {
    const el = this.portfolioExport?.nativeElement
    if (el) await this.exporter.exportElementAsPNG(el, "portfolio-overview.png")
  }

  async exportPortfolioPDF(): Promise<void> {
    const el = this.portfolioExport?.nativeElement
    if (el) await this.exporter.exportElementAsPDF(el, "portfolio-overview.pdf")
  }

  exportPortfolioCSV(summary: ContractSummary | null | undefined): void {
    if (!summary) return
    const rows = [
      { metric: "Total Contracts", value: summary.totalContracts || 0 },
      { metric: "Active", value: summary.activeContracts || 0 },
      { metric: "Expiring Soon", value: summary.expiringContracts || 0 },
      { metric: "Total Value", value: summary.totalValue || 0 },
      { metric: "Pending Approvals", value: summary.pendingApprovals || 0 },
      { metric: "Overdue Obligations", value: summary.overdueObligations || 0 },
    ]
    this.exporter.exportToCSV(rows, "portfolio-overview.csv")
  }
}
