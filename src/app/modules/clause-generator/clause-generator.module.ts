import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ClauseGeneratorRoutingModule } from './clause-generator-routing.module';
import { ClauseGeneratorComponent } from './components/clause-generator/clause-generator.component';
import { ClauseGeneratorService } from './services/clause-generator.service';

@NgModule({
  declarations: [
    ClauseGeneratorComponent
  ],
  imports: [
    CommonModule,
    ClauseGeneratorRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatProgressSpinnerModule
  ],
  providers: [
    ClauseGeneratorService
  ]
})
export class ClauseGeneratorModule { }
