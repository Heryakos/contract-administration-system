import { Component, type OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import { MatSnackBar } from "@angular/material/snack-bar"
import { ContractService } from "../../../services/contract.service"
import type {
  Contract,
  CreateContract,
  UpdateContract,
  Vendor,
  ContractType,
  ContractCategory,
} from "../../../models/contract.model"

@Component({
  selector: "app-contract-form",
  templateUrl: "./contract-form.component.html",
  styleUrls: ["./contract-form.component.scss"],
})
export class ContractFormComponent implements OnInit {
  contractForm: FormGroup
  isEditMode = false
  contractId: string | null = null
  loading = false

  vendors: Vendor[] = []
  contractTypes: ContractType[] = []
  categories: ContractCategory[] = []

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService,
    private snackBar: MatSnackBar,
  ) {
    this.contractForm = this.createForm()
  }

  ngOnInit(): void {
    this.loadLookupData()

    this.contractId = this.route.snapshot.paramMap.get("id")
    this.isEditMode = !!this.contractId

    if (this.isEditMode && this.contractId) {
      this.loadContract(this.contractId)
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      contractTitle: ["", [Validators.required, Validators.maxLength(200)]],
      contractNumber: ["", [Validators.required, Validators.maxLength(50)]],
      description: ["", Validators.maxLength(1000)],
      vendorID: ["", Validators.required],
      contractTypeID: ["", Validators.required],
      categoryID: ["", Validators.required],
      contractValue: [0, [Validators.required, Validators.min(0)]],
      currency: ["USD", Validators.required],
      startDate: ["", Validators.required],
      endDate: ["", Validators.required],
      status: ["Draft", Validators.required],
    })
  }

  loadLookupData(): void {
    // Load vendors
    this.contractService.getVendors().subscribe({
      next: (vendors) => (this.vendors = vendors),
      error: (error) => console.error("Error loading vendors:", error),
    })

    // Load contract types
    this.contractService.getContractTypes().subscribe({
      next: (types) => (this.contractTypes = types),
      error: (error) => console.error("Error loading contract types:", error),
    })

    // Load categories
    this.contractService.getContractCategories().subscribe({
      next: (categories) => (this.categories = categories),
      error: (error) => console.error("Error loading categories:", error),
    })
  }

  loadContract(id: string): void {
    this.loading = true
    this.contractService.getContract(id).subscribe({
      next: (contract) => {
        this.populateForm(contract)
        this.loading = false
      },
      error: (error) => {
        this.snackBar.open("Failed to load contract", "Close", { duration: 3000 })
        this.loading = false
        console.error("Error loading contract:", error)
      },
    })
  }

  populateForm(contract: Contract): void {
    const anyContract: any = contract as any
    this.contractForm.patchValue({
      contractTitle: contract.contractTitle,
      contractNumber: contract.contractNumber,
      description: contract.description,
      vendorID: anyContract.vendorID || "",
      contractTypeID: anyContract.contractTypeID || "",
      categoryID: anyContract.categoryID || "",
      contractValue: contract.contractValue || 0,
      currency: contract.currency,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
    })
  }

  onSubmit(): void {
    if (this.contractForm.valid) {
      this.loading = true

      if (this.isEditMode && this.contractId) {
        this.updateContract()
      } else {
        this.createContract()
      }
    } else {
      this.markFormGroupTouched()
    }
  }

  createContract(): void {
    const contractData: CreateContract = this.contractForm.value

    this.contractService.createContract(contractData).subscribe({
      next: (contract) => {
        this.snackBar.open("Contract created successfully", "Close", { duration: 3000 })
        this.router.navigate(["/contracts", (contract as any).contractID])
        this.loading = false
      },
      error: (error) => {
        this.snackBar.open("Failed to create contract", "Close", { duration: 3000 })
        this.loading = false
        console.error("Error creating contract:", error)
      },
    })
  }

  updateContract(): void {
    const contractData: UpdateContract = this.contractForm.value

    this.contractService.updateContract(this.contractId!, contractData).subscribe({
      next: () => {
        this.snackBar.open("Contract updated successfully", "Close", { duration: 3000 })
        this.router.navigate(["/contracts", this.contractId])
        this.loading = false
      },
      error: (error) => {
        this.snackBar.open("Failed to update contract", "Close", { duration: 3000 })
        this.loading = false
        console.error("Error updating contract:", error)
      },
    })
  }

  onCancel(): void {
    if (this.isEditMode) {
      this.router.navigate(["/contracts", this.contractId])
    } else {
      this.router.navigate(["/contracts"])
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contractForm.controls).forEach((key) => {
      const control = this.contractForm.get(key)
      control?.markAsTouched()
    })
  }

  getFieldError(fieldName: string): string {
    const control = this.contractForm.get(fieldName)
    if (control?.errors && control.touched) {
      if (control.errors["required"]) return `${fieldName} is required`
      if (control.errors["maxlength"]) return `${fieldName} is too long`
      if (control.errors["min"]) return `${fieldName} must be greater than 0`
    }
    return ""
  }
}
