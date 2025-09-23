import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClauseGeneratorComponent } from './components/clause-generator/clause-generator.component';

const routes: Routes = [
  {
    path: '',
    component: ClauseGeneratorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClauseGeneratorRoutingModule { }
