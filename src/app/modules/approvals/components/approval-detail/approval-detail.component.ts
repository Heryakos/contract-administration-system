import { Component, type OnInit } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { ApprovalService, type ContractApprovalStatus } from "../../services/approval.service"

@Component({
  selector: "app-approval-detail",
  templateUrl: "./approval-detail.component.html",
  styleUrls: ["./approval-detail.component.scss"],
})
export class ApprovalDetailComponent implements OnInit {
  approvalStatus: ContractApprovalStatus | null = null
  loading = true
  error: string | null = null

  constructor(
    private route: ActivatedRoute,
    private approvalService: ApprovalService,
  ) {}

  ngOnInit(): void {
    const contractId = this.route.snapshot.paramMap.get("id")
    if (contractId) {
      this.loadApprovalStatus(contractId)
    }
  }

  loadApprovalStatus(contractId: string): void {
    this.loading = true
    this.approvalService.getContractApprovalStatus(contractId).subscribe({
      next: (status) => {
        this.approvalStatus = status
        this.loading = false
      },
      error: (error) => {
        this.error = "Failed to load approval status"
        this.loading = false
        console.error("Error loading approval status:", error)
      },
    })
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case "approved":
        return "primary"
      case "rejected":
        return "warn"
      case "pending":
        return "accent"
      default:
        return "basic"
    }
  }

  getOverallStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case "approved":
        return "primary"
      case "rejected":
        return "warn"
      case "under review":
        return "accent"
      default:
        return "basic"
    }
  }
}
