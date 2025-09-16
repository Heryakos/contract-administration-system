import { Component, type OnInit, Inject } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { RiskService, type Risk, type CreateRisk, type UpdateRisk } from "../../services/risk.service"

interface DialogData {
  mode: "create" | "edit"
  risk?: Risk
}

@Component({
  selector: "app-risk-form-dialog",
  templateUrl: "./risk-form-dialog.component.html",
  styleUrls: ["./risk-form-dialog.component.scss"],
})
export class RiskFormDialogComponent implements OnInit {
  riskForm: FormGroup
  loading = false
  error: string | null = null

  categories: string[] = []
  statuses: string[] = []
  contracts: any[] = []
  users: any[] = []

  constructor(
    private fb: FormBuilder,
    private riskService: RiskService,
    // private contractService: ContractService,
    private dialogRef: MatDialogRef<RiskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.riskForm = this.createForm()
  }

  ngOnInit(): void {
    this.categories = this.riskService.getRiskCategories()
    this.statuses = this.riskService.getRiskStatuses()
    // this.loadContracts()

    if (this.data.mode === "edit" && this.data.risk) {
      this.populateForm(this.data.risk)
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      contractId: [null, Validators.required],
      riskTitle: ["", Validators.required],
      riskDescription: [""],
      riskCategory: ["", Validators.required],
      likelihood: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      impact: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      status: ["Open"],
      mitigationPlan: [""],
      assignedToId: [null],
    })
  }

  private populateForm(risk: Risk): void {
    this.riskForm.patchValue({
      contractId: risk.contractId,
      riskTitle: risk.riskTitle,
      riskDescription: risk.riskDescription,
      riskCategory: risk.riskCategory,
      likelihood: risk.likelihood,
      impact: risk.impact,
      status: risk.status,
      mitigationPlan: risk.mitigationPlan,
      assignedToId: risk.assignedToId,
    })
  }

  // private loadContracts(): void {
  //   this.contractService.getContracts().subscribe({
  //     next: (contracts) => {
  //       this.contracts = contracts
  //     },
  //     error: (error) => {
  //       console.error("Error loading contracts:", error)
  //     },
  //   })
  // }

  getRiskScore(): number {
    const likelihood = this.riskForm.get("likelihood")?.value || 1
    const impact = this.riskForm.get("impact")?.value || 1
    return likelihood * impact
  }

  getRiskLevel(): string {
    return this.riskService.getRiskLevel(this.getRiskScore())
  }

  onSubmit(): void {
    if (this.riskForm.valid) {
      this.loading = true
      this.error = null

      const formValue = this.riskForm.value

      if (this.data.mode === "create") {
        const createRisk: CreateRisk = {
          contractId: formValue.contractId,
          riskTitle: formValue.riskTitle,
          riskDescription: formValue.riskDescription,
          riskCategory: formValue.riskCategory,
          likelihood: formValue.likelihood,
          impact: formValue.impact,
          mitigationPlan: formValue.mitigationPlan,
          assignedToId: formValue.assignedToId,
        }

        this.riskService.createRisk(createRisk).subscribe({
          next: () => {
            this.loading = false
            this.dialogRef.close(true)
          },
          error: (error) => {
            console.error("Error creating risk:", error)
            this.error = "Failed to create risk"
            this.loading = false
          },
        })
      } else if (this.data.risk) {
        const updateRisk: UpdateRisk = {
          riskTitle: formValue.riskTitle,
          riskDescription: formValue.riskDescription,
          riskCategory: formValue.riskCategory,
          likelihood: formValue.likelihood,
          impact: formValue.impact,
          status: formValue.status,
          mitigationPlan: formValue.mitigationPlan,
          assignedToId: formValue.assignedToId,
        }

        this.riskService.updateRisk(this.data.risk.id, updateRisk).subscribe({
          next: () => {
            this.loading = false
            this.dialogRef.close(true)
          },
          error: (error) => {
            console.error("Error updating risk:", error)
            this.error = "Failed to update risk"
            this.loading = false
          },
        })
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false)
  }

  get isEditMode(): boolean {
    return this.data.mode === "edit"
  }

  get dialogTitle(): string {
    return this.isEditMode ? "Edit Risk" : "Create New Risk"
  }
}
