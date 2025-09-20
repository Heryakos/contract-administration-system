import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http"
import { ReactiveFormsModule, FormsModule } from "@angular/forms"

// Angular Material Modules
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatSidenavModule } from "@angular/material/sidenav"
import { MatListModule } from "@angular/material/list"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { MatCardModule } from "@angular/material/card"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { MatTableModule } from "@angular/material/table"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatSortModule } from "@angular/material/sort"
import { MatDialogModule } from "@angular/material/dialog"
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatChipsModule } from "@angular/material/chips"
import { MatMenuModule } from "@angular/material/menu"
import { MatBadgeModule } from "@angular/material/badge"
import { MatTabsModule } from "@angular/material/tabs"
import { MatExpansionModule } from "@angular/material/expansion"
import { MatProgressBarModule } from "@angular/material/progress-bar"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatTooltipModule } from "@angular/material/tooltip"
import { MatSlideToggleModule } from "@angular/material/slide-toggle"
import { MatSliderModule } from "@angular/material/slider"
import { MatDividerModule } from "@angular/material/divider"
import { DragDropModule } from "@angular/cdk/drag-drop"

import { AppRoutingModule } from "./app-routing.module"
import { AppComponent } from "./app.component"

// Components
import { LoginComponent } from "./components/auth/login/login.component"
import { DashboardComponent } from "./components/dashboard/dashboard.component"
import { MainLayoutComponent } from "./components/layout/main-layout/main-layout.component"
import { HeaderComponent } from "./components/layout/header/header.component"
import { SidebarComponent } from "./components/layout/sidebar/sidebar.component"
import { ContractsListComponent } from "./components/contracts/contracts-list/contracts-list.component"
import { ContractDetailComponent } from "./components/contracts/contract-detail/contract-detail.component"
import { ContractFormComponent } from "./components/contracts/contract-form/contract-form.component"

// Services & Interceptors
import { AuthInterceptor } from "./interceptors/auth.interceptor"
import { ErrorInterceptor } from "./interceptors/error.interceptor";
import { ClauseLibraryDialogComponent } from './components/contracts/clause-library-dialog/clause-library-dialog.component';
import { ContractPreviewComponent } from './components/contracts/contract-preview/contract-preview.component';
import { TemplateLibraryDialogComponent } from './components/contracts/template-library-dialog/template-library-dialog.component';
import { AddClauseDialogComponent } from './components/contracts/add-clause-dialog/add-clause-dialog.component';
import { NgApexchartsModule } from "ng-apexcharts";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    MainLayoutComponent,
    HeaderComponent,
    SidebarComponent,
    ContractsListComponent,
    ContractDetailComponent,
    ContractFormComponent,
    ClauseLibraryDialogComponent,
    ContractPreviewComponent,
    TemplateLibraryDialogComponent,
    AddClauseDialogComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,

    // Angular Material
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatBadgeModule,
    MatTabsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatDividerModule,
    DragDropModule,
    NgApexchartsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
