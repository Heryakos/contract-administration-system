import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"
import { LoginComponent } from "./components/auth/login/login.component"
import { MainLayoutComponent } from "./components/layout/main-layout/main-layout.component"
import { DashboardComponent } from "./components/dashboard/dashboard.component"
import { ContractsListComponent } from "./components/contracts/contracts-list/contracts-list.component"
import { ContractDetailComponent } from "./components/contracts/contract-detail/contract-detail.component"
import { ContractFormComponent } from "./components/contracts/contract-form/contract-form.component"
import { ContractGeneratorComponent } from "./modules/contracts-generator/contracts-generator.module" // component file contains the component class

const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "",
    component: MainLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: "", redirectTo: "/dashboard", pathMatch: "full" },
      { path: "dashboard", component: DashboardComponent },
      { path: "contracts", component: ContractsListComponent },
      { path: "contracts/generator", component: ContractGeneratorComponent },
      // Route new and edit to the generator component
      { path: "contracts/new", component: ContractGeneratorComponent },
      { path: "contracts/:id/edit", component: ContractGeneratorComponent },
      { path: "contracts/edit/:id", component: ContractGeneratorComponent },
      { path: "contracts/:id", component: ContractDetailComponent },
      {
        path: "approvals",
        loadChildren: () => import("./modules/approvals/approvals.module").then((m) => m.ApprovalsModule),
      },
      {
        path: "obligations",
        loadChildren: () => import("./modules/obligations/obligations.module").then((m) => m.ObligationsModule),
      },
      {
        path: "financial",
        loadChildren: () => import("./modules/financial/financial.module").then((m) => m.FinancialModule),
      },
      { path: "risks", loadChildren: () => import("./modules/risks/risks.module").then((m) => m.RisksModule) },
      { path: "reports", loadChildren: () => import("./modules/reports/reports.module").then((m) => m.ReportsModule) },
    ],
  },
  { path: "**", redirectTo: "/dashboard" },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
