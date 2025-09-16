import { Component, type OnInit, ViewChild } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { FinancialService, type PaymentSchedule } from "../../services/financial.service"

@Component({
  selector: "app-payment-schedules",
  templateUrl: "./payment-schedules.component.html",
  styleUrls: ["./payment-schedules.component.scss"],
})
export class PaymentSchedulesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  displayedColumns: string[] = [
    "contractNumber",
    "contractTitle",
    "paymentNumber",
    "scheduledAmount",
    "scheduledDate",
    "status",
    "paidAmount",
    "actions",
  ]
  dataSource = new MatTableDataSource<PaymentSchedule>()
  loading = true
  error: string | null = null

  constructor(private financialService: FinancialService) {}

  ngOnInit(): void {
    this.loadUpcomingPayments()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  loadUpcomingPayments(): void {
    this.loading = true
    this.financialService.getUpcomingPayments(90).subscribe({
      next: (payments) => {
        this.dataSource.data = payments
        this.loading = false
      },
      error: (error) => {
        this.error = "Failed to load payment schedules"
        this.loading = false
        console.error("Error loading payments:", error)
      },
    })
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage()
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case "paid":
        return "primary"
      case "overdue":
        return "warn"
      case "due":
        return "accent"
      default:
        return "basic"
    }
  }

  getUrgencyColor(daysUntilDue: number): string {
    if (daysUntilDue < 0) return "warn"
    if (daysUntilDue <= 7) return "accent"
    return "primary"
  }
}
