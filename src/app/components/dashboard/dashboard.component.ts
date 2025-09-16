import { Component, type OnInit } from "@angular/core"
import { Observable, forkJoin } from "rxjs"
import { ContractService } from "../../services/contract.service"
import { type ContractSummary, type Contract } from "../../models/contract.model"

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

  constructor(private contractService: ContractService) {
    this.summary$ = this.contractService.getContractSummary()
  }

  ngOnInit(): void {
    this.loadDashboardData()
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
}
