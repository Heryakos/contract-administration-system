import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type {
  Contract,
  CreateContract,
  UpdateContract,
  ContractSummary,
  Vendor,
  ContractType,
  ContractCategory,
} from '../models/contract.model';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor(private api: ApiService) {}

  // API service methods
  getContracts(params?: { page?: number; pageSize?: number; search?: string; status?: string; vendorId?: string }): Observable<Contract[]> {
    return this.api.getContracts(params);
  }

  getContract(id: string): Observable<Contract> {
    return this.api.getContract(id);
  }

  createContract(contract: CreateContract): Observable<Contract> {
    return this.api.createContract(contract);
  }

  updateContract(id: string, contract: UpdateContract): Observable<void> {
    return this.api.updateContract(id, contract);
  }

  deleteContract(id: string): Observable<void> {
    return this.api.deleteContract(id);
  }

  getContractSummary(): Observable<ContractSummary> {
    return this.api.getContractSummary();
  }

  getVendors(): Observable<Vendor[]> {
    return this.api.getVendors();
  }

  getContractTypes(): Observable<ContractType[]> {
    return this.api.getContractTypes();
  }

  getContractCategories(): Observable<ContractCategory[]> {
    return this.api.getContractCategories();
  }
}