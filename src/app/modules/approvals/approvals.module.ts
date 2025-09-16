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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { MatTabsModule } from "@angular/material/tabs"
import { MatStepperModule } from "@angular/material/stepper"

// Components
import { ApprovalsListComponent } from "./components/approvals-list/approvals-list.component"
import { ApprovalDetailComponent } from "./components/approval-detail/approval-detail.component"
import { ApprovalActionDialogComponent } from "./components/approval-action-dialog/approval-action-dialog.component"

const routes: Routes = [
  { path: "", component: ApprovalsListComponent },
  { path: ":id", component: ApprovalDetailComponent },
]

@NgModule({
  declarations: [ApprovalsListComponent, ApprovalDetailComponent, ApprovalActionDialogComponent],
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatStepperModule,
  ],
})
export class ApprovalsModule {}
