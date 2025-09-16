import { Component, type OnInit } from "@angular/core"
import { FinancialService, type FinancialSummary, type PaymentSchedule, type Invoice } from "../../services/financial.service"

@Component({
  selector: "app-financial-dashboard",
  templateUrl: "./financial-dashboard.component.html",
  styleUrls: ["./financial-dashboard.component.scss"],
})
export class FinancialDashboardComponent implements OnInit {
  summary: FinancialSummary | null = null
  upcomingPayments: PaymentSchedule[] = []
  pendingInvoices: Invoice[] = []
  loading = true
  error: string | null = null

  constructor(private financialService: FinancialService) {}

  ngOnInit(): void {
    this.loadDashboardData()
  }

  loadDashboardData(): void {
    this.loading = true

    // Load financial summary
    this.financialService.getFinancialSummary().subscribe({
      next: (summary) => {
        this.summary = summary
        this.checkLoadingComplete()
      },
      error: (error) => {
        this.error = "Failed to load financial summary"
        this.loading = false
        console.error("Error loading summary:", error)
      },
    })

    // Load upcoming payments
    this.financialService.getUpcomingPayments(30).subscribe({
      next: (payments) => {
        this.upcomingPayments = payments.slice(0, 5) // Show top 5
        this.checkLoadingComplete()
      },
      error: (error) => {
        console.error("Error loading upcoming payments:", error)
      },
    })

    // Load pending invoices
    this.financialService.getInvoices("Submitted").subscribe({
      next: (invoices) => {
        this.pendingInvoices = invoices.slice(0, 5) // Show top 5
        this.checkLoadingComplete()
      },
      error: (error) => {
        console.error("Error loading pending invoices:", error)
      },
    })
  }

  private checkLoadingComplete(): void {
    if (this.summary && this.upcomingPayments && this.pendingInvoices) {
      this.loading = false
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  getPaymentUrgency(daysUntilDue: number): string {
    if (daysUntilDue < 0) return "overdue"
    if (daysUntilDue <= 7) return "urgent"
    if (daysUntilDue <= 30) return "upcoming"
    return "scheduled"
  }

  getPaymentUrgencyColor(urgency: string): string {
    switch (urgency) {
      case "overdue":
        return "warn"
      case "urgent":
        return "accent"
      case "upcoming":
        return "primary"
      default:
        return "basic"
    }
  }
}
