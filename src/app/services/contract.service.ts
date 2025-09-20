import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConService } from './con.service';
import type {
  Contract,
  CreateContract,
  UpdateContract,
  ContractSummary,
  Vendor,
  ContractType,
  ContractCategory,
  ContractDocument,
} from '../models/contract.model';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor(private con: ConService) {}

  getContracts(params?: { page?: number; pageSize?: number; search?: string; status?: string; vendorId?: string }): Observable<Contract[]> {
    return this.con.getContracts({ search: params?.search, status: params?.status });
  }

  getContract(id: string): Observable<Contract> {
    return this.con.getContract(id);
  }

  createContract(contract: CreateContract): Observable<Contract> {
    return this.con.createContract(contract);
  }

  updateContract(id: string, contract: UpdateContract): Observable<void> {
    return this.con.updateContract(id, contract);
  }

  deleteContract(id: string): Observable<void> {
    return this.con.deleteContract(id);
  }

  getContractSummary(): Observable<ContractSummary> {
    return this.con.getContractSummary();
  }

  getVendors(): Observable<Vendor[]> {
    return this.con.getVendors();
  }

  getContractTypes(): Observable<ContractType[]> {
    return this.con.getContractTypes();
  }

  getContractCategories(): Observable<ContractCategory[]> {
    return this.con.getContractCategories();
  }

  // Documents
  getContractDocuments(contractId: number): Observable<ContractDocument[]> {
    return this.con.getContractDocuments(contractId);
  }

  uploadContractDocument(contractId: number, file: File, uploadedByUserId?: string): Observable<ContractDocument> {
    return this.con.uploadContractDocument(contractId, file, uploadedByUserId);
  }

  deleteContractDocument(contractId: number, documentId: number): Observable<void> {
    return this.con.deleteContractDocument(contractId, documentId);
  }
}