import { Component, type OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { MatDialog } from "@angular/material/dialog"
import { MatSnackBar } from "@angular/material/snack-bar"
import { ContractService } from "../../../services/contract.service"
import { ConService } from "../../../services/con.service"
import { type Contract, type ContractDocument } from "../../../models/contract.model"

@Component({
  selector: "app-contract-detail",
  templateUrl: "./contract-detail.component.html",
  styleUrls: ["./contract-detail.component.scss"],
})
export class ContractDetailComponent implements OnInit {
  contract: Contract | null = null
  loading = true
  error: string | null = null

  documents: ContractDocument[] = []
  documentsLoading = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService,
    private con: ConService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.loadContract(id)
      this.loadDocuments(Number(id))
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

  loadDocuments(contractId: number): void {
    this.documentsLoading = true
    this.contractService.getContractDocuments(contractId).subscribe({
      next: (docs) => {
        this.documents = docs || []
        this.documentsLoading = false
      },
      error: (e) => {
        console.error("Failed to load documents", e)
        this.documents = []
        this.documentsLoading = false
      },
    })
  }

  onUploadSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (!input.files || !this.contract) return
    const file = input.files[0]
    const userId = this.con.getCurrentUserGuid() || undefined
    this.contractService.uploadContractDocument(Number(this.contract.contractID), file, userId).subscribe({
      next: () => {
        this.snackBar.open("Document uploaded", "Close", { duration: 2500 })
        this.loadDocuments(Number(this.contract!.contractID))
      },
      error: (e) => {
        console.error("Upload failed", e)
        this.snackBar.open("Failed to upload document", "Close", { duration: 3000 })
      },
    })
  }

  deleteDocument(doc: ContractDocument): void {
    if (!this.contract) return
    if (!confirm(`Delete document ${doc.fileName}?`)) return
    this.contractService.deleteContractDocument(Number(this.contract.contractID), doc.documentId).subscribe({
      next: () => {
        this.snackBar.open("Document deleted", "Close", { duration: 2500 })
        this.loadDocuments(Number(this.contract!.contractID))
      },
      error: (e) => {
        console.error("Delete failed", e)
        this.snackBar.open("Failed to delete document", "Close", { duration: 3000 })
      },
    })
  }

  downloadDocument(doc: ContractDocument): void {
    // If backend provides URL, open it; otherwise fallback to direct GET
    if (doc.url) {
      window.open(doc.url, "_blank")
      return
    }
    if (!this.contract) return
    // Default pattern: GET returns file stream
    const url = `${location.origin}/api/CON_contracts/${this.contract.contractID}/documents/${doc.documentId}/download`
    window.open(url, "_blank")
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
