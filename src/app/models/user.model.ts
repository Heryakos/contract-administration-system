export interface User {
  userID: string
  username: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  isActive: boolean
  createdDate: Date
  lastLoginDate?: Date
  department?: string
  jobTitle?: string
  roles: Role[]
}

export interface Role {
  roleID: string
  roleName: string
  description?: string
  isActive: boolean
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  expiresAt: Date
  user: User
}

export interface RegisterRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  password: string
  department?: string
  jobTitle?: string
  roleIds: string[]
}
