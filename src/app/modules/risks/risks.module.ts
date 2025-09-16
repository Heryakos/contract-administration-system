import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, type Routes } from "@angular/router"
import { ReactiveFormsModule, FormsModule } from "@angular/forms"

// Angular Material Imports
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatTableModule } from "@angular/material/table"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatSortModule } from "@angular/material/sort"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatChipsModule } from "@angular/material/chips"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatDialogModule } from "@angular/material/dialog"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { MatTabsModule } from "@angular/material/tabs"
import { MatGridListModule } from "@angular/material/grid-list"

// Components
import { RisksDashboardComponent } from "./components/risks-dashboard/risks-dashboard.component"
import { RisksListComponent } from "./components/risks-list/risks-list.component"
import { RiskFormDialogComponent } from "./components/risk-form-dialog/risk-form-dialog.component"

const routes: Routes = [
  { path: "", component: RisksDashboardComponent },
  { path: "risks", component: RisksListComponent },
]

@NgModule({
  declarations: [RisksDashboardComponent, RisksListComponent, RiskFormDialogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatGridListModule,
  ],
})
export class RisksModule {}
