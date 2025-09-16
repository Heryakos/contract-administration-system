import { Component, type OnInit, ViewChild } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { MatDialog } from "@angular/material/dialog"
import { RiskService, type Risk } from "../../services/risk.service"
import { RiskFormDialogComponent } from "../risk-form-dialog/risk-form-dialog.component"

@Component({
  selector: "app-risks-list",
  templateUrl: "./risks-list.component.html",
  styleUrls: ["./risks-list.component.scss"],
})
export class RisksListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  displayedColumns: string[] = [
    "riskTitle",
    "contractTitle",
    "riskCategory",
    "riskScore",
    "status",
    "assignedToName",
    "lastUpdated",
    "actions",
  ]

  dataSource = new MatTableDataSource<Risk>()
  loading = true
  error: string | null = null

  // Filters
  selectedCategory = ""
  selectedStatus = ""
  searchTerm = ""

  categories: string[] = []
  statuses: string[] = []

  constructor(
    private riskService: RiskService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.categories = this.riskService.getRiskCategories()
    this.statuses = this.riskService.getRiskStatuses()
    this.loadRisks()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  loadRisks(): void {
    this.loading = true
    this.error = null

    this.riskService
      .getRisks(undefined, this.selectedCategory || undefined, this.selectedStatus || undefined)
      .subscribe({
        next: (risks) => {
          this.dataSource.data = risks
          this.loading = false
        },
        error: (error) => {
          console.error("Error loading risks:", error)
          this.error = "Failed to load risks"
          this.loading = false
        },
      })
  }

  applyFilter(): void {
    const filterValue = this.searchTerm.trim().toLowerCase()
    this.dataSource.filter = filterValue
  }

  onFilterChange(): void {
    this.loadRisks()
  }

  clearFilters(): void {
    this.selectedCategory = ""
    this.selectedStatus = ""
    this.searchTerm = ""
    this.dataSource.filter = ""
    this.loadRisks()
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(RiskFormDialogComponent, {
      width: "600px",
      data: { mode: "create" },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadRisks()
      }
    })
  }

  openEditDialog(risk: Risk): void {
    const dialogRef = this.dialog.open(RiskFormDialogComponent, {
      width: "600px",
      data: { mode: "edit", risk },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadRisks()
      }
    })
  }

  getRiskLevel(score: number): string {
    return this.riskService.getRiskLevel(score)
  }

  getRiskLevelColor(score: number): string {
    return this.riskService.getRiskLevelColor(score)
  }
}
