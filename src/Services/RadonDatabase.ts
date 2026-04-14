/**
 * RadonDatabase — Unified data layer for seamless integration
 * across Analytics, ERP, CRM, and Email Engine modules.
 *
 * Uses localStorage for persistence and a custom event bus
 * for real-time cross-component reactivity.
 */

import type {
  Customer, Contact, Lead, Employee, Product, InventoryItem,
  Supplier, Transaction, FinancialAccount, Project, Email,
  Dataset, Activity, KPI, CollectionKey
} from './DatabaseTypes'

import {
  SEED_CUSTOMERS, SEED_CONTACTS, SEED_LEADS, SEED_EMPLOYEES,
  SEED_PRODUCTS, SEED_INVENTORY, SEED_SUPPLIERS, SEED_TRANSACTIONS,
  SEED_FINANCIAL_ACCOUNTS, SEED_PROJECTS, SEED_EMAILS,
  SEED_DATASETS, SEED_ACTIVITIES, SEED_KPIS
} from './DatabaseSeed'

// Re-export types for convenience
export type {
  Customer, Contact, Lead, Employee, Product, InventoryItem,
  Supplier, Transaction, FinancialAccount, Project, Email,
  Dataset, Activity, KPI, CollectionKey
}

// ═══════════════════════════════════════════════════════════════
// EVENT BUS
// ═══════════════════════════════════════════════════════════════

type Listener = (collection: CollectionKey, id?: string) => void

class EventBus {
  private listeners: Listener[] = []

  subscribe(fn: Listener): () => void {
    this.listeners.push(fn)
    return () => { this.listeners = this.listeners.filter(l => l !== fn) }
  }

  emit(collection: CollectionKey, id?: string): void {
    this.listeners.forEach(fn => fn(collection, id))
  }
}

const bus = new EventBus()

// ═══════════════════════════════════════════════════════════════
// DATABASE CLASS
// ═══════════════════════════════════════════════════════════════

const STORAGE_PREFIX = 'radon_db_'

class RadonDatabase {
  private static instance: RadonDatabase

  private constructor() {
    this.seedIfEmpty()
  }

  static getInstance(): RadonDatabase {
    if (!RadonDatabase.instance) {
      RadonDatabase.instance = new RadonDatabase()
    }
    return RadonDatabase.instance
  }

  // ── Core CRUD ──────────────────────────────────────────────

  private read<T>(key: CollectionKey): T[] {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  private write<T>(key: CollectionKey, data: T[]): void {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data))
    bus.emit(key)
  }

  getAll<T>(key: CollectionKey): T[] {
    return this.read<T>(key)
  }

  getById<T extends { id: string }>(key: CollectionKey, id: string): T | undefined {
    return this.read<T>(key).find(item => item.id === id)
  }

  insert<T extends { id: string }>(key: CollectionKey, item: T): T {
    const data = this.read<T>(key)
    data.push(item)
    this.write(key, data)
    bus.emit(key, item.id)
    return item
  }

  update<T extends { id: string }>(key: CollectionKey, id: string, patch: Partial<T>): T | undefined {
    const data = this.read<T>(key)
    const idx = data.findIndex(item => item.id === id)
    if (idx === -1) return undefined
    data[idx] = { ...data[idx], ...patch }
    this.write(key, data)
    bus.emit(key, id)
    return data[idx]
  }

  remove(key: CollectionKey, id: string): boolean {
    const data = this.read(key)
    const filtered = data.filter((item: any) => item.id !== id)
    if (filtered.length === data.length) return false
    this.write(key, filtered)
    bus.emit(key, id)
    return true
  }

  bulkInsert<T extends { id: string }>(key: CollectionKey, items: T[]): void {
    const data = this.read<T>(key)
    data.push(...items)
    this.write(key, data)
  }

  replaceAll<T>(key: CollectionKey, items: T[]): void {
    this.write(key, items)
  }

  query<T>(key: CollectionKey, predicate: (item: T) => boolean): T[] {
    return this.read<T>(key).filter(predicate)
  }

  count(key: CollectionKey): number {
    return this.read(key).length
  }

  // ── Cross-module convenience methods ────────────────────────

  getEmailsByContact(contactId: string): Email[] {
    return this.read<Email>('emails').filter(e => e.contactId === contactId)
  }

  getEmailsByCustomer(customerId: string): Email[] {
    return this.read<Email>('emails').filter(e => e.customerId === customerId)
  }

  getTransactionsByCustomer(customerId: string): Transaction[] {
    return this.read<Transaction>('transactions').filter(t => t.customerId === customerId)
  }

  getContactForLead(lead: Lead): Contact | undefined {
    return this.getById<Contact>('contacts', lead.contactId)
  }

  getCustomerForLead(lead: Lead): Customer | undefined {
    return this.getById<Customer>('customers', lead.customerId)
  }

  getOwnerForLead(lead: Lead): Employee | undefined {
    return this.getById<Employee>('employees', lead.ownerId)
  }

  getLeadsByCustomer(customerId: string): Lead[] {
    return this.read<Lead>('leads').filter(l => l.customerId === customerId)
  }

  getInventoryForProduct(productId: string): InventoryItem | undefined {
    return this.read<InventoryItem>('inventory').find(i => i.productId === productId)
  }

  getActivitiesByLead(leadId: string): Activity[] {
    return this.read<Activity>('activities').filter(a => a.leadId === leadId)
  }

  getProjectsByManager(managerId: string): Project[] {
    return this.read<Project>('projects').filter(p => p.managerId === managerId)
  }

  getKPIsByModule(module: KPI['module']): KPI[] {
    return this.read<KPI>('kpis').filter(k => k.module === module)
  }

  getTotalPipelineValue(): number {
    return this.read<Lead>('leads')
      .filter(l => l.stage !== 'closed-lost')
      .reduce((sum, l) => sum + l.value, 0)
  }

  getTotalRevenue(): number {
    return this.read<Transaction>('transactions')
      .filter(t => t.type === 'sale' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  getInventoryValue(): number {
    const items = this.read<InventoryItem>('inventory')
    const products = this.read<Product>('products')
    return items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)
      return sum + (product ? product.unitCost * item.quantity : 0)
    }, 0)
  }

  getLowStockCount(): number {
    return this.read<InventoryItem>('inventory').filter(i => i.status !== 'in-stock').length
  }

  getWinRate(): number {
    const leads = this.read<Lead>('leads')
    const closed = leads.filter(l => l.stage === 'closed-won' || l.stage === 'closed-lost')
    if (closed.length === 0) return 0
    return closed.filter(l => l.stage === 'closed-won').length / closed.length
  }

  getUnreadEmailCount(): number {
    return this.read<Email>('emails').filter(e => !e.isRead).length
  }

  getCriticalEmailCount(): number {
    return this.read<Email>('emails').filter(e => e.priority === 'critical').length
  }

  getAggregatedStats() {
    const leads = this.read<Lead>('leads')
    const transactions = this.read<Transaction>('transactions')
    const inventory = this.read<InventoryItem>('inventory')
    const emails = this.read<Email>('emails')
    const employees = this.read<Employee>('employees')
    const projects = this.read<Project>('projects')
    const customers = this.read<Customer>('customers')

    const closedWon = leads.filter(l => l.stage === 'closed-won')
    const closedLeads = leads.filter(l => l.stage === 'closed-won' || l.stage === 'closed-lost')
    const winRate = closedLeads.length > 0 ? closedWon.length / closedLeads.length : 0

    const totalRevenue = transactions
      .filter(t => t.type === 'sale' && t.status === 'completed')
      .reduce((s, t) => s + t.amount, 0)

    const pipelineValue = leads
      .filter(l => l.stage !== 'closed-lost')
      .reduce((s, l) => s + l.value, 0)

    return {
      crm: {
        totalPipeline: pipelineValue,
        leadCount: leads.length,
        winRate,
        avgDealSize: leads.length > 0 ? leads.reduce((s, l) => s + l.value, 0) / leads.length : 0,
        closedWonCount: closedWon.length,
        customerCount: customers.length,
      },
      erp: {
        totalRevenue,
        inventoryValue: this.getInventoryValue(),
        lowStockCount: inventory.filter(i => i.status !== 'in-stock').length,
        employeeCount: employees.filter(e => e.status === 'active').length,
        activeProjects: projects.filter(p => p.status === 'in-progress').length,
        totalAssets: this.read<FinancialAccount>('financialAccounts')
          .filter(a => a.type === 'Asset')
          .reduce((s, a) => s + a.balance, 0),
      },
      analytics: {
        totalRevenue,
        transactionCount: transactions.length,
        datasetCount: this.read<Dataset>('datasets').length,
      },
      email: {
        totalEmails: emails.length,
        unreadCount: emails.filter(e => !e.isRead).length,
        criticalCount: emails.filter(e => e.priority === 'critical').length,
        starredCount: emails.filter(e => e.isStarred).length,
      },
    }
  }

  // ── Event subscription ──────────────────────────────────────

  subscribe(fn: Listener): () => void {
    return bus.subscribe(fn)
  }

  // ── Reset ────────────────────────────────────────────────────

  reset(): void {
    const keys: CollectionKey[] = [
      'customers', 'contacts', 'leads', 'employees', 'products',
      'inventory', 'suppliers', 'transactions', 'financialAccounts',
      'projects', 'emails', 'datasets', 'activities', 'kpis',
    ]
    keys.forEach(k => localStorage.removeItem(STORAGE_PREFIX + k))
    this.seedIfEmpty()
    keys.forEach(k => bus.emit(k))
  }

  // ═══════════════════════════════════════════════════════════════
  // SEED
  // ═══════════════════════════════════════════════════════════════

  private seedIfEmpty(): void {
    if (localStorage.getItem(STORAGE_PREFIX + 'customers')) return

    this.write('customers', SEED_CUSTOMERS)
    this.write('contacts', SEED_CONTACTS)
    this.write('leads', SEED_LEADS)
    this.write('employees', SEED_EMPLOYEES)
    this.write('products', SEED_PRODUCTS)
    this.write('inventory', SEED_INVENTORY)
    this.write('suppliers', SEED_SUPPLIERS)
    this.write('transactions', SEED_TRANSACTIONS)
    this.write('financialAccounts', SEED_FINANCIAL_ACCOUNTS)
    this.write('projects', SEED_PROJECTS)
    this.write('emails', SEED_EMAILS)
    this.write('datasets', SEED_DATASETS)
    this.write('activities', SEED_ACTIVITIES)
    this.write('kpis', SEED_KPIS)
  }
}

// Singleton export
const db = RadonDatabase.getInstance()
export default db
