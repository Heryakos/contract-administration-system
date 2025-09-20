import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, type Routes } from "@angular/router"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MatCardModule } from "@angular/material/card"
import { MatTableModule } from "@angular/material/table"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatSortModule } from "@angular/material/sort"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { NgChartsModule } from "ng2-charts"

import { ObligationsDashboardComponent } from "./components/obligations-dashboard/obligations-dashboard.component"
import { ObligationsListComponent } from "./components/obligations-list/obligations-list.component"

const routes: Routes = [
  { path: "", component: ObligationsDashboardComponent },
  { path: "list", component: ObligationsListComponent },
]

@NgModule({
  declarations: [ObligationsDashboardComponent, ObligationsListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgChartsModule,
    RouterModule.forChild(routes),
  ],
})
export class ObligationsModule {}


