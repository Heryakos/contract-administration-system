import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractGeneratorComponent } from './contract-generator/contract-generator.component';

const routes: Routes = [
  { path: '', component: ContractGeneratorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractsGeneratorRoutingModule {} 