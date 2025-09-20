import { Component, type OnInit, ViewChild } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { MatDialog } from "@angular/material/dialog"
import { Router } from "@angular/router"
import { FormControl } from "@angular/forms"
import { debounceTime, distinctUntilChanged, startWith } from "rxjs/operators"
import { ContractService } from "../../../services/contract.service"
import { type Contract, type Vendor, type ContractType, type ContractCategory } from "../../../models/contract.model"

@Component({
  selector: "app-contracts-list",
  templateUrl: "./contracts-list.component.html",
  styleUrls: ["./contracts-list.component.scss"],
})
export class ContractsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  displayedColumns: string[] = [
    "contractNumber",
    "contractTitle",
    "vendorName",
    "contractType",
    "contractValue",
    "status",
    "endDate",
    "daysToExpiry",
    "actions",
  ]

  dataSource = new MatTableDataSource<Contract>()
  loading = true
  totalCount = 0

  // Filters
  searchControl = new FormControl("")
  statusFilter = new FormControl("")
  vendorFilter = new FormControl("")
  typeFilter = new FormControl("")

  // Lookup data
  vendors: Vendor[] = []
  contractTypes: ContractType[] = []
  contractCategories: ContractCategory[] = []

  statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "Draft", label: "Draft" },
    { value: "Under Review", label: "Under Review" },
    { value: "Approved", label: "Approved" },
    { value: "Active", label: "Active" },
    { value: "Expired", label: "Expired" },
    { value: "Terminated", label: "Terminated" },
  ]

  constructor(
    private contractService: ContractService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadLookupData()
    this.setupFilters()
    this.loadContracts()
  }

  private loadLookupData(): void {
    this.contractService.getVendors().subscribe((vendors) => {
      this.vendors = vendors
    })

    this.contractService.getContractTypes().subscribe((types) => {
      this.contractTypes = types
    })

    this.contractService.getContractCategories().subscribe((categories) => {
      this.contractCategories = categories
    })
  }

  private setupFilters(): void {
    // Search filter
    this.searchControl.valueChanges.pipe(startWith(""), debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.loadContracts()
    })

    // Status filter
    this.statusFilter.valueChanges.subscribe(() => {
      this.loadContracts()
    })

    // Vendor filter
    this.vendorFilter.valueChanges.subscribe(() => {
      this.loadContracts()
    })

    // Type filter
    this.typeFilter.valueChanges.subscribe(() => {
      this.loadContracts()
    })
  }

  private loadContracts(): void {
    this.loading = true

    const params = {
      page: (this.paginator?.pageIndex || 0) + 1,
      pageSize: this.paginator?.pageSize || 10,
      search: this.searchControl.value || undefined,
      status: this.statusFilter.value || undefined,
      vendorId: this.vendorFilter.value || undefined,
      typeId: this.typeFilter.value || undefined,
    }

    this.contractService.getContracts(params).subscribe({
      next: (contracts) => {
        this.dataSource.data = contracts
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading contracts:", error)
        this.loading = false
      },
    })
  }

  onPageChange(): void {
    this.loadContracts()
  }

  clearFilters(): void {
    this.searchControl.setValue("")
    this.statusFilter.setValue("")
    this.vendorFilter.setValue("")
    this.typeFilter.setValue("")
  }

  createContract(): void {
    this.router.navigate(["/contracts/new"])
  }

  viewContract(contract: Contract): void {
    this.router.navigate(["/contracts", contract.contractID])
  }

  editContract(contract: Contract): void {
    this.router.navigate(["/contracts", contract.contractID, "edit"])
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case "active":
        return "status-badge active"
      case "pending":
      case "under review":
        return "status-badge pending"
      case "expired":
      case "terminated":
        return "status-badge expired"
      case "draft":
        return "status-badge draft"
      default:
        return "status-badge"
    }
  }

  getExpiryClass(daysToExpiry: number): string {
    if (daysToExpiry < 0) return "expiry-expired"
    if (daysToExpiry <= 7) return "expiry-urgent"
    if (daysToExpiry <= 30) return "expiry-warning"
    return "expiry-normal"
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  exportContracts(): void {
    // TODO: Implement export functionality
    console.log("Export contracts")
  }
}
