import { Component, type OnInit } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { FinancialService, type Invoice } from "../../services/financial.service"

@Component({
  selector: "app-invoice-detail",
  templateUrl: "./invoice-detail.component.html",
  styleUrls: ["./invoice-detail.component.scss"],
})
export class InvoiceDetailComponent implements OnInit {
  invoice: Invoice | null = null
  loading = true
  error: string | null = null

  constructor(
    private route: ActivatedRoute,
    private financialService: FinancialService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.loadInvoice(id)
    }
  }

  loadInvoice(id: string): void {
    this.loading = true
    this.financialService.getInvoice(id).subscribe({
      next: (invoice) => {
        this.invoice = invoice
        this.loading = false
      },
      error: (error) => {
        this.error = "Failed to load invoice details"
        this.loading = false
        console.error("Error loading invoice:", error)
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
}
