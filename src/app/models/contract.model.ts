export interface Contract {
  contractID: string
  contractNumber: string
  contractTitle: string
  contractType?: string
  category?: string
  vendorName?: string
  contractValue?: number
  currency: string
  startDate?: Date
  endDate?: Date
  status: string
  description?: string
  riskLevel: string
  version: number
  createdBy?: string
  createdDate: Date
  modifiedBy?: string
  modifiedDate?: Date
  daysToExpiry: number
  expiryStatus: string
  completionPercentage: number
}

export interface CreateContract {
  contractNumber: string
  contractTitle: string
  contractTypeID?: string
  categoryID?: string
  vendorID?: string
  contractValue?: number
  currency: string
  startDate?: Date
  endDate?: Date
  description?: string
  riskLevel: string
}

export interface UpdateContract {
  contractTitle: string
  contractTypeID?: string
  categoryID?: string
  vendorID?: string
  contractValue?: number
  currency: string
  startDate?: Date
  endDate?: Date
  description?: string
  riskLevel: string
  status: string
}

export interface ContractSummary {
  totalContracts: number
  activeContracts: number
  expiringContracts: number
  expiredContracts: number
  totalValue: number
  pendingApprovals: number
  overdueObligations: number
}

export interface Vendor {
  vendorID: string
  vendorName: string
  vendorCode?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  rating: number
  isActive: boolean
  totalContracts: number
  totalContractValue: number
}

export interface ContractType {
  contractTypeID: string
  typeName: string
  description?: string
  isActive: boolean
}

export interface ContractCategory {
  categoryID: string
  categoryName: string
  description?: string
  isActive: boolean
}
