import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import { TemplateGeneratorRoutingModule } from './template-generator-routing.module';
import { TemplateGeneratorComponent } from './components/template-generator/template-generator.component';
import { TemplateGeneratorService } from './services/template-generator.service';

@NgModule({
  declarations: [
    TemplateGeneratorComponent
  ],
  imports: [
    CommonModule,
    TemplateGeneratorRoutingModule,
    ReactiveFormsModule,
    DragDropModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule
  ],
  providers: [
    TemplateGeneratorService
  ]
})
export class TemplateGeneratorModule { }
