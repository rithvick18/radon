import { useState, useEffect, useRef } from 'react'
import { SiteFooter, MinimalNav } from './Components'

/* ========================================
   RADON AI AGENT - COMPREHENSIVE APP AWARENESS
   ======================================== */
export function AIAgentSection({ onNavigate, onLogout }: { onNavigate?: any, onLogout?: any }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm your Radon AI Assistant. I have complete knowledge of the entire Radon Intelligence platform including:\n\n**Core Modules:**\n- **NeoGuard**: Advanced security monitoring and threat detection\n- **Email Intelligence**: Smart email management and analytics\n- **Analytics**: AI-powered chart generation and data visualization\n- **CRM**: Salesforce-style customer relationship management\n- **ERP**: Dynamics 365-style enterprise resource planning\n\n**Key Features:**\n- Real-time data visualization with Plotly.js\n- AI chart generation from prompts and CSV/XLSX files\n- Comprehensive business intelligence dashboards\n- Interactive KPI tracking and metrics\n- Supply chain and inventory management\n- Financial management and reporting\n- Human resources and project management\n\nHow can I help you navigate and utilize these features today?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const knowledgeBase = {
    'navigation': {
      'main': 'The main landing page with navigation to all modules',
      'neoguard': 'Advanced security monitoring with threat detection, vulnerability scanning, and security analytics',
      'email': 'Email intelligence system with spam filtering, analytics, and smart categorization',
      'analytics': 'Data analytics platform with AI chart generation, CSV/XLSX upload, and interactive visualizations',
      'crm': 'Customer relationship management with lead tracking, opportunity management, and sales analytics',
      'erp': 'Enterprise resource planning with financial management, inventory control, HR, and manufacturing'
    },
    'features': {
      'ai-chart-gen': 'Generate charts from natural language prompts and uploaded CSV/XLSX files in the Analytics module',
      'dashboard-kpis': 'Interactive KPI cards with trend indicators across all modules',
      'data-tables': 'Sortable, filterable data tables with search functionality',
      'real-time-updates': 'Live data updates and real-time monitoring capabilities',
      'export-functionality': 'Export charts and reports in multiple formats',
      'sidebar-navigation': 'Professional sidebar navigation in CRM and ERP modules',
      'detail-views': 'Click-to-view detailed information in sliding sidebars',
      'status-indicators': 'Color-coded status badges and progress indicators'
    },
    'modules': {
      'neoguard': {
        description: 'Security monitoring and threat detection platform',
        features: ['Real-time threat monitoring', 'Vulnerability scanning', 'Security analytics', 'Incident response'],
        capabilities: 'Monitors system security, detects threats, and provides security insights'
      },
      'email': {
        description: 'Email intelligence and management system',
        features: ['Smart email categorization', 'Spam filtering', 'Email analytics', 'Automated responses'],
        capabilities: 'Manages email communications with AI-powered insights and automation'
      },
      'analytics': {
        description: 'Data analytics and visualization platform',
        features: ['AI chart generation', 'CSV/XLSX upload', 'Interactive dashboards', 'Data export'],
        capabilities: 'Transforms data into insights with AI-powered chart generation and visualization'
      },
      'crm': {
        description: 'Customer relationship management system',
        features: ['Lead management', 'Opportunity tracking', 'Sales analytics', 'Customer insights'],
        capabilities: 'Manages customer relationships and sales processes with comprehensive analytics'
      },
      'erp': {
        description: 'Enterprise resource planning system',
        features: ['Financial management', 'Inventory control', 'Supply chain', 'HR management', 'Manufacturing'],
        capabilities: 'Comprehensive business management with integrated modules for all enterprise functions'
      }
    },
    'technical': {
      'technologies': ['React', 'TypeScript', 'Plotly.js', 'TailwindCSS', 'Node.js'],
      'charts': ['Bar charts', 'Line charts', 'Pie charts', 'Scatter plots', 'Area charts', 'Gauge charts', 'Polar charts'],
      'data-formats': ['CSV', 'XLSX', 'JSON'],
      'ui-components': ['KPI cards', 'Data tables', 'Charts', 'Forms', 'Sidebars', 'Navigation']
    },
    'workflows': {
      'data-analysis': 'Upload CSV/XLSX files in Analytics module, use AI Chart Generator with natural language prompts',
      'customer-management': 'Navigate to CRM module, manage leads, track opportunities, view sales analytics',
      'business-operations': 'Use ERP module for financial management, inventory control, HR, and manufacturing operations',
      'security-monitoring': 'NeoGuard module provides real-time security monitoring and threat detection'
    }
  }

  const generateResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Navigation queries
    if (lowerMessage.includes('navigate') || lowerMessage.includes('go to') || lowerMessage.includes('how to')) {
      for (const [key, value] of Object.entries(knowledgeBase.navigation)) {
        if (lowerMessage.includes(key)) {
          return `To access ${value}, use the navigation bar at the top of the page and click on the "${key.charAt(0).toUpperCase() + key.slice(1)}" link.`
        }
      }
    }
    
    // Feature-specific queries
    if (lowerMessage.includes('chart') || lowerMessage.includes('graph') || lowerMessage.includes('visualization')) {
      return `For chart generation and data visualization:\n\n1. Navigate to the **Analytics** module\n2. Click on the **AI CHART GEN** tab\n3. Upload your CSV or XLSX file\n4. Enter a natural language prompt (e.g., "bar chart of sales by region")\n5. Customize title and colors if desired\n6. Click **Generate Chart**\n\nThe AI will automatically detect the best chart type based on your data and prompt. You can also export charts in PNG, SVG, or PDF formats.`
    }
    
    if (lowerMessage.includes('crm') || lowerMessage.includes('customer') || lowerMessage.includes('lead')) {
      return `The **CRM** module provides comprehensive customer relationship management:\n\n**Key Features:**\n- Dashboard with sales KPIs and pipeline visualization\n- Lead and opportunity management with probability tracking\n- Contact and account management\n- Activity timeline and task management\n- Sales analytics and reporting\n\n**How to Use:**\n1. Navigate to the CRM module\n2. Use the sidebar to switch between Dashboard, Leads, Contacts, Accounts, Activities, and Reports\n3. Click on any item to view detailed information in the sidebar\n4. Use search and filter functionality to find specific records\n\nThe CRM provides a Salesforce-style interface with comprehensive sales and customer management capabilities.`
    }
    
    if (lowerMessage.includes('erp') || lowerMessage.includes('enterprise') || lowerMessage.includes('resource')) {
      return `The **ERP** module is a comprehensive enterprise resource planning system:\n\n**Modules Available:**\n- **Dashboard**: Overview of all business metrics\n- **Financial Management**: Assets, liabilities, cash flow, profit margins\n- **Inventory Management**: Stock tracking, alerts, supplier management\n- **Supply Chain**: Shipment tracking, vendor performance\n- **Human Resources**: Employee management, performance tracking\n- **Project Management**: Project portfolio, budget tracking\n- **Manufacturing**: Production monitoring, quality control\n- **Reports & Analytics**: Comprehensive business intelligence\n\n**Key Features:**\n- Real-time KPI tracking with trend indicators\n- Interactive data tables with search and filtering\n- Detailed item views with action buttons\n- Comprehensive reporting and analytics\n- Professional Dynamics 365-style interface`
    }
    
    if (lowerMessage.includes('neo') || lowerMessage.includes('security') || lowerMessage.includes('threat')) {
      return `**NeoGuard** is the advanced security monitoring module:\n\n**Capabilities:**\n- Real-time threat detection and monitoring\n- Vulnerability scanning and assessment\n- Security analytics and reporting\n- Incident response coordination\n- System security posture analysis\n\n**Features:**\n- Live security dashboard with threat indicators\n- Automated vulnerability scanning\n- Security incident logging and tracking\n- Risk assessment and mitigation recommendations\n\nNeoGuard provides comprehensive security monitoring to protect your digital assets and infrastructure.`
    }
    
    if (lowerMessage.includes('email') || lowerMessage.includes('mail') || lowerMessage.includes('communication')) {
      return `The **Email** module provides intelligent email management:\n\n**Features:**\n- AI-powered email categorization and prioritization\n- Advanced spam filtering and threat detection\n- Email analytics and engagement metrics\n- Automated response suggestions\n- Smart inbox organization\n\n**Capabilities:**\n- Natural language processing for email understanding\n- Attachment analysis and security scanning\n- Communication pattern analysis\n- Integration with calendar and task management\n\nThe Email module helps you manage communications efficiently with AI-powered insights and automation.`
    }
    
    if (lowerMessage.includes('data') || lowerMessage.includes('upload') || lowerMessage.includes('file')) {
      return `For data upload and analysis:\n\n**Supported Formats:**\n- CSV files with headers\n- XLSX/XLS Excel files\n- JSON data structures\n\n**How to Upload:**\n1. Navigate to the **Analytics** module\n2. Click on the **AI CHART GEN** tab\n3. Use the file upload button to select your data\n4. The system will automatically parse and preview your data\n5. Enter a natural language prompt to generate visualizations\n\n**Data Requirements:**\n- Files should have clear column headers\n- Numeric data for quantitative analysis\n- Consistent formatting throughout the file\n- Maximum file size: 10MB\n\nThe AI will analyze your data structure and suggest appropriate visualizations based on the content.`
    }
    
    if (lowerMessage.includes('export') || lowerMessage.includes('download') || lowerMessage.includes('save')) {
      return `Export options are available throughout the platform:\n\n**Analytics Module:**\n- Export charts as PNG, SVG, or PDF\n- Download processed data in CSV format\n- Generate comprehensive reports\n\n**CRM Module:**\n- Export lead and contact lists\n- Download sales reports\n- Export activity logs\n\n**ERP Module:**\n- Financial reports in multiple formats\n- Inventory and supply chain data\n- HR and project management reports\n\n**How to Export:**\n1. Look for export buttons in each module\n2. Select your preferred format\n3. Choose date ranges and filters if applicable\n4. Click export to download your file\n\nAll exports maintain data integrity and include relevant metadata for traceability.`
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('guide') || lowerMessage.includes('tutorial')) {
      return `**Radon Intelligence Platform - Complete Guide**\n\n**Getting Started:**\n1. Use the top navigation bar to access any module\n2. Each module has its own sidebar navigation (CRM/ERP)\n3. Look for help icons and tooltips throughout the interface\n\n**Module Overview:**\n- **NeoGuard**: Security monitoring and threat detection\n- **Email**: Intelligent email management and analytics\n- **Analytics**: AI-powered data visualization and chart generation\n- **CRM**: Customer relationship management and sales tracking\n- **ERP**: Enterprise resource planning and business management\n\n**Key Features:**\n- AI-powered insights and automation\n- Real-time data visualization\n- Comprehensive reporting and analytics\n- Professional UI/UX design\n- Interactive dashboards and KPI tracking\n\n**Need Specific Help?**\nAsk me about any specific module, feature, or workflow, and I'll provide detailed guidance!`
    }
    
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('overview') || lowerMessage.includes('summary')) {
      return `Each module features a comprehensive dashboard:\n\n**Analytics Dashboard:**\n- Revenue and performance metrics\n- Interactive charts and visualizations\n- AI chart generation interface\n- Data upload and processing status\n\n**CRM Dashboard:**\n- Sales pipeline visualization\n- Lead conversion metrics\n- Revenue tracking and forecasts\n- Recent activities and tasks\n\n**ERP Dashboard:**\n- Business KPIs and financial metrics\n- Inventory and supply chain status\n- HR and project management overview\n- Manufacturing and production metrics\n\n**Dashboard Features:**\n- Real-time data updates\n- Interactive KPI cards with trends\n- Drill-down capabilities for detailed analysis\n- Customizable date ranges and filters\n- Export functionality for reports`
    }
    
    // Default response
    return `I understand you're asking about: "${userMessage}".\n\nBased on your query, I can help you with:\n\n**Available Modules:**\n- **NeoGuard**: Security monitoring and threat detection\n- **Email**: Intelligent email management\n- **Analytics**: AI-powered data visualization and chart generation\n- **CRM**: Customer relationship management\n- **ERP**: Enterprise resource planning\n\n**Common Tasks:**\n- Generate charts from data files\n- Navigate between modules\n- Export reports and data\n- Analyze business metrics\n- Manage customer relationships\n- Monitor security threats\n\nCould you be more specific about what you'd like to do? For example:\n- "How do I create a chart from my data?"\n- "Show me the CRM dashboard"\n- "What features does the ERP module have?"\n- "How do I monitor security threats?"`
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'assistant',
        content: generateResponse(inputMessage),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07071a', display: 'flex', flexDirection: 'column' }}>
      <MinimalNav onNavigate={onNavigate || (() => {})} onLogout={onLogout || (() => {})} active="ai-agent" />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: '#ffffff', 
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Radon AI Assistant
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Your comprehensive guide to the Radon Intelligence platform
          </p>
        </div>

        {/* Chat Container */}
        <div style={{
          flex: 1,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map(message => (
              <div key={message.id} style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}>
                <div style={{
                  background: message.type === 'user' 
                    ? 'linear-gradient(135deg, #60a5fa, #3b82f6)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: message.type === 'user' 
                    ? 'none' 
                    : '1px solid rgba(96, 165, 250, 0.2)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {message.content}
                  <div style={{
                    fontSize: '11px',
                    color: message.type === 'user' ? 'rgba(255, 255, 255, 0.7)' : '#64748b',
                    marginTop: '8px',
                    textAlign: 'right'
                  }}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', maxWidth: '80%' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(96, 165, 250, 0.2)',
                  fontSize: '14px'
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa', animation: 'bounce 1.4s infinite' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa', animation: 'bounce 1.4s infinite 0.2s' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa', animation: 'bounce 1.4s infinite 0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid rgba(96, 165, 250, 0.2)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about any feature, module, or workflow..."
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  resize: 'none',
                  minHeight: '50px',
                  maxHeight: '120px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                style={{
                  background: inputMessage.trim() && !isTyping 
                    ? 'linear-gradient(135deg, #60a5fa, #3b82f6)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease'
                }}
              >
                Send
              </button>
            </div>
            
            {/* Quick Actions */}
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                'How to generate charts?',
                'Show CRM features',
                'ERP overview',
                'Security monitoring',
                'Email management',
                'Export data'
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setInputMessage(suggestion)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(96, 165, 250, 0.2)',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    color: '#94a3b8',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)'
                    e.currentTarget.style.color = '#60a5fa'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.color = '#94a3b8'
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export function AIAgentPage({ onNavigate, onLogout }: any) {
  useEffect(() => { 
    document.querySelectorAll('.reveal').forEach((el: any) => el.classList.add('in')) 
  }, [onNavigate, onLogout])

  return (
    <div style={{ minHeight: '100vh', background: '#07071a', display: 'flex', flexDirection: 'column' }}>
      <AIAgentSection onNavigate={onNavigate} onLogout={onLogout} />
    </div>
  )
}
