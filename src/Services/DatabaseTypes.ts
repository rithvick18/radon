/**
 * Shared types for the Radon unified database
 */

export interface Customer {
  id: string; name: string; industry: string
  size: 'Small' | 'Mid-Market' | 'Enterprise'
  website: string; region: string; createdAt: string
}

export interface Contact {
  id: string; customerId: string; name: string
  email: string; phone: string; role: string; avatar: string
}

export interface Lead {
  id: string; customerId: string; contactId: string
  value: number
  stage: 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  probability: number; ownerId: string; createdAt: string; notes: string
}

export interface Employee {
  id: string; name: string; department: string; position: string
  salary: number; status: 'active' | 'on-leave' | 'terminated'
  hireDate: string; managerId: string | null; performance: number
  email: string; avatar: string
}

export interface Product {
  id: string; sku: string; name: string; category: string
  unitCost: number; unitPrice: number; supplierId: string; supplierName: string
}

export interface InventoryItem {
  id: string; productId: string; quantity: number
  reorderPoint: number; location: string
  status: 'in-stock' | 'low-stock' | 'critical'
}

export interface Supplier {
  id: string; name: string; category: string; leadTime: string; rating: number
}

export interface Transaction {
  id: string; customerId: string; productId: string
  type: 'sale' | 'purchase' | 'refund' | 'expense'
  amount: number; date: string; category: string
  department: string; status: 'completed' | 'pending' | 'cancelled'; description: string
}

export interface FinancialAccount {
  id: string; account: string
  type: 'Asset' | 'Liability' | 'Revenue' | 'Expense'
  balance: number; change: number; trend: 'up' | 'down'; department: string
}

export interface Project {
  id: string; name: string
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  progress: number; budget: number; spent: number; managerId: string
  startDate: string; endDate: string; teamSize: number
}

export interface Email {
  id: string; fromName: string; fromEmail: string; fromAvatar: string
  to: string; subject: string; preview: string; body: string
  timestamp: string
  category: 'primary' | 'updates' | 'social' | 'promotions'
  labels: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
  isRead: boolean; isStarred: boolean; hasAttachments: boolean
  attachments: Array<{ name: string; size: string }>
  sentiment: 'positive' | 'negative' | 'neutral'
  aiSummary: string; actionItems: string[]; suggestedReplies: string[]
  contactId: string | null; customerId: string | null; threadId: string
}

export interface Dataset {
  id: string; name: string; rows: number; columns: number
  size: string; lastModified: string
  type: 'Excel' | 'CSV' | 'Database' | 'API'
  tables: string[]; source: string
}

export interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'task' | 'note'
  title: string; leadId: string | null; contactId: string | null
  date: string; time: string; duration: string
  notes: string; ownerId: string
}

export interface KPI {
  id: string; module: 'analytics' | 'erp' | 'crm' | 'email'
  label: string; value: string; change: string; trend: 'up' | 'down'
}

export type CollectionKey =
  | 'customers' | 'contacts' | 'leads' | 'employees'
  | 'products' | 'inventory' | 'suppliers' | 'transactions'
  | 'financialAccounts' | 'projects' | 'emails'
  | 'datasets' | 'activities' | 'kpis'
