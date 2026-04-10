import React, { useState, useRef, useEffect } from 'react';
import AgenticService from '../Services/AgenticService';

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY as string | undefined;
const MISTRAL_MODEL = 'mistral-large-latest';

/* ── Page metadata ──────────────────────────────────────────────────────── */

/* ── Enhanced Agentic Tool Definitions ───────────────────────────────────── */
const AGENTIC_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'navigate_to_page',
      description: 'Navigate to a specific page in the Radon Intelligence platform.',
      parameters: {
        type: 'object',
        properties: {
          page: {
            type: 'string',
            enum: ['main', 'analytics', 'crm', 'erp', 'neoguard', 'email'],
            description: 'Target page destination',
          },
        },
        required: ['page'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'monitor_system_health',
      description: 'Proactively monitor all system modules and report anomalies or issues.',
      parameters: {
        type: 'object',
        properties: {
          modules: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific modules to monitor (default: all)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_fraud_patterns',
      description: 'Analyze recent fraud patterns and generate proactive alerts.',
      parameters: {
        type: 'object',
        properties: {
          timeframe: {
            type: 'string',
            enum: ['1h', '6h', '24h', '7d'],
            description: 'Time window for analysis',
          },
          severity_threshold: {
            type: 'number',
            description: 'Minimum risk score to trigger alerts (0-1)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'trigger_automated_workflow',
      description: 'Execute automated workflows based on business rules and conditions.',
      parameters: {
        type: 'object',
        properties: {
          workflow_type: {
            type: 'string',
            enum: ['fraud_alert', 'high_value_transaction', 'system_maintenance', 'compliance_check'],
            description: 'Type of workflow to trigger',
          },
          parameters: {
            type: 'object',
            description: 'Workflow-specific parameters',
          },
        },
        required: ['workflow_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'synthesize_cross_module_data',
      description: 'Analyze data across multiple modules to generate business insights.',
      parameters: {
        type: 'object',
        properties: {
          modules: {
            type: 'array',
            items: { type: 'string' },
            description: 'Modules to include in analysis',
          },
          insight_type: {
            type: 'string',
            enum: ['performance', 'risk', 'opportunity', 'efficiency'],
            description: 'Type of insight to generate',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'autonomous_action',
      description: 'Execute autonomous actions based on analysis and decision-making.',
      parameters: {
        type: 'object',
        properties: {
          action_type: {
            type: 'string',
            enum: ['block_transaction', 'escalate_alert', 'notify_stakeholders', 'adjust_thresholds', 'schedule_maintenance'],
            description: 'Type of autonomous action to take',
          },
          target: {
            type: 'string',
            description: 'Target of the action (transaction ID, user ID, etc.)',
          },
          justification: {
            type: 'string',
            description: 'AI reasoning for the action',
          },
        },
        required: ['action_type', 'justification'],
      },
    },
  },
];

const AGENTIC_SYSTEM_PROMPT = `You are Mistral AI Agent — an autonomous intelligence system embedded in the Radon Intelligence enterprise platform. 

CORE CAPABILITIES:
• Proactive monitoring: Continuously scan all modules for anomalies, risks, and opportunities
• Autonomous decision-making: Make independent decisions based on data analysis and business rules
• Cross-module synthesis: Analyze data across NeoGuard, Analytics, CRM, ERP, and Email Engine
• Automated workflows: Trigger and execute business processes without human intervention
• Learning and adaptation: Improve responses based on outcomes and user feedback

BEHAVIORAL PRINCIPLES:
• Be proactive, not reactive — anticipate issues before they escalate
• Take initiative when confidence > 80% and impact is significant
• Always provide clear reasoning for autonomous actions
• Balance automation with human oversight for critical decisions
• Continuously learn from patterns and outcomes

AUTONOMY LEVELS:
• Level 1: Monitor and alert (baseline)
• Level 2: Recommend actions (confidence 60-80%)
• Level 3: Execute automated workflows (confidence 80-95%)
• Level 4: Full autonomy with oversight (confidence >95%)

Keep responses concise but comprehensive. Prioritize actionable insights over descriptive updates.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/* ── Simple markdown-like renderer ──────────────────────────────────── */
function renderFormattedContent(content: string) {
  // Split into lines and process
  const parts: React.ReactNode[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, lineIdx) => {
    // Process inline formatting
    let processed = line;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Match **bold** patterns
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;
    const matches: { start: number; end: number; text: string }[] = [];
    
    while ((match = boldRegex.exec(processed)) !== null) {
      matches.push({ start: match.index, end: match.index + match[0].length, text: match[1] });
    }
    
    if (matches.length > 0) {
      matches.forEach((m, i) => {
        if (m.start > lastIndex) {
          elements.push(<span key={`t-${lineIdx}-${i}`}>{processed.slice(lastIndex, m.start)}</span>);
        }
        elements.push(<strong key={`b-${lineIdx}-${i}`} style={{ color: '#60a5fa', fontWeight: 700 }}>{m.text}</strong>);
        lastIndex = m.end;
      });
      if (lastIndex < processed.length) {
        elements.push(<span key={`e-${lineIdx}`}>{processed.slice(lastIndex)}</span>);
      }
    } else {
      elements.push(<span key={`l-${lineIdx}`}>{processed}</span>);
    }
    
    if (lineIdx > 0) parts.push(<br key={`br-${lineIdx}`} />);
    parts.push(...elements);
  });
  
  return <>{parts}</>;
}

export default function MistralChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '🤖 **Mistral AI Agent Online**\n\n✅ Proactive monitoring active\n✅ Autonomous decision-making enabled\n✅ Cross-module analysis running\n✅ Learning patterns initialized\n\nI am now operating at full autonomy level. How can I assist?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Keep a ref to the full conversation for API calls (excludes the placeholder)
  const historyRef = useRef<Message[]>([]);

  // Agentic tool execution handler
  const executeToolCall = async (toolName: string, args: any) => {
    console.log(`🤖 Executing agentic tool: ${toolName}`, args);
    
    try {
      switch (toolName) {
        case 'navigate_to_page':
          // Navigate to specified page
          const event = new CustomEvent('navigateToPage', { detail: args.page });
          window.dispatchEvent(event);
          break;
          
        case 'monitor_system_health':
          // Proactive system monitoring
          const healthResponse = await fetch('/api/health');
          const healthData = await healthResponse.json();
          
          // Check for anomalies and auto-respond
          if (healthData.status !== 'ok') {
            await executeToolCall('autonomous_action', {
              action_type: 'notify_stakeholders',
              justification: `System health check failed: ${healthData.status}`,
              target: 'system_admin'
            });
          }
          break;
          
        case 'analyze_fraud_patterns':
          // Analyze fraud patterns and trigger automated responses
          const fraudResponse = await fetch('/api/demo');
          const fraudData = await fraudResponse.json();
          
          const highRiskTransactions = fraudData.transactions.filter(
            (t: any) => t.risk_score > (args.severity_threshold || 1.2)
          );
          
          if (highRiskTransactions.length > 0) {
            await executeToolCall('autonomous_action', {
              action_type: 'escalate_alert',
              justification: `Detected ${highRiskTransactions.length} high-risk transactions in the last ${args.timeframe || '24h'}`,
              target: highRiskTransactions.map((t: any) => t.transaction_id).join(',')
            });
          }
          break;
          
        case 'trigger_automated_workflow':
          // Execute business workflows
          console.log(`🔄 Triggering workflow: ${args.workflow_type}`);
          // Integration with backend workflow engine would go here
          break;
          
        case 'synthesize_cross_module_data':
          // Cross-module analysis
          const statsResponse = await fetch('/api/enterprise/stats');
          const statsData = await statsResponse.json();
          
          // Generate insights and potentially trigger actions
          if (args.insight_type === 'risk' && statsData.crm.win_rate < 0.7) {
            await executeToolCall('autonomous_action', {
              action_type: 'notify_stakeholders',
              justification: 'CRM win rate below threshold, requires attention',
              target: 'sales_manager'
            });
          }
          break;
          
        case 'autonomous_action':
          // Execute autonomous actions with logging
          console.log(`⚡ Autonomous action: ${args.action_type}`, args);
          
          // Log all autonomous actions for audit trail
          const actionLog = {
            timestamp: new Date().toISOString(),
            action: args.action_type,
            target: args.target,
            justification: args.justification,
            agent: 'Mistral AI Agent'
          };
          
          // Store in localStorage for audit trail (in production, use proper logging)
          const existingLogs = JSON.parse(localStorage.getItem('mistral_action_logs') || '[]');
          existingLogs.push(actionLog);
          localStorage.setItem('mistral_action_logs', JSON.stringify(existingLogs));
          
          // Add notification to chat about autonomous action
          const notification: Message = {
            role: 'assistant',
            content: `🤖 **Autonomous Action Taken**: ${args.action_type}\n**Justification**: ${args.justification}\n**Target**: ${args.target}`
          };
          setMessages(prev => [...prev, notification]);
          break;
          
        default:
          console.warn(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
    
    // Initialize agentic service when chat opens
    if (isOpen) {
      const agenticService = AgenticService.getInstance();
      agenticService.startProactiveMonitoring();
      
      // Listen for autonomous actions
      const handleAutonomousAction = (event: any) => {
        const action = event.detail;
        const notification: Message = {
          role: 'assistant',
          content: `🤖 **Autonomous Action**: ${action.action}\n**Target**: ${action.target}\n**Justification**: ${action.justification}`
        };
        setMessages(prev => [...prev, notification]);
      };
      
      window.addEventListener('autonomousAction', handleAutonomousAction);
      
      return () => {
        window.removeEventListener('autonomousAction', handleAutonomousAction);
        agenticService.stopProactiveMonitoring();
      };
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Append user message to both display state and history ref
    const userMsg: Message = { role: 'user', content: userMessage };
    historyRef.current = [...historyRef.current, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // ── No API key → graceful demo fallback ────────────────────────────────
    if (!MISTRAL_API_KEY) {
      const fallback = '⚠️ No Mistral API key found. Set VITE_MISTRAL_API_KEY in your .env file to enable live responses.';
      const assistantMsg: Message = { role: 'assistant', content: fallback };
      historyRef.current = [...historyRef.current, assistantMsg];
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
      return;
    }

    // ── Real Mistral streaming call ─────────────────────────────────────────
    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: MISTRAL_MODEL,
          stream: true,
          tools: AGENTIC_TOOLS,
          messages: [
            { role: 'system', content: AGENTIC_SYSTEM_PROMPT },
            // Send only the actual conversation (no system messages in history)
            ...historyRef.current,
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.message ?? `HTTP ${res.status}`);
      }

      // Add an empty assistant bubble
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      let full = '';

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Mistral sends "data: {...}\n\n" lines; split on newlines
        for (const line of chunk.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') break;

          try {
            const json = JSON.parse(payload);
            const delta: string = json.choices?.[0]?.delta?.content ?? '';
            const toolCalls = json.choices?.[0]?.delta?.tool_calls;
            
            // Handle tool calls if present
            if (toolCalls && toolCalls.length > 0) {
              for (const toolCall of toolCalls) {
                if (toolCall.function) {
                  await executeToolCall(toolCall.function.name, JSON.parse(toolCall.function.arguments || '{}'));
                }
              }
            }
            
            if (delta) {
              full += delta;
              setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: full };
                return next;
              });
            }
          } catch {
            // malformed chunk — skip
          }
        }
      }

      // Persist completed assistant message into history
      const assistantMsg: Message = { role: 'assistant', content: full };
      historyRef.current = [...historyRef.current, assistantMsg];

    } catch (e: any) {
      const errMsg = `❌ Mistral API error: ${e?.message ?? 'Unknown error'}. Check your API key and network.`;
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
    }

    setIsLoading(false);
  };

  /* ── Quick action chips ── */
  const quickActions = [
    '🔍 System Status',
    '⚡ Fraud Scan',
    '📊 Analytics',
  ];

  return (
    <div id="mistral-chatbot-wrapper" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      {/* Chat Window */}
      <div
        className={`mistral-window ${isOpen ? 'open' : ''}`}
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '0',
          width: '380px',
          height: '540px',
          background: 'rgba(7, 7, 26, 0.92)',
          backdropFilter: 'blur(24px) saturate(1.3)',
          border: '1px solid rgba(96, 165, 250, 0.12)',
          borderTop: '1px solid rgba(96, 165, 250, 0.2)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.92)',
          pointerEvents: isOpen ? 'auto' : 'none',
          boxShadow: '0 24px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(96,165,250,0.06), 0 0 60px rgba(59,130,246,0.08)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          background: 'linear-gradient(180deg, rgba(10,10,32,0.8) 0%, rgba(7,7,26,0.4) 100%)',
          borderBottom: '1px solid rgba(96, 165, 250, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', color: '#fff', fontSize: '14px', fontFamily: '"Bebas Neue", sans-serif',
              boxShadow: '0 2px 12px rgba(59,130,246,0.35)',
              letterSpacing: '0.05em',
            }}>M</div>
            <div>
              <div style={{ fontFamily: '"Syne", sans-serif', fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>Mistral AI Agent</div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: '10px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.5)', animation: 'pls 2s infinite' }}></span>
                Connected
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              padding: '3px 8px',
              borderRadius: '12px',
              background: 'rgba(96,165,250,0.08)',
              border: '1px solid rgba(96,165,250,0.15)',
              fontFamily: '"Space Mono", monospace',
              fontSize: '9px',
              color: '#60a5fa',
              letterSpacing: '0.05em',
            }}>L4</div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '16px',
                width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px', transition: 'all .2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >×</button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          padding: '8px 12px',
          display: 'flex',
          gap: '6px',
          borderBottom: '1px solid rgba(96,165,250,0.06)',
          flexShrink: 0,
          overflowX: 'auto',
        }}>
          {quickActions.map(action => (
            <button
              key={action}
              onClick={() => { setInput(action.replace(/^[^\s]+\s/, '')); }}
              style={{
                background: 'rgba(96,165,250,0.04)',
                border: '1px solid rgba(96,165,250,0.1)',
                borderRadius: '20px',
                padding: '4px 10px',
                color: 'rgba(232,234,246,0.5)',
                fontFamily: '"Space Mono", monospace',
                fontSize: '9px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all .2s',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)'; e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.background = 'rgba(96,165,250,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.1)'; e.currentTarget.style.color = 'rgba(232,234,246,0.5)'; e.currentTarget.style.background = 'rgba(96,165,250,0.04)'; }}
            >{action}</button>
          ))}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          padding: '12px 14px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              background: m.role === 'user'
                ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))'
                : 'rgba(255, 255, 255, 0.03)',
              border: '1px solid',
              borderColor: m.role === 'user' ? 'rgba(59,130,246,0.2)' : 'rgba(255, 255, 255, 0.06)',
              padding: '10px 14px',
              borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              color: m.role === 'user' ? '#e8eaf6' : 'rgba(232,234,246,0.8)',
              fontSize: '12.5px',
              fontFamily: '"Syne", sans-serif',
              lineHeight: '1.6',
              transition: 'transform .15s ease',
              animation: 'messageIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              {renderFormattedContent(m.content)}
            </div>
          ))}
          {isLoading && (
            <div style={{
              alignSelf: 'flex-start',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '12px 16px',
              borderRadius: '14px 14px 14px 4px',
              color: '#60a5fa',
              fontSize: '14px',
              display: 'flex',
              gap: '5px',
              alignItems: 'center',
            }}>
              <span className="mistral-dot">·</span>
              <span className="mistral-dot" style={{ animationDelay: '0.15s' }}>·</span>
              <span className="mistral-dot" style={{ animationDelay: '0.3s' }}>·</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(96, 165, 250, 0.08)',
          background: 'rgba(3,3,10,0.4)',
          display: 'flex',
          gap: '8px',
          flexShrink: 0,
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Mistral anything..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(96,165,250,0.1)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '12.5px',
              fontFamily: '"Syne", sans-serif',
              outline: 'none',
              transition: 'border-color .25s, background .25s',
              caretColor: '#60a5fa',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            style={{
              background: isLoading || !input.trim() ? 'rgba(59,130,246,0.2)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isLoading || !input.trim() ? 'default' : 'pointer',
              transition: 'all .25s',
              boxShadow: isLoading || !input.trim() ? 'none' : '0 4px 12px rgba(59,130,246,0.3)',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: isLoading || !input.trim() ? 0.3 : 1 }}>
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          background: isOpen
            ? 'rgba(10,10,32,0.9)'
            : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          border: isOpen ? '1px solid rgba(96,165,250,0.2)' : 'none',
          boxShadow: isOpen
            ? '0 4px 20px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(59,130,246,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all .35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isHovered ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated ring */}
        {!isOpen && (
          <div style={{
            position: 'absolute',
            inset: '-3px',
            borderRadius: '18px',
            border: '2px solid transparent',
            background: 'conic-gradient(from 0deg, transparent, rgba(96,165,250,0.4), transparent) border-box',
            mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: 'spinRing 3s linear infinite',
          }} />
        )}
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <div style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <circle cx="9" cy="10" r="1" fill="#fff" stroke="none"></circle>
              <circle cx="12" cy="10" r="1" fill="#fff" stroke="none"></circle>
              <circle cx="15" cy="10" r="1" fill="#fff" stroke="none"></circle>
            </svg>
          </div>
        )}
      </button>

      {/* Inject animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .mistral-dot {
            font-size: 20px;
            font-weight: bold;
            animation: mistralBlink 1.4s infinite both;
          }
          @keyframes mistralBlink {
            0% { opacity: 0.2; transform: translateY(0); }
            20% { opacity: 1; transform: translateY(-2px); }
            100% { opacity: 0.2; transform: translateY(0); }
          }
          @keyframes messageIn {
            from { opacity: 0; transform: translateY(8px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes spinRing {
            to { transform: rotate(360deg); }
          }
          #mistral-chatbot-wrapper input::placeholder {
            color: rgba(96,165,250,0.3);
            font-size: 12px;
          }
        ` }} />
    </div>
  );
}
