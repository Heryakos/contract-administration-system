import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, type Routes } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { Component } from "@angular/core"

@Component({
  selector: "app-reports-dashboard",
  template: `<mat-card><h1>Reports</h1><p></p></mat-card>`,
})
export class ReportsDashboardComponent {}

const routes: Routes = [
  { path: "", component: ReportsDashboardComponent },
]

@NgModule({
  declarations: [ReportsDashboardComponent],
  imports: [CommonModule, MatCardModule, RouterModule.forChild(routes)],
})
export class ReportsModule {}


