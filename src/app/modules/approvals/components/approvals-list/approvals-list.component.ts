import { Component, type OnInit, ViewChild } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { MatDialog } from "@angular/material/dialog"
import { Router } from "@angular/router"
import { ApprovalService } from "../../services/approval.service"
import { AuthService } from "../../../../services/auth.service"
import { ApprovalActionDialogComponent } from "../approval-action-dialog/approval-action-dialog.component"

export interface PendingApproval {
  approvalID: string
  contractID: string
  contractTitle: string
  contractNumber: string
  contractValue: number
  stepName: string
  stepOrder: number
  createdDate: Date
  daysWaiting: number
}

@Component({
  selector: "app-approvals-list",
  templateUrl: "./approvals-list.component.html",
  styleUrls: ["./approvals-list.component.scss"],
})
export class ApprovalsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  displayedColumns: string[] = [
    "contractNumber",
    "contractTitle",
    "contractValue",
    "stepName",
    "daysWaiting",
    "actions",
  ]
  dataSource = new MatTableDataSource<PendingApproval>()
  loading = true
  error: string | null = null

  constructor(
    private approvalService: ApprovalService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPendingApprovals()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  loadPendingApprovals(): void {
    this.loading = true
    const currentUser = this.authService.getCurrentUserSnapshot()

    if (!currentUser) {
      if (this.authService.isAuthenticated()) {
        // Try to fetch the current user when token exists but snapshot is empty
        this.authService.getCurrentUser().subscribe({
          next: (user) => {
            const userId = user.userID
            this.approvalService.getPendingApprovals(userId).subscribe({
              next: (approvals) => {
                this.dataSource.data = approvals
                this.loading = false
              },
              error: (error) => {
                this.error = "Failed to load pending approvals"
                this.loading = false
                console.error("Error loading approvals:", error)
              },
            })
          },
          error: () => {
            this.error = "User not authenticated"
            this.loading = false
          },
        })
        return
      }
      this.error = "User not authenticated"
      this.loading = false
      return
    }

    this.approvalService.getPendingApprovals(currentUser.userID).subscribe({
      next: (approvals) => {
        this.dataSource.data = approvals
        this.loading = false
      },
      error: (error) => {
        this.error = "Failed to load pending approvals"
        this.loading = false
        console.error("Error loading approvals:", error)
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

  viewContract(contractId: string): void {
    this.router.navigate(["/contracts", contractId])
  }

  viewApprovalDetail(approvalId: string): void {
    this.router.navigate(["/approvals", approvalId])
  }

  approveContract(approval: PendingApproval): void {
    const dialogRef = this.dialog.open(ApprovalActionDialogComponent, {
      width: "500px",
      data: {
        action: "approve",
        approval: approval,
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.processApproval(approval.approvalID, "approve", result.comments)
      }
    })
  }

  rejectContract(approval: PendingApproval): void {
    const dialogRef = this.dialog.open(ApprovalActionDialogComponent, {
      width: "500px",
      data: {
        action: "reject",
        approval: approval,
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.processApproval(approval.approvalID, "reject", result.comments)
      }
    })
  }

  private processApproval(approvalId: string, action: "approve" | "reject", comments?: string): void {
    const currentUser = this.authService.getCurrentUserSnapshot()
    if (!currentUser) return

    const request = {
      approverId: currentUser.userID,
      comments: comments,
    }

    const serviceCall =
      action === "approve"
        ? this.approvalService.approveStep(approvalId, request)
        : this.approvalService.rejectStep(approvalId, request)

    serviceCall.subscribe({
      next: () => {
        this.loadPendingApprovals() // Refresh the list
      },
      error: (error) => {
        console.error(`Error ${action}ing approval:`, error)
      },
    })
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  getPriorityColor(daysWaiting: number): string {
    if (daysWaiting > 7) return "warn"
    if (daysWaiting > 3) return "accent"
    return "primary"
  }
}
