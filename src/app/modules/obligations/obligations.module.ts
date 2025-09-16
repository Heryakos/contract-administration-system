import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, type Routes } from "@angular/router"
import { MatCardModule } from "@angular/material/card"

import { Component } from "@angular/core"

@Component({
  selector: "app-obligations-dashboard",
  template: `<mat-card><h1>Obligations</h1><p></p></mat-card>`,
})
export class ObligationsDashboardComponent {}

const routes: Routes = [
  { path: "", component: ObligationsDashboardComponent },
]

@NgModule({
  declarations: [ObligationsDashboardComponent],
  imports: [CommonModule, MatCardModule, RouterModule.forChild(routes)],
})
export class ObligationsModule {}


