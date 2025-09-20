import { Injectable } from "@angular/core"
import { type Observable } from "rxjs"
import { ConService } from "../../../services/con.service"

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
  constructor(private con: ConService) {}

  // Payment Schedules
  getPaymentSchedulesByContract(contractId: string): Observable<PaymentSchedule[]> {
    return this.con.getPaymentSchedulesByContract(Number(contractId))
  }

  getUpcomingPayments(days = 30): Observable<PaymentSchedule[]> {
    return this.con.getUpcomingPayments(days)
  }

  createPaymentSchedule(schedule: any): Observable<PaymentSchedule> {
    return this.con.createPaymentSchedule(schedule)
  }

  updatePaymentSchedule(id: string, schedule: any): Observable<void> {
    return this.con.updatePaymentSchedule(Number(id), schedule)
  }

  deletePaymentSchedule(id: string): Observable<void> {
    return this.con.deletePaymentSchedule(Number(id))
  }

  // Invoices
  getInvoices(status?: string): Observable<Invoice[]> {
    return this.con.getInvoices(status)
  }

  getInvoice(id: string): Observable<Invoice> {
    return this.con.getInvoice(Number(id))
  }

  createInvoice(invoice: any): Observable<Invoice> {
    return this.con.createInvoice(invoice)
  }

  approveInvoice(id: string, approvedBy: string): Observable<any> {
    return this.con.approveInvoice(Number(id), approvedBy as unknown as any)
  }

  rejectInvoice(id: string, rejectedBy: string): Observable<any> {
    return this.con.rejectInvoice(Number(id), rejectedBy as unknown as any)
  }

  markInvoicePaid(id: string): Observable<any> {
    return this.con.markInvoicePaid(Number(id))
  }

  // Financial Summary
  getFinancialSummary(): Observable<FinancialSummary> {
    return this.con.getFinancialSummary()
  }
}
