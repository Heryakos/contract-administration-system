import { Component, type OnInit, ViewChild } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { Router } from "@angular/router"
import { FinancialService, type Invoice } from "../../services/financial.service"
import { AuthService } from "../../../../services/auth.service"

@Component({
  selector: "app-invoices-list",
  templateUrl: "./invoices-list.component.html",
  styleUrls: ["./invoices-list.component.scss"],
})
export class InvoicesListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  displayedColumns: string[] = [
    "invoiceNumber",
    "contractTitle",
    "amount",
    "invoiceDate",
    "status",
    "submittedBy",
    "actions",
  ]
  dataSource = new MatTableDataSource<Invoice>()
  loading = true
  error: string | null = null
  selectedStatus = "all"

  statusOptions = [
    { value: "all", label: "All Invoices" },
    { value: "Submitted", label: "Submitted" },
    { value: "Approved", label: "Approved" },
    { value: "Paid", label: "Paid" },
    { value: "Rejected", label: "Rejected" },
  ]

  constructor(
    private financialService: FinancialService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadInvoices()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  loadInvoices(): void {
    this.loading = true
    const status = this.selectedStatus === "all" ? undefined : this.selectedStatus

    this.financialService.getInvoices(status).subscribe({
      next: (invoices) => {
        this.dataSource.data = invoices
        this.loading = false
      },
      error: (error) => {
        this.error = "Failed to load invoices"
        this.loading = false
        console.error("Error loading invoices:", error)
      },
    })
  }

  onStatusChange(): void {
    this.loadInvoices()
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage()
    }
  }

  viewInvoice(invoiceId: string): void {
    this.router.navigate(["/financial/invoices", invoiceId])
  }

  approveInvoice(invoice: Invoice): void {
    const currentUser = this.authService.getCurrentUserSnapshot()
    if (!currentUser) return

    this.financialService.approveInvoice(invoice.invoiceID, currentUser.userID).subscribe({
      next: () => {
        this.loadInvoices()
      },
      error: (error) => {
        console.error("Error approving invoice:", error)
      },
    })
  }

  rejectInvoice(invoice: Invoice): void {
    const currentUser = this.authService.getCurrentUserSnapshot()
    if (!currentUser) return

    this.financialService.rejectInvoice(invoice.invoiceID, currentUser.userID).subscribe({
      next: () => {
        this.loadInvoices()
      },
      error: (error) => {
        console.error("Error rejecting invoice:", error)
      },
    })
  }

  markPaid(invoice: Invoice): void {
    this.financialService.markInvoicePaid(invoice.invoiceID).subscribe({
      next: () => {
        this.loadInvoices()
      },
      error: (error) => {
        console.error("Error marking invoice as paid:", error)
      },
    })
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
      case "approved":
        return "accent"
      case "submitted":
        return "basic"
      case "rejected":
        return "warn"
      default:
        return "basic"
    }
  }

  canApprove(invoice: Invoice): boolean {
    return invoice.status === "Submitted"
  }

  canMarkPaid(invoice: Invoice): boolean {
    return invoice.status === "Approved"
  }
}
