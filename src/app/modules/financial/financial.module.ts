import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule } from "@angular/forms"
import { RouterModule, type Routes } from "@angular/router"

// Angular Material
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatTableModule } from "@angular/material/table"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatSortModule } from "@angular/material/sort"
import { MatChipsModule } from "@angular/material/chips"
import { MatDialogModule } from "@angular/material/dialog"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { MatTabsModule } from "@angular/material/tabs"
import { MatMenuModule } from "@angular/material/menu"

// Components
import { FinancialDashboardComponent } from "./components/financial-dashboard/financial-dashboard.component"
import { PaymentSchedulesComponent } from "./components/payment-schedules/payment-schedules.component"
import { InvoicesListComponent } from "./components/invoices-list/invoices-list.component"
import { InvoiceDetailComponent } from "./components/invoice-detail/invoice-detail.component"
import { PenaltiesListComponent } from "./components/penalties-list/penalties-list.component"

const routes: Routes = [
  { path: "", component: FinancialDashboardComponent },
  { path: "payments", component: PaymentSchedulesComponent },
  { path: "invoices", component: InvoicesListComponent },
  { path: "invoices/:id", component: InvoiceDetailComponent },
  { path: "penalties", component: PenaltiesListComponent },
]

@NgModule({
  declarations: [
    FinancialDashboardComponent,
    PaymentSchedulesComponent,
    InvoicesListComponent,
    InvoiceDetailComponent,
    PenaltiesListComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatMenuModule,
  ],
})
export class FinancialModule {}
