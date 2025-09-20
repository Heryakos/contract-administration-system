import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, type Routes } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { MatTableModule } from "@angular/material/table"
import { Component, type OnInit, ViewChild, ElementRef } from "@angular/core"
import { ConService } from "../../services/con.service"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { NgApexchartsModule, ChartComponent, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexPlotOptions, ApexTitleSubtitle, ApexFill, ApexTooltip, ApexLegend, ApexResponsive } from "ng-apexcharts"
import { ExportService } from "../../services/export.service"

export type ChartOptions = {
  series: ApexAxisChartSeries
  chart: ApexChart
  xaxis: ApexXAxis
  dataLabels: ApexDataLabels
  plotOptions: ApexPlotOptions
  fill: ApexFill
  tooltip: ApexTooltip
  legend: ApexLegend
  title: ApexTitleSubtitle
  responsive: ApexResponsive[]
}

@Component({
  selector: "app-reports-dashboard",
  templateUrl: "./reports-dashboard.component.html",
  styleUrls: ["./reports-dashboard.component.scss"],
})
export class ReportsDashboardComponent implements OnInit {
  loading = true
  contracts: any | null = null
  financial: any | null = null
  obligations: any | null = null
  risks: any | null = null

  @ViewChild("contractsChart") contractsChart?: ChartComponent
  @ViewChild("exportContainer", { static: false }) exportContainer?: ElementRef<HTMLDivElement>

  chartOptions: ChartOptions = {
    series: [],
    chart: { type: "bar", height: 320 },
    xaxis: { categories: [] },
    dataLabels: { enabled: true },
    plotOptions: { bar: { columnWidth: "45%" } },
    fill: {},
    tooltip: {},
    legend: { show: false },
    title: { text: "" },
    responsive: [],
  }

  constructor(private con: ConService, private exporter: ExportService) {}

  ngOnInit(): void {
    this.con.getReportsDashboard().subscribe({
      next: (res) => {
        // Normalize contracts
        const c = res?.contracts?.[0] || null
        this.contracts = c
          ? {
              TotalContracts: c.totalContracts,
              ActiveContracts: c.activeContracts,
              ExpiringSoon: c.expiringSoon,
              ExpiredContracts: c.expiredContracts,
              TotalContractValue: c.totalContractValue,
            }
          : null
        // Normalize financial and include TotalContractValue for display
        const f = res?.financial?.[0] || null
        this.financial = f
          ? {
              TotalContractValue: this.contracts?.TotalContractValue || 0,
              TotalScheduledPayments: f.totalScheduledPayments,
              TotalPaidAmount: f.totalPaidAmount,
              TotalPendingPayments: f.totalPendingPayments,
              TotalOverduePayments: f.totalOverduePayments,
              TotalPenalties: f.totalPenalties,
            }
          : null
        // Obligations
        const o = res?.obligations?.[0] || null
        this.obligations = o
          ? {
              TotalObligations: o.totalObligations,
              CompletedObligations: o.completedObligations,
              OpenObligations: o.openObligations,
              OverdueObligations: o.overdueObligations,
            }
          : null
        // risks item
        const r = res?.risks?.[0] || null
        this.risks = r
          ? { Critical: r.critical, High: r.high, Medium: r.medium, Low: r.low, TotalRisks: r.totalRisks }
          : null

        const active = this.contracts?.ActiveContracts || 0
        const expired = this.contracts?.ExpiredContracts || 0
        const expiring = this.contracts?.ExpiringSoon || 0

        this.chartOptions = {
          series: [
            {
              name: "Contracts",
              data: [active, expired, expiring],
            },
          ],
          chart: {
            type: "bar",
            height: 320,
            toolbar: { show: false },
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "45%",
              borderRadius: 6,
              dataLabels: { position: "top" },
            },
          },
          dataLabels: {
            enabled: true,
            offsetY: -18,
            formatter: (val) => `${val}`,
            style: {
              fontSize: "12px",
              colors: ["#374151"],
            },
          },
          xaxis: {
            categories: ["Active", "Expired", "Expiring Soon"],
          },
          fill: { type: "gradient" },
          tooltip: { theme: "light" },
          legend: { show: false },
          responsive: [
            {
              breakpoint: 768,
              options: { chart: { height: 280 }, plotOptions: { bar: { columnWidth: "55%" } } },
            },
          ],
          title: { text: "Contracts Status", style: { fontWeight: 600 } },
        }

        this.loading = false
      },
      error: () => {
        this.loading = false
      },
    })
  }

  async exportChartAsPNG(): Promise<void> {
    const el = this.exportContainer?.nativeElement
    if (el) await this.exporter.exportElementAsPNG(el, "contracts-status.png")
  }

  async exportChartAsPDF(): Promise<void> {
    const el = this.exportContainer?.nativeElement
    if (el) await this.exporter.exportElementAsPDF(el, "contracts-status.pdf")
  }

  exportChartDataCSV(): void {
    const rows = [
      { status: "Active", count: this.contracts?.ActiveContracts || 0 },
      { status: "Expired", count: this.contracts?.ExpiredContracts || 0 },
      { status: "Expiring Soon", count: this.contracts?.ExpiringSoon || 0 },
    ]
    this.exporter.exportToCSV(rows, "contracts-status.csv")
  }
}

const routes: Routes = [
  { path: "", component: ReportsDashboardComponent },
]

@NgModule({
  declarations: [ReportsDashboardComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    NgApexchartsModule,
    RouterModule.forChild(routes),
  ],
})
export class ReportsModule {}


