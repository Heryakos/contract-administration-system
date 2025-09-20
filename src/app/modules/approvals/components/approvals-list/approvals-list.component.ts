import { Component, type OnInit, ViewChild, OnDestroy } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { MatDialog } from "@angular/material/dialog"
import { Router } from "@angular/router"
import { Subscription } from "rxjs"
import { ApprovalService } from "../../services/approval.service"
import { ConService } from "../../../../services/con.service"
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
export class ApprovalsListComponent implements OnInit, OnDestroy {
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
  private employeeSubscription!: Subscription
  private currentUserGuid: string | null = null

  constructor(
    private approvalService: ApprovalService,
    private con: ConService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit(): void {
    console.log('ApprovalsListComponent ngOnInit called');
    
    // Check if we already have employee data
    const currentEmployee = this.con.getCurrentEmployeeSnapshot();
    
    console.log('Current employee snapshot:', currentEmployee); // Debug log
    
    if (currentEmployee && this.getUserIdFromEmployee(currentEmployee)) {
      this.currentUserGuid = this.getUserIdFromEmployee(currentEmployee);
      console.log('Using snapshot user_ID:', this.currentUserGuid); // Debug log
      this.loadPendingApprovals();
    } else {
      // Wait for employee to load before fetching approvals
      this.employeeSubscription = this.con.currentEmployee$.subscribe((employeeData) => {
        console.log('Employee data received:', employeeData); // Debug log
        
        // Handle different possible response formats
        const userId = this.getUserIdFromEmployee(employeeData);
        
        if (userId) {
          this.currentUserGuid = userId;
          console.log('Using subscription user_ID:', this.currentUserGuid); // Debug log
          this.loadPendingApprovals();
        } else if (employeeData === null) {
          // Do nothing, wait for the next emission
          console.log('Employee data is null, waiting for next emission'); // Debug log
        } else {
          console.log('No user_ID found in employee data'); // Debug log
          this.handleEmployeeError();
        }
      }, (error) => {
        console.error('Error in employee subscription:', error);
        this.handleEmployeeError();
      });
    }
  }
  
  // Helper method to extract user_ID from different possible formats
  private getUserIdFromEmployee(employeeData: any): string | null {
    if (!employeeData) return null;
    
    // If it's a direct object, try to get user_ID
    if (typeof employeeData === 'object' && !Array.isArray(employeeData)) {
      return employeeData.user_ID ?? employeeData.employee_Id ?? null;
    }
    
    // If it's an array, try [0].user_ID
    if (Array.isArray(employeeData) && employeeData.length > 0) {
      const firstItem = employeeData[0];
      return firstItem.user_ID ?? firstItem.employee_Id ?? null;
    }
    
    // If it's wrapped in c_Employees array (old format)
    if (employeeData.c_Employees && Array.isArray(employeeData.c_Employees) && employeeData.c_Employees.length > 0) {
      const firstEmployee = employeeData.c_Employees[0];
      return firstEmployee.user_ID ?? firstEmployee.employee_Id ?? null;
    }
    
    return null;
  }

  ngOnDestroy(): void {
    if (this.employeeSubscription) {
      this.employeeSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  loadPendingApprovals(): void {
    if (!this.currentUserGuid) {
      this.error = "User not identified. Please try refreshing the page.";
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    this.approvalService.getPendingApprovals(this.currentUserGuid).subscribe({
      next: (approvals: PendingApproval[]) => {
        this.dataSource.data = approvals;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = "Failed to load pending approvals";
        this.loading = false;
        console.error("Error loading approvals:", error);
      },
    });
  }

  private handleEmployeeError(): void {
    this.error = "Unable to retrieve employee information. Please try refreshing the page.";
    this.loading = false;
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

    dialogRef.afterClosed().subscribe((result: any) => {
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

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.processApproval(approval.approvalID, "reject", result.comments)
      }
    })
  }

  private processApproval(approvalId: string, action: "approve" | "reject", comments?: string): void {
    if (!this.currentUserGuid) {
      this.error = "User not identified. Please try refreshing the page."
      return
    }

    // Create the request in the exact format the API expects
    const request = {
      approverId: this.currentUserGuid,
      comments: comments
    }

    console.log('Processing approval:', {
      approvalId,
      action,
      request
    });

    const serviceCall =
      action === "approve"
        ? this.approvalService.approveStep(approvalId, request)
        : this.approvalService.rejectStep(approvalId, request)

    serviceCall.subscribe({
      next: () => {
        // Reload approvals using the stored user GUID
        this.loadPendingApprovals()
      },
      error: (error: any) => {
        console.error(`Error ${action}ing approval:`, error)
        this.error = `Failed to ${action} contract. Please try again.`
      },
    })
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "Birr",
    }).format(amount)
  }

  getPriorityColor(daysWaiting: number): string {
    if (daysWaiting > 7) return "warn"
    if (daysWaiting > 3) return "accent"
    return "primary"
  }
}