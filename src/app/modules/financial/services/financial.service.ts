import { Injectable } from "@angular/core"
import { type Observable } from "rxjs"
import { ApiService } from "../../../services/api.service"

export interface PaymentSchedule {
  paymentScheduleID: string
  contractID: string
  contractTitle?: string
  contractNumber?: string
  paymentNumber: number
  description?: string
  scheduledAmount: number
  scheduledDate: Date
  status: string
  linkedObligationID?: string
  linkedObligationTitle?: string
  createdDate: Date
  invoiceCount: number
  paidAmount: number
  daysUntilDue?: number
}

export interface Invoice {
  invoiceID: string
  contractID: string
  contractTitle?: string
  contractNumber?: string
  paymentScheduleID?: string
  invoiceNumber: string
  invoiceDate: Date
  amount: number
  status: string
  submittedBy?: string
  submittedDate: Date
  approvedBy?: string
  approvalDate?: Date
  paidDate?: Date
}

export interface Penalty {
  penaltyID: string
  contractID: string
  contractTitle?: string
  contractNumber?: string
  penaltyType?: string
  description?: string
  amount?: number
  appliedDate?: Date
  status: string
  createdBy?: string
  createdDate: Date
}

export interface FinancialSummary {
  totalContractValue: number
  totalScheduledPayments: number
  totalPaidAmount: number
  totalPendingPayments: number
  totalOverduePayments: number
  totalPenalties: number
  upcomingPaymentsCount: number
  pendingInvoicesCount: number
  overduePaymentsCount: number
}

@Injectable({ providedIn: "root" })
export class FinancialService {
  constructor(private api: ApiService) {}

  // Payment Schedules
  getPaymentSchedulesByContract(contractId: string): Observable<PaymentSchedule[]> {
    return this.api.getPaymentSchedulesByContract(contractId)
  }

  getUpcomingPayments(days = 30): Observable<PaymentSchedule[]> {
    return this.api.getUpcomingPayments(days)
  }

  createPaymentSchedule(schedule: any): Observable<PaymentSchedule> {
    return this.api.createPaymentSchedule(schedule)
  }

  updatePaymentSchedule(id: string, schedule: any): Observable<void> {
    return this.api.updatePaymentSchedule(id, schedule)
  }

  deletePaymentSchedule(id: string): Observable<void> {
    return this.api.deletePaymentSchedule(id)
  }

  // Invoices
  getInvoices(status?: string): Observable<Invoice[]> {
    return this.api.getInvoices(status)
  }

  getInvoice(id: string): Observable<Invoice> {
    return this.api.getInvoice(id)
  }

  createInvoice(invoice: any): Observable<Invoice> {
    return this.api.createInvoice(invoice)
  }

  approveInvoice(id: string, approvedBy: string): Observable<any> {
    return this.api.approveInvoice(id, approvedBy)
  }

  rejectInvoice(id: string, rejectedBy: string): Observable<any> {
    return this.api.rejectInvoice(id, rejectedBy)
  }

  markInvoicePaid(id: string): Observable<any> {
    return this.api.markInvoicePaid(id)
  }

  // Financial Summary
  getFinancialSummary(): Observable<FinancialSummary> {
    return this.api.getFinancialSummary()
  }
}
