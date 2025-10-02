import { Prisma } from '@prisma/client'

// Typy dla pełnych obiektów z relacjami
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    assignedClients: true
    assignedCases: true
    assignedTasks: true
  }
}>

export type ClientWithRelations = Prisma.ClientGetPayload<{
  include: {
    assignedAgent: true
    cases: {
      include: {
        status: true
        insuranceCompany: true
      }
    }
    notes: true
    tasks: true
  }
}>

export type CaseWithRelations = Prisma.CaseGetPayload<{
  include: {
    client: true
    status: true
    insuranceCompany: true
    assignedAgent: true
    documents: {
      include: {
        category: true
      }
    }
    notes: true
    tasks: true
    statusHistory: {
      include: {
        fromStatus: true
        toStatus: true
        changedBy: true
      }
    }
  }
}>

export type DocumentWithRelations = Prisma.DocumentGetPayload<{
  include: {
    case: true
    client: true
    category: true
    uploadedBy: true
  }
}>

// Typy dla dashboardu
export interface DashboardStats {
  totalClients: number
  activeCases: number
  monthlyRevenue: number
  successRate: number
  newCasesThisMonth: number
  completedCasesThisMonth: number
}

export interface RecentCase {
  id: string
  caseNumber: string
  clientName: string
  statusName: string
  statusColor: string | null
  claimValue: number | null
  createdAt: Date
}

export interface TaskSummary {
  id: string
  title: string
  dueDate: Date | null
  priority: string
  caseNumber?: string
  clientName?: string
}

// Typy dla formularzy
export interface CreateClientData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  pesel: string
  idNumber?: string
  street?: string
  houseNumber?: string
  apartmentNumber?: string
  postalCode?: string
  city: string
  notes?: string
  gdprConsent: boolean
  marketingConsent: boolean
  assignedAgentId?: string
}

export interface CreateCaseData {
  clientId: string
  incidentDate: Date
  incidentDescription?: string
  incidentLocation?: string
  policyNumber?: string
  claimValue?: number
  vehicleBrand?: string
  vehicleModel?: string
  vehicleRegistration?: string
  vehicleYear?: number
  insuranceCompanyId?: number
  assignedAgentId?: string
}

export interface UpdateCaseStatusData {
  caseId: string
  newStatusId: number
  comment?: string
}

// Typy dla API responses
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Typy dla filtrów i wyszukiwania
export interface CaseFilters {
  statusId?: number
  insuranceCompanyId?: number
  assignedAgentId?: string
  clientSearch?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface ClientFilters {
  assignedAgentId?: string
  city?: string
  search?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

// Typy dla autoryzacji
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

// Typy dla uploadów
export interface FileUploadResult {
  id: string
  fileName: string
  originalFileName: string
  filePath: string
  fileSize: number
  mimeType: string
}

// Enums z bazy danych
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  ASSISTANT = 'ASSISTANT',
  ACCOUNTANT = 'ACCOUNTANT'
}

export enum TaskPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}
