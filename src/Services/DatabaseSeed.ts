/**
 * Seed data for the Radon unified database.
 * All entities are cross-referenced by ID for seamless integration.
 */

import type {
  Customer, Contact, Lead, Employee, Product, InventoryItem,
  Supplier, Transaction, FinancialAccount, Project, Email,
  Dataset, Activity, KPI
} from './DatabaseTypes'

export const SEED_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Acme Corporation', industry: 'Technology', size: 'Enterprise', website: 'acme.com', region: 'North', createdAt: '2024-01-15' },
  { id: 'cust-2', name: 'Global Industries', industry: 'Manufacturing', size: 'Mid-Market', website: 'global.com', region: 'South', createdAt: '2024-01-12' },
  { id: 'cust-3', name: 'Tech Solutions Inc', industry: 'Software', size: 'Enterprise', website: 'techsolutions.com', region: 'East', createdAt: '2024-01-10' },
  { id: 'cust-4', name: 'Innovation Labs', industry: 'Healthcare', size: 'Small', website: 'innovation.com', region: 'West', createdAt: '2024-01-08' },
  { id: 'cust-5', name: 'Enterprise Systems', industry: 'Finance', size: 'Enterprise', website: 'enterprise.com', region: 'North', createdAt: '2024-01-05' },
]

export const SEED_CONTACTS: Contact[] = [
  { id: 'con-1', customerId: 'cust-1', name: 'Sarah Johnson', email: 'sarah@acme.com', phone: '555-0123', role: 'VP Engineering', avatar: 'SJ' },
  { id: 'con-2', customerId: 'cust-2', name: 'Mike Wilson', email: 'mike@global.com', phone: '555-0124', role: 'Procurement Lead', avatar: 'MW' },
  { id: 'con-3', customerId: 'cust-3', name: 'Lisa Chen', email: 'lisa@techsolutions.com', phone: '555-0125', role: 'CTO', avatar: 'LC' },
  { id: 'con-4', customerId: 'cust-4', name: 'Tom Davis', email: 'tom@innovation.com', phone: '555-0126', role: 'Research Director', avatar: 'TD' },
  { id: 'con-5', customerId: 'cust-5', name: 'Rachel Green', email: 'rachel@enterprise.com', phone: '555-0127', role: 'CFO', avatar: 'RG' },
  { id: 'con-6', customerId: 'cust-1', name: 'James Park', email: 'james@acme.com', phone: '555-0128', role: 'Product Manager', avatar: 'JP' },
]

export const SEED_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'John Smith', department: 'Sales', position: 'Senior Account Executive', salary: 95000, status: 'active', hireDate: '2022-03-15', managerId: 'emp-2', performance: 4.5, email: 'john.smith@radon.io', avatar: 'JS' },
  { id: 'emp-2', name: 'Jane Doe', department: 'Sales', position: 'Sales Manager', salary: 125000, status: 'active', hireDate: '2021-01-10', managerId: 'emp-3', performance: 4.8, email: 'jane.doe@radon.io', avatar: 'JD' },
  { id: 'emp-3', name: 'Mike Wilson', department: 'Operations', position: 'Operations Director', salary: 145000, status: 'active', hireDate: '2020-06-01', managerId: null, performance: 4.6, email: 'mike.wilson@radon.io', avatar: 'MW' },
  { id: 'emp-4', name: 'Emily Chen', department: 'Finance', position: 'Financial Analyst', salary: 75000, status: 'active', hireDate: '2023-01-20', managerId: 'emp-5', performance: 4.2, email: 'emily.chen@radon.io', avatar: 'EC' },
  { id: 'emp-5', name: 'David Brown', department: 'Finance', position: 'Finance Manager', salary: 110000, status: 'active', hireDate: '2021-09-15', managerId: null, performance: 4.7, email: 'david.brown@radon.io', avatar: 'DB' },
]

export const SEED_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'TechCorp Inc', category: 'Electronics', leadTime: '5 days', rating: 4.5 },
  { id: 'sup-2', name: 'FurniturePlus', category: 'Furniture', leadTime: '10 days', rating: 3.8 },
  { id: 'sup-3', name: 'DisplayTech', category: 'Electronics', leadTime: '7 days', rating: 4.2 },
]

export const SEED_PRODUCTS: Product[] = [
  { id: 'prod-1', sku: 'PROD-001', name: 'Laptop Computer Model X', category: 'Electronics', unitCost: 899, unitPrice: 1299, supplierId: 'sup-1', supplierName: 'TechCorp Inc' },
  { id: 'prod-2', sku: 'PROD-002', name: 'Office Chair Ergonomic', category: 'Furniture', unitCost: 299, unitPrice: 499, supplierId: 'sup-2', supplierName: 'FurniturePlus' },
  { id: 'prod-3', sku: 'PROD-003', name: 'Wireless Mouse', category: 'Electronics', unitCost: 45, unitPrice: 79, supplierId: 'sup-1', supplierName: 'TechCorp Inc' },
  { id: 'prod-4', sku: 'PROD-004', name: 'Standing Desk', category: 'Furniture', unitCost: 599, unitPrice: 899, supplierId: 'sup-2', supplierName: 'FurniturePlus' },
  { id: 'prod-5', sku: 'PROD-005', name: 'Monitor 27" 4K', category: 'Electronics', unitCost: 449, unitPrice: 699, supplierId: 'sup-3', supplierName: 'DisplayTech' },
]

export const SEED_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', productId: 'prod-1', quantity: 245, reorderPoint: 50, location: 'Warehouse A', status: 'in-stock' },
  { id: 'inv-2', productId: 'prod-2', quantity: 89, reorderPoint: 100, location: 'Warehouse B', status: 'low-stock' },
  { id: 'inv-3', productId: 'prod-3', quantity: 567, reorderPoint: 200, location: 'Warehouse A', status: 'in-stock' },
  { id: 'inv-4', productId: 'prod-4', quantity: 12, reorderPoint: 25, location: 'Warehouse C', status: 'critical' },
  { id: 'inv-5', productId: 'prod-5', quantity: 156, reorderPoint: 75, location: 'Warehouse A', status: 'in-stock' },
]

export const SEED_LEADS: Lead[] = [
  { id: 'lead-1', customerId: 'cust-1', contactId: 'con-1', value: 125000, stage: 'qualification', probability: 25, ownerId: 'emp-1', createdAt: '2024-01-15', notes: 'Great initial conversation' },
  { id: 'lead-2', customerId: 'cust-2', contactId: 'con-2', value: 85000, stage: 'proposal', probability: 75, ownerId: 'emp-2', createdAt: '2024-01-12', notes: 'Custom pricing proposal sent' },
  { id: 'lead-3', customerId: 'cust-3', contactId: 'con-3', value: 240000, stage: 'negotiation', probability: 90, ownerId: 'emp-1', createdAt: '2024-01-10', notes: 'Product demo went well' },
  { id: 'lead-4', customerId: 'cust-4', contactId: 'con-4', value: 45000, stage: 'discovery', probability: 15, ownerId: 'emp-1', createdAt: '2024-01-08', notes: 'Early stage evaluation' },
  { id: 'lead-5', customerId: 'cust-5', contactId: 'con-5', value: 180000, stage: 'closed-won', probability: 100, ownerId: 'emp-2', createdAt: '2024-01-05', notes: 'Deal closed successfully' },
]

export const SEED_TRANSACTIONS: Transaction[] = [
  { id: 'txn-1', customerId: 'cust-5', productId: 'prod-1', type: 'sale', amount: 129900, date: '2024-01-20', category: 'Electronics', department: 'Sales', status: 'completed', description: 'Enterprise laptop order — 100 units' },
  { id: 'txn-2', customerId: 'cust-1', productId: 'prod-5', type: 'sale', amount: 69900, date: '2024-01-19', category: 'Electronics', department: 'Sales', status: 'completed', description: 'Monitor order — 100 units' },
  { id: 'txn-3', customerId: 'cust-3', productId: 'prod-2', type: 'sale', amount: 49900, date: '2024-01-18', category: 'Furniture', department: 'Sales', status: 'completed', description: 'Office chair order — 100 units' },
  { id: 'txn-4', customerId: '', productId: 'prod-1', type: 'purchase', amount: 89900, date: '2024-01-17', category: 'Electronics', department: 'Procurement', status: 'completed', description: 'Restock laptops from TechCorp' },
  { id: 'txn-5', customerId: 'cust-2', productId: 'prod-4', type: 'sale', amount: 89900, date: '2024-01-16', category: 'Furniture', department: 'Sales', status: 'pending', description: 'Standing desk order — 100 units' },
  { id: 'txn-6', customerId: '', productId: '', type: 'expense', amount: 125000, date: '2024-01-15', category: 'Payroll', department: 'Finance', status: 'completed', description: 'Monthly salary payments' },
  { id: 'txn-7', customerId: 'cust-5', productId: 'prod-3', type: 'sale', amount: 7900, date: '2024-01-14', category: 'Electronics', department: 'Sales', status: 'completed', description: 'Wireless mouse order — 100 units' },
  { id: 'txn-8', customerId: '', productId: '', type: 'expense', amount: 4847, date: '2024-03-01', category: 'Cloud', department: 'Engineering', status: 'completed', description: 'AWS monthly bill — March 2026' },
]

export const SEED_FINANCIAL_ACCOUNTS: FinancialAccount[] = [
  { id: 'fin-1', account: 'Accounts Receivable', type: 'Asset', balance: 1450000, change: 5.2, trend: 'up', department: 'Sales' },
  { id: 'fin-2', account: 'Accounts Payable', type: 'Liability', balance: 890000, change: -2.1, trend: 'down', department: 'Procurement' },
  { id: 'fin-3', account: 'Cash & Equivalents', type: 'Asset', balance: 2340000, change: 12.4, trend: 'up', department: 'Finance' },
  { id: 'fin-4', account: 'Inventory', type: 'Asset', balance: 845000, change: 3.8, trend: 'up', department: 'Operations' },
  { id: 'fin-5', account: 'Revenue', type: 'Revenue', balance: 6780000, change: 18.5, trend: 'up', department: 'Sales' },
]

export const SEED_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'ERP System Upgrade', status: 'in-progress', progress: 65, budget: 250000, spent: 162500, managerId: 'emp-2', startDate: '2024-01-01', endDate: '2024-06-30', teamSize: 8 },
  { id: 'proj-2', name: 'Website Redesign', status: 'planning', progress: 15, budget: 75000, spent: 11250, managerId: 'emp-3', startDate: '2024-02-01', endDate: '2024-04-30', teamSize: 4 },
  { id: 'proj-3', name: 'Mobile App Development', status: 'in-progress', progress: 40, budget: 180000, spent: 72000, managerId: 'emp-1', startDate: '2024-01-15', endDate: '2024-05-15', teamSize: 6 },
  { id: 'proj-4', name: 'Cloud Migration', status: 'completed', progress: 100, budget: 320000, spent: 298000, managerId: 'emp-2', startDate: '2023-09-01', endDate: '2023-12-31', teamSize: 10 },
]

export const SEED_EMAILS: Email[] = [
  {
    id: 'e001', fromName: 'Sarah Johnson', fromEmail: 'sarah@acme.com', fromAvatar: 'SJ',
    to: 'john.smith@radon.io', subject: 'Q2 Product Roadmap Review — Action Required',
    preview: 'Hi team, I wanted to loop everyone in on the Q2 roadmap changes...',
    body: 'Hi team,\n\nI wanted to loop everyone in on the Q2 roadmap changes following our board meeting last week. Key changes:\n1. AI feature suite launch moved from June to April 30th\n2. Mobile app redesign is now P0\n3. Analytics dashboard overhaul by May 15th\n\nAction items:\n• Review the updated PRD document by Friday EOD\n• Schedule a 1:1 with your team leads\n• Update your sprint planning',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    category: 'primary', labels: ['work', 'urgent', 'action-required'], priority: 'critical',
    isRead: false, isStarred: true, hasAttachments: true,
    attachments: [{ name: 'Q2_Roadmap_v3.pdf', size: '2.4 MB' }],
    sentiment: 'neutral',
    aiSummary: 'VP of Product requesting review of Q2 roadmap changes. Action required: review PRD by Friday, schedule 1:1s, update sprint plans.',
    actionItems: ['Review PRD document by Friday EOD', 'Schedule 1:1 with team leads', 'Confirm Thursday 2 PM call'],
    suggestedReplies: [
      'Thanks Sarah! Confirming Thursday 2 PM works for me. Will have PRD feedback by Thursday morning.',
      'Hi Sarah, noted on the changes. Thursday at 2 PM works. I have concerns about the April 30th timeline.'
    ],
    contactId: 'con-1', customerId: 'cust-1', threadId: 'e001'
  },
  {
    id: 'e002', fromName: 'GitHub', fromEmail: 'noreply@github.com', fromAvatar: 'GH',
    to: 'john.smith@radon.io', subject: '[radon-platform] Pull request #47 merged',
    preview: 'Pull request #47 by @devraj has been merged into main.',
    body: 'Pull request #47 has been successfully merged into the main branch.\n\nRepository: radon-platform\nBranch: feature/integration → main\n\nChanges: +1,204 lines added, -89 lines removed, 12 files changed',
    timestamp: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    category: 'updates', labels: ['github', 'dev'], priority: 'low',
    isRead: true, isStarred: false, hasAttachments: false, attachments: [],
    sentiment: 'positive',
    aiSummary: 'PR #47 merged into main — adds integration support with 1,204 new lines.',
    actionItems: [], suggestedReplies: [],
    contactId: null, customerId: null, threadId: 'e002'
  },
  {
    id: 'e003', fromName: 'Mike Wilson', fromEmail: 'mike@global.com', fromAvatar: 'MW',
    to: 'john.smith@radon.io', subject: 'URGENT: Production system down — need immediate help',
    preview: 'Our entire production environment went down 20 minutes ago...',
    body: 'Hi,\n\nOur entire production environment went down approximately 20 minutes ago. Users cannot access the platform.\n\nError: "Connection refused: Database cluster unreachable"\n\nThis is a Sev-1 incident. We have SLA obligations requiring 99.9% uptime.\n\nPlease respond ASAP.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    category: 'primary', labels: ['work', 'urgent', 'sev1'], priority: 'critical',
    isRead: false, isStarred: true, hasAttachments: false, attachments: [],
    sentiment: 'negative',
    aiSummary: 'Sev-1 incident: production system down. Database cluster unreachable. Requires immediate response.',
    actionItems: ['Respond to Mike Wilson ASAP', 'Check database cluster status', 'Initiate incident response protocol'],
    suggestedReplies: [
      'On it — I\'m pulling up the cluster status now. Will have an update in 5 minutes.',
      'Mike, I\'m escalating this to the on-call team immediately. Stand by for a bridge call.'
    ],
    contactId: 'con-2', customerId: 'cust-2', threadId: 'e003'
  },
  {
    id: 'e004', fromName: 'Lisa Chen', fromEmail: 'lisa@techsolutions.com', fromAvatar: 'LC',
    to: 'john.smith@radon.io', subject: 'Re: Proposal for AI Integration Platform',
    preview: 'Thanks for the detailed proposal. Our team has reviewed it and we have a few questions...',
    body: 'Thanks for the detailed proposal. Our team has reviewed it and we have a few questions:\n\n1. Can you provide more details on the ML pipeline architecture?\n2. What\'s the expected latency for real-time inference?\n3. How does the pricing scale with usage?\n\nWe\'d like to schedule a technical deep-dive this week if possible.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    category: 'primary', labels: ['work', 'proposal'], priority: 'high',
    isRead: false, isStarred: false, hasAttachments: true,
    attachments: [{ name: 'Technical_Questions.pdf', size: '1.8 MB' }],
    sentiment: 'positive',
    aiSummary: 'Tech Solutions CTO responding to proposal with 3 technical questions. Wants to schedule a deep-dive this week.',
    actionItems: ['Prepare ML architecture details', 'Document latency benchmarks', 'Update pricing model', 'Schedule technical deep-dive'],
    suggestedReplies: [
      'Hi Lisa, great questions! I\'ll prepare a detailed technical doc and we can discuss on a call. How does Thursday at 3 PM work?',
    ],
    contactId: 'con-3', customerId: 'cust-3', threadId: 'e004'
  },
  {
    id: 'e005', fromName: 'Rachel Green', fromEmail: 'rachel@enterprise.com', fromAvatar: 'RG',
    to: 'john.smith@radon.io', subject: 'Contract Renewal — Q2 2024',
    preview: 'I wanted to discuss the contract renewal for Q2. Our current agreement expires March 31st...',
    body: 'I wanted to discuss the contract renewal for Q2. Our current agreement expires March 31st.\n\nWe\'ve been very happy with the platform and would like to:\n1. Renew for another year\n2. Add the analytics module\n3. Increase user seats from 50 to 75\n\nCan we set up a call this week to finalize?',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    category: 'primary', labels: ['work', 'renewal'], priority: 'high',
    isRead: true, isStarred: true, hasAttachments: false, attachments: [],
    sentiment: 'positive',
    aiSummary: 'Enterprise Systems CFO wants to renew contract, add analytics module, and increase seats. Requesting call this week.',
    actionItems: ['Prepare renewal proposal with analytics pricing', 'Confirm seat expansion pricing', 'Schedule renewal call'],
    suggestedReplies: [
      'Hi Rachel, great to hear! I\'ll prepare a renewal proposal including the analytics module and expanded seats. How about Wednesday at 2 PM?',
    ],
    contactId: 'con-5', customerId: 'cust-5', threadId: 'e005'
  },
  {
    id: 'e006', fromName: 'LinkedIn', fromEmail: 'notifications@linkedin.com', fromAvatar: 'LI',
    to: 'john.smith@radon.io', subject: 'You have 5 new connection requests',
    preview: 'Alex Torres, Priya Nair, and 3 others want to connect with you.',
    body: 'You have 5 new connection requests on LinkedIn.\n\n• Alex Torres — Engineering Manager at Radon\n• Priya Nair — Senior Developer at Radon\n• And 3 others...',
    timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    category: 'social', labels: ['social', 'linkedin'], priority: 'low',
    isRead: true, isStarred: false, hasAttachments: false, attachments: [],
    sentiment: 'neutral',
    aiSummary: '5 new LinkedIn connection requests, including 2 from Radon colleagues.',
    actionItems: [], suggestedReplies: [],
    contactId: null, customerId: null, threadId: 'e006'
  },
]

export const SEED_DATASETS: Dataset[] = [
  { id: 'ds-1', name: 'Sales Data 2024', rows: 15420, columns: 12, size: '2.4 MB', lastModified: '2024-03-15', type: 'Excel', tables: ['Sales', 'Products', 'Customers', 'Regions'], source: 'ERP Transactions' },
  { id: 'ds-2', name: 'Financial Metrics', rows: 8920, columns: 8, size: '1.1 MB', lastModified: '2024-03-14', type: 'CSV', tables: ['Revenue', 'Expenses', 'Profit'], source: 'ERP Financial Accounts' },
  { id: 'ds-3', name: 'Customer Analytics', rows: 25680, columns: 15, size: '3.8 MB', lastModified: '2024-03-13', type: 'Database', tables: ['Customers', 'Orders', 'Segments'], source: 'CRM + Email Engine' },
  { id: 'ds-4', name: 'Email Engagement', rows: 12450, columns: 10, size: '1.9 MB', lastModified: '2024-03-12', type: 'API', tables: ['Emails', 'Responses', 'Sentiment'], source: 'Email Engine' },
]

export const SEED_ACTIVITIES: Activity[] = [
  { id: 'act-1', type: 'call', title: 'Initial discovery call with Acme Corp', leadId: 'lead-1', contactId: 'con-1', date: '2024-01-15', time: '10:00 AM', duration: '45 min', notes: 'Discussed their tech stack and pain points', ownerId: 'emp-1' },
  { id: 'act-2', type: 'email', title: 'Sent proposal to Global Industries', leadId: 'lead-2', contactId: 'con-2', date: '2024-01-14', time: '2:30 PM', duration: '15 min', notes: 'Custom pricing proposal with volume discounts', ownerId: 'emp-2' },
  { id: 'act-3', type: 'meeting', title: 'Product demo for Tech Solutions', leadId: 'lead-3', contactId: 'con-3', date: '2024-01-13', time: '11:00 AM', duration: '90 min', notes: 'Full platform demo, technical team was impressed', ownerId: 'emp-1' },
  { id: 'act-4', type: 'task', title: 'Follow up on Innovation Labs inquiry', leadId: 'lead-4', contactId: 'con-4', date: '2024-01-12', time: '9:00 AM', duration: '30 min', notes: 'Send additional case studies and ROI data', ownerId: 'emp-1' },
  { id: 'act-5', type: 'note', title: 'Enterprise Systems deal closed', leadId: 'lead-5', contactId: 'con-5', date: '2024-01-05', time: '4:00 PM', duration: '10 min', notes: 'Contract signed, handoff to customer success team', ownerId: 'emp-2' },
]

export const SEED_KPIS: KPI[] = [
  { id: 'kpi-crm-1', module: 'crm', label: 'Pipeline Value', value: '$675K', change: '+12.5%', trend: 'up' },
  { id: 'kpi-crm-2', module: 'crm', label: 'Win Rate', value: '20%', change: '+5%', trend: 'up' },
  { id: 'kpi-crm-3', module: 'crm', label: 'Avg Deal Size', value: '$135K', change: '-2.1%', trend: 'down' },
  { id: 'kpi-erp-1', module: 'erp', label: 'Total Revenue', value: '$6.78M', change: '+18.5%', trend: 'up' },
  { id: 'kpi-erp-2', module: 'erp', label: 'Inventory Value', value: '$845K', change: '+3.8%', trend: 'up' },
  { id: 'kpi-erp-3', module: 'erp', label: 'Active Projects', value: '2', change: '+1', trend: 'up' },
  { id: 'kpi-analytics-1', module: 'analytics', label: 'Datasets', value: '4', change: '+1', trend: 'up' },
  { id: 'kpi-analytics-2', module: 'analytics', label: 'Total Rows', value: '62.5K', change: '+15%', trend: 'up' },
  { id: 'kpi-email-1', module: 'email', label: 'Unread', value: '3', change: '-2', trend: 'down' },
  { id: 'kpi-email-2', module: 'email', label: 'Critical', value: '2', change: '+1', trend: 'up' },
]
