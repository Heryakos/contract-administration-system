import { Component, Inject } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"

export interface ApprovalActionData {
  action: "approve" | "reject"
  approval: any
}

@Component({
  selector: "app-approval-action-dialog",
  templateUrl: "./approval-action-dialog.component.html",
  styleUrls: ["./approval-action-dialog.component.scss"],
})
export class ApprovalActionDialogComponent {
  actionForm: FormGroup
  data: ApprovalActionData

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ApprovalActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) matDialogData: any,
  ) {
    this.data = matDialogData
    this.actionForm = this.fb.group({
      comments: ["", this.data.action === "reject" ? [Validators.required] : []],
    })
  }

  onSubmit(): void {
    if (this.actionForm.valid) {
      this.dialogRef.close({
        comments: this.actionForm.value.comments,
      })
    }
  }

  onCancel(): void {
    this.dialogRef.close()
  }

  get isReject(): boolean {
    return this.data.action === "reject"
  }

  get actionTitle(): string {
    return this.isReject ? "Reject Contract" : "Approve Contract"
  }

  get actionColor(): string {
    return this.isReject ? "warn" : "primary"
  }
}
