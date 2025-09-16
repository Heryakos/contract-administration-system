import { Component, type OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { MatDialog } from "@angular/material/dialog"
import { MatSnackBar } from "@angular/material/snack-bar"
import { ContractService } from "../../../services/contract.service"
import { type Contract } from "../../../models/contract.model"

@Component({
  selector: "app-contract-detail",
  templateUrl: "./contract-detail.component.html",
  styleUrls: ["./contract-detail.component.scss"],
})
export class ContractDetailComponent implements OnInit {
  contract: Contract | null = null
  loading = true
  error: string | null = null

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.loadContract(id)
    }
  }

  loadContract(id: string): void {
    this.loading = true
    this.contractService.getContract(id).subscribe({
      next: (contract) => {
        this.contract = contract
        this.loading = false
      },
      error: (error) => {
        this.error = "Failed to load contract details"
        this.loading = false
        console.error("Error loading contract:", error)
      },
    })
  }

  editContract(): void {
    if (this.contract) {
      this.router.navigate(["/contracts", this.contract.contractID, "edit"])
    }
  }

  deleteContract(): void {
    if (this.contract && confirm("Are you sure you want to delete this contract?")) {
      this.contractService.deleteContract(this.contract.contractID).subscribe({
        next: () => {
          this.snackBar.open("Contract deleted successfully", "Close", { duration: 3000 })
          this.router.navigate(["/contracts"])
        },
        error: (error) => {
          this.snackBar.open("Failed to delete contract", "Close", { duration: 3000 })
          console.error("Error deleting contract:", error)
        },
      })
    }
  }

  navigateToContracts(): void {
    this.router.navigate(["/contracts"])
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case "active":
        return "primary"
      case "expired":
        return "warn"
      case "terminated":
        return "accent"
      case "draft":
        return "basic"
      default:
        return "basic"
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }
}
