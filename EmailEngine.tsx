import { useState, useEffect, useCallback, useMemo } from 'react'
import { useCollection } from './src/Services/useDatabase'
import type { Email as DbEmail, Contact, Customer } from './src/Services/DatabaseTypes'

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL ENGINE MODULE
// AI-Powered Email Management with Smart Analysis
// ═══════════════════════════════════════════════════════════════════════════════

// --- Types ---
interface Email {
  id: string
  from: { name: string; email: string; avatar: string }
  to: string
  subject: string
  preview: string
  body: string
  timestamp: Date
  category: 'primary' | 'updates' | 'social' | 'promotions'
  labels: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
  isRead: boolean
  isStarred: boolean
  hasAttachments: boolean
  attachments: Array<{ name: string; size: string }>
  sentiment: 'positive' | 'negative' | 'neutral'
  aiSummary: string
  actionItems: string[]
  suggestedReplies: string[]
  thread: string[]
  unsubscribeLink: string | null
  contactId: string | null
  customerId: string | null
}

interface EmailStats {
  total: number
  unread: number
  starred: number
  critical: number
  categorized: { primary: number; updates: number; social: number; promotions: number }
  aiProcessed: { summarized: number; categorized: number; repliesSuggested: number; actionsExtracted: number }
}

// --- Mock Data ---
// Mock data kept for reference - now using database emails
const MOCK_EMAILS: Email[] = [
  {
    id: "e001",
    from: { name: "Sarah Chen", email: "sarah.chen@techcorp.io", avatar: "SC" },
    to: "me@company.com",
    subject: "Q2 Product Roadmap Review — Action Required",
    preview: "Hi team, I wanted to loop everyone in on the Q2 roadmap changes following our board meeting last week...",
    body: `Hi team,\n\nI wanted to loop everyone in on the Q2 roadmap changes following our board meeting last week. We've made some significant pivots that will affect the engineering timeline.\n\nKey changes:\n1. The AI feature suite launch has been moved from June to April 30th\n2. Mobile app redesign is now P0 — we need all hands on deck\n3. The analytics dashboard needs a complete overhaul by May 15th\n\nAction items for you:\n• Please review the updated PRD document and provide feedback by Friday EOD\n• Schedule a 1:1 with your team leads to discuss capacity\n• Update your sprint planning to reflect the new priorities\n\nLet's jump on a call Thursday at 2 PM to align.\n\nBest,\nSarah Chen`,
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    category: "primary",
    labels: ["work", "urgent", "action-required"],
    priority: "critical",
    isRead: false,
    isStarred: true,
    hasAttachments: true,
    attachments: [{ name: "Q2_Roadmap_v3.pdf", size: "2.4 MB" }],
    sentiment: "neutral",
    aiSummary: "VP of Product requesting review of Q2 roadmap changes. Action required: review PRD by Friday, schedule 1:1s, update sprint plans. Call Thursday 2 PM.",
    actionItems: ["Review PRD document by Friday EOD", "Schedule 1:1 with team leads", "Confirm Thursday 2 PM call"],
    suggestedReplies: [
      "Thanks Sarah! I've reviewed the roadmap — confirming Thursday 2 PM works for me. I'll have my feedback on the PRD to you by Thursday morning.",
      "Hi Sarah, noted on the changes. Thursday at 2 PM works. I have some concerns about the April 30th timeline I'd like to discuss."
    ],
    thread: ["e001"],
    unsubscribeLink: null,
    contactId: "con-1",
    customerId: "cust-1"
  },
  {
    id: "e002",
    from: { name: "GitHub", email: "noreply@github.com", avatar: "GH" },
    to: "me@company.com",
    subject: "[ml-project] Pull request #47 merged: Add transformer model support",
    preview: "Pull request #47 by @devraj has been merged into main. Changes: +1,204 −89 files changed...",
    body: `Pull request #47 has been successfully merged into the main branch.\n\nRepository: ml-project\nBranch: feature/transformer-support → main\n\nChanges Summary:\n• +1,204 lines added\n• -89 lines removed\n• 12 files changed\n\nThis pull request resolves issue #23.`,
    timestamp: new Date(Date.now() - 1000 * 60 * 38),
    category: "updates",
    labels: ["github", "dev"],
    priority: "low",
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    attachments: [],
    sentiment: "positive",
    aiSummary: "PR #47 merged into main — adds transformer model support with 1,204 new lines. Resolves issue #23.",
    actionItems: [],
    suggestedReplies: [],
    thread: ["e002"],
    unsubscribeLink: "https://github.com/unsubscribe",
    contactId: null,
    customerId: null
  },
  {
    id: "e003",
    from: { name: "Marcus Williams", email: "m.williams@clientco.com", avatar: "MW" },
    to: "me@company.com",
    subject: "URGENT: Production system down — need immediate help",
    preview: "Our entire production environment went down 20 minutes ago. Users cannot access the platform...",
    body: `Hi,\n\nOur entire production environment went down approximately 20 minutes ago. Users cannot access the platform and we are losing revenue every minute.\n\nError message: "Connection refused: Database cluster unreachable"\n\nThis is a Sev-1 incident for us. We have SLA obligations that require 99.9% uptime.\n\nI need someone on a call with our DevOps team immediately. Our emergency line is +1-555-0192.\n\nMarcus Williams\nCTO, ClientCo`,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    category: "primary",
    labels: ["urgent", "client", "incident"],
    priority: "critical",
    isRead: false,
    isStarred: true,
    hasAttachments: false,
    attachments: [],
    sentiment: "negative",
    aiSummary: "CRITICAL: Client's production is down for 20+ mins. Database cluster unreachable. SLA breach in progress. Client requesting immediate call.",
    actionItems: ["Call Marcus immediately at +1-555-0192", "Escalate to DevOps on-call team", "Check database cluster health"],
    suggestedReplies: [
      "Marcus — on it right now. Calling your emergency line and paging our on-call DevOps team simultaneously. ETA to resolution update: 15 mins.",
      "Hi Marcus, I've received your message and am escalating to our Sev-1 response team immediately. You'll get a call within 5 minutes."
    ],
    thread: ["e003"],
    unsubscribeLink: null,
    contactId: "con-2",
    customerId: "cust-2"
  },
  {
    id: "e004",
    from: { name: "LinkedIn", email: "messages-noreply@linkedin.com", avatar: "LI" },
    to: "me@company.com",
    subject: "You have 5 new connection requests and 12 messages",
    preview: "Ananya Sharma and 4 others want to connect. Also: 3 recruiters messaged you this week...",
    body: `You have activity on LinkedIn!\n\nNew Connection Requests (5):\n• Ananya Sharma — Senior ML Engineer at Google\n• Rohan Mehta — Founder at AIStartup\n• Lisa Park — Product Manager at Netflix\n\nNew Messages (12):\n• 3 recruiter messages\n• 2 responses to your posts\n• 7 comments on your article\n\nYour profile was viewed 847 times this week — up 23%!`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    category: "social",
    labels: ["social", "linkedin"],
    priority: "low",
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    attachments: [],
    sentiment: "positive",
    aiSummary: "5 LinkedIn connection requests from notable professionals. 12 messages including 3 recruiters. Profile views up 23%.",
    actionItems: ["Review connection requests from Ananya Sharma (Google ML)"],
    suggestedReplies: [],
    thread: ["e004"],
    unsubscribeLink: "https://linkedin.com/unsubscribe",
    contactId: null,
    customerId: null
  },
  {
    id: "e005",
    from: { name: "Priya Nair", email: "priya@startup.ai", avatar: "PN" },
    to: "me@company.com",
    subject: "Partnership Proposal — AI Integration Opportunity",
    preview: "I hope this finds you well. I'm the CEO of StartupAI, a series-A company building autonomous agents...",
    body: `Hi,\n\nI'm Priya Nair, CEO of StartupAI. We're a Series A company (raised $12M) building autonomous AI agents for enterprise workflows.\n\nWhat we're proposing:\n• Technical partnership: integrate our agent framework into your product\n• Revenue sharing: 30% on any deals we co-close\n• Co-marketing: joint webinars, blog posts\n\nWe have 40+ enterprise clients including Fortune 500 companies.\n\nI'd love to set up a 30-minute intro call. Are you available next week?\n\nPriya Nair\nCEO, StartupAI`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    category: "primary",
    labels: ["business", "partnership"],
    priority: "medium",
    isRead: false,
    isStarred: false,
    hasAttachments: false,
    attachments: [],
    sentiment: "positive",
    aiSummary: "CEO of Series A AI startup (raised $12M) proposing technical partnership with revenue sharing. 40+ enterprise clients. Requesting 30-min intro call.",
    actionItems: ["Evaluate partnership terms", "Schedule 30-min call with Priya if interested"],
    suggestedReplies: [
      "Hi Priya, thanks for reaching out! The partnership opportunity sounds interesting. I'm available Tuesday or Wednesday next week.",
      "Hi Priya, appreciate you reaching out. Could you share a brief deck before we connect?"
    ],
    thread: ["e005"],
    unsubscribeLink: null,
    contactId: "con-3",
    customerId: "cust-3"
  },
  {
    id: "e006",
    from: { name: "AWS Billing", email: "aws-billing@amazon.com", avatar: "AWS" },
    to: "me@company.com",
    subject: "Your AWS bill for March 2026 is ready — $4,847.23",
    preview: "Your AWS monthly bill for March 2026 has been generated. Total charges: $4,847.23...",
    body: `Your AWS bill for March 2026 is ready.\n\nAccount: 123456789012\nTotal Charges: $4,847.23\n\nBreakdown by Service:\n• EC2 Instances: $2,183.40 (45%)\n• S3 Storage: $847.20 (17%)\n• RDS Databases: $1,024.63 (21%)\n\nNotable Changes vs February:\n• EC2 costs increased by 23%\n• Lambda invocations up 340% — review recommended\n\nPayment will be auto-charged on April 15, 2026.`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    category: "updates",
    labels: ["billing", "aws"],
    priority: "medium",
    isRead: false,
    isStarred: false,
    hasAttachments: true,
    attachments: [{ name: "AWS_Bill_March2026.pdf", size: "156 KB" }],
    sentiment: "neutral",
    aiSummary: "AWS March bill: $4,847.23. Notable: EC2 up 23%, Lambda up 340% (review needed). Auto-charge April 15th.",
    actionItems: ["Review Lambda invocation spike (340% increase)"],
    suggestedReplies: [],
    thread: ["e006"],
    unsubscribeLink: null,
    contactId: null,
    customerId: null
  },
  {
    id: "e007",
    from: { name: "Alex Torres", email: "alex@team.io", avatar: "AT" },
    to: "me@company.com",
    subject: "Re: Weekend team offsite — final details",
    preview: "Just confirmed the venue! Treehouse Resort has availability for April 19-20. Cost is $200/person...",
    body: `Hey everyone,\n\nJust confirmed the venue! Treehouse Resort has availability for April 19-20 (Saturday-Sunday).\n\n📍 Location: Treehouse Resort, Coorg\n🗓️ Dates: April 19–20, 2026\n💰 Cost: $200/person (all-inclusive)\n🚌 Transport: Company bus leaves office at 7 AM Saturday\n\nRSVP by April 12th!\n\nAlex`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    category: "primary",
    labels: ["team", "event"],
    priority: "medium",
    isRead: true,
    isStarred: true,
    hasAttachments: false,
    attachments: [],
    sentiment: "positive",
    aiSummary: "Team offsite confirmed: April 19-20 at Treehouse Resort, Coorg. $200/person all-inclusive. RSVP required by April 12th.",
    actionItems: ["RSVP by April 12th", "Inform Alex of any dietary restrictions"],
    suggestedReplies: [
      "Count me in! RSVP: Yes. No dietary restrictions. See everyone Saturday at 7 AM! 🎉",
      "Sounds amazing! I'm in. Vegetarian food needed for me."
    ],
    thread: ["e007"],
    unsubscribeLink: null,
    contactId: null,
    customerId: null
  },
  {
    id: "e008",
    from: { name: "Spotify", email: "noreply@spotify.com", avatar: "SP" },
    to: "me@company.com",
    subject: "Your 2025 Spotify Wrapped is here! 🎵",
    preview: "Discover your year in music. Your top songs, artists, and listening minutes revealed...",
    body: `Your 2025 Spotify Wrapped is here!\n\nTop Artist: The Weeknd\nMinutes Listened: 12,847\nTop Genre: Indie Pop\n\nYour listening personality: The Adventurer — you explore new sounds and genres.\n\nShare your Wrapped with friends!`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    category: "promotions",
    labels: ["spotify", "entertainment"],
    priority: "low",
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    attachments: [],
    sentiment: "positive",
    aiSummary: "Spotify 2025 Wrapped: 12,847 minutes listened. Top artist: The Weeknd. Genre: Indie Pop.",
    actionItems: [],
    suggestedReplies: [],
    thread: ["e008"],
    unsubscribeLink: "https://spotify.com/unsubscribe",
    contactId: null,
    customerId: null
  },
  {
    id: "e009",
    from: { name: "Daniel Lee", email: "daniel@investors.vc", avatar: "DL" },
    to: "me@company.com",
    subject: "Due Diligence Request — Series B Materials",
    preview: "As part of our ongoing evaluation for your Series B round, we'd like to request the following materials...",
    body: `Hi,\n\nAs part of our due diligence for your Series B round, please provide:\n\n1. Audited financials (2024, 2025)\n2. Customer concentration analysis\n3. Technical architecture documentation\n4. Cap table and option pool analysis\n5. Founder references (3)\n\nTimeline: We need these by April 20th to stay on track for a May decision.\n\nBest,\nDaniel Lee\nPrincipal, VC Partners`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    category: "primary",
    labels: ["investor", "fundraising", "urgent"],
    priority: "high",
    isRead: false,
    isStarred: true,
    hasAttachments: false,
    attachments: [],
    sentiment: "neutral",
    aiSummary: "Investor requesting Series B due diligence materials. Deadline: April 20th. Items: financials, cap table, tech docs, references.",
    actionItems: ["Prepare audited financials", "Update cap table", "Gather founder references", "Compile tech architecture docs"],
    suggestedReplies: [
      "Hi Daniel, thanks for the list. We're gathering these materials and will have everything to you by April 18th, two days ahead of your deadline.",
      "Thanks Daniel. Quick question — do you need the full technical architecture docs or would an executive summary suffice for initial review?"
    ],
    thread: ["e009"],
    unsubscribeLink: null,
    contactId: "con-5",
    customerId: "cust-5"
  },
  {
    id: "e010",
    from: { name: "Coursera", email: "notifications@coursera.org", avatar: "CO" },
    to: "me@company.com",
    subject: "Course completion: Advanced Machine Learning Specialization",
    preview: "Congratulations! You've completed all 5 courses in the Advanced Machine Learning Specialization...",
    body: `Congratulations!\n\nYou've successfully completed the Advanced Machine Learning Specialization.\n\nCourses completed:\n✓ Neural Networks and Deep Learning\n✓ Improving Deep Neural Networks\n✓ Structuring ML Projects\n✓ Convolutional Neural Networks\n✓ Sequence Models\n\nYour certificate is ready for download.\n\nShare your achievement on LinkedIn!`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    category: "updates",
    labels: ["learning", "certificate"],
    priority: "low",
    isRead: true,
    isStarred: true,
    hasAttachments: true,
    attachments: [{ name: "ML_Specialization_Certificate.pdf", size: "892 KB" }],
    sentiment: "positive",
    aiSummary: "Completed Advanced Machine Learning Specialization (5 courses). Certificate ready for download.",
    actionItems: ["Download certificate", "Update LinkedIn profile", "Share on social media"],
    suggestedReplies: [],
    thread: ["e010"],
    unsubscribeLink: null,
    contactId: null,
    customerId: null
  }
]

// --- Helpers ---
const formatTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  if (hrs < 24) return `${hrs}h`
  if (days === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getPriorityEmoji = (priority: string): string => {
  const map: Record<string, string> = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' }
  return map[priority] || '⚪'
}

const getSentimentEmoji = (sentiment: string): string => {
  const map: Record<string, string> = { positive: '😊', negative: '😟', neutral: '😐' }
  return map[sentiment] || '😐'
}

const getAttachmentIcon = (filename: string): string => {
  if (filename.endsWith('.pdf')) return '📕'
  if (filename.endsWith('.docx') || filename.endsWith('.doc')) return '📘'
  if (filename.endsWith('.xlsx') || filename.endsWith('.csv')) return '📗'
  if (filename.endsWith('.png') || filename.endsWith('.jpg')) return '🖼️'
  return '📎'
}

// --- Components ---

function EmailListItem({ 
  email, 
  selected, 
  onClick 
}: { 
  email: Email
  selected: boolean
  onClick: () => void 
}) {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '14px 18px',
        background: selected ? 'rgba(96,165,250,0.1)' : email.isRead ? 'transparent' : 'rgba(96,165,250,0.03)',
        borderLeft: selected ? '3px solid var(--blue)' : email.isRead ? '3px solid transparent' : '3px solid rgba(96,165,250,0.3)',
        borderBottom: '1px solid rgba(96,165,250,0.06)',
        cursor: 'pointer',
        transition: 'all 0.15s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!email.isRead && (
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--blue)'
            }} />
          )}
          <span style={{ 
            fontWeight: email.isRead ? 500 : 600, 
            fontSize: '0.85rem',
            color: 'var(--text)'
          }}>
            {email.from.name}
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{formatTime(email.timestamp)}</span>
      </div>
      
      <div style={{ 
        fontSize: '0.8rem', 
        fontWeight: email.isRead ? 400 : 600,
        color: 'var(--text)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {email.subject}
      </div>
      
      <div style={{ 
        fontSize: '0.75rem', 
        color: 'var(--muted)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {email.preview}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
        <span style={{
          fontSize: '0.65rem',
          padding: '2px 6px',
          borderRadius: '3px',
          background: email.priority === 'critical' ? '#ef444420' : email.priority === 'high' ? '#f59e0b20' : '#3b82f620',
          color: email.priority === 'critical' ? '#ef4444' : email.priority === 'high' ? '#f59e0b' : '#3b82f6',
          fontWeight: 600
        }}>
          {getPriorityEmoji(email.priority)} {email.priority}
        </span>
        
        {email.labels.slice(0, 2).map(label => (
          <span key={label} style={{
            fontSize: '0.65rem',
            padding: '2px 6px',
            borderRadius: '3px',
            background: 'rgba(96,165,250,0.1)',
            color: 'var(--blue)',
            textTransform: 'uppercase'
          }}>
            {label}
          </span>
        ))}
        
        {email.isStarred && <span style={{ color: '#fbbf24', marginLeft: 'auto' }}>★</span>}
      </div>
      
      <div style={{
        marginTop: '8px',
        padding: '8px 12px',
        background: 'rgba(96,165,250,0.05)',
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: 'var(--muted)',
        lineHeight: 1.5
      }}>
        <span style={{ color: 'var(--blue)', fontWeight: 600 }}>🤖 AI:</span> {email.aiSummary}
      </div>
    </div>
  )
}

function EmailDetail({ 
  email, 
  onStar, 
  onReply,
  completedActions,
  onToggleAction
}: { 
  email: Email | null
  onStar: () => void
  onReply: (text?: string) => void
  completedActions: Set<string>
  onToggleAction: (key: string) => void
}) {
  if (!email) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--muted)',
        fontSize: '0.9rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</div>
          Select an email to view
        </div>
      </div>
    )
  }

  const priorityScore = email.priority === 'critical' ? 95 : email.priority === 'high' ? 75 : email.priority === 'medium' ? 50 : 25

  return (
    <div style={{ 
      height: '100%', 
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(96,165,250,0.1)'
      }}>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: '16px',
          lineHeight: 1.4
        }}>
          {email.subject}
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--blue), var(--vio))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: 'white'
          }}>
            {email.from.avatar}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{email.from.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{email.from.email}</div>
          </div>
          <span style={{ 
            marginLeft: 'auto',
            fontSize: '0.75rem', 
            color: 'var(--muted)' 
          }}>
            {email.timestamp.toLocaleString()}
          </span>
        </div>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => onReply()}
            style={{
              padding: '8px 16px',
              background: 'var(--blue)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            Reply
          </button>
          <button 
            onClick={onStar}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(96,165,250,0.3)',
              color: email.isStarred ? '#fbbf24' : 'var(--text)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            {email.isStarred ? '★ Starred' : '☆ Star'}
          </button>
        </div>
      </div>
      
      {/* AI Analysis Card */}
      <div style={{
        margin: '16px 24px',
        padding: '16px',
        background: 'rgba(96,165,250,0.05)',
        border: '1px solid rgba(96,165,250,0.1)',
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{
            padding: '2px 8px',
            background: 'var(--blue)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 700
          }}>
            AI
          </span>
          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>
            Smart Analysis
          </span>
        </div>
        
        <div style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '16px', lineHeight: 1.6 }}>
          {email.aiSummary}
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem' }}>{getPriorityEmoji(email.priority)}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '4px' }}>Priority</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem' }}>{getSentimentEmoji(email.sentiment)}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '4px' }}>Sentiment</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--blue)' }}>{email.actionItems.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '4px' }}>Actions</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--blue)' }}>{email.suggestedReplies.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '4px' }}>Replies</div>
          </div>
        </div>
        
        {/* Priority Score Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '6px'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>AI Priority Score</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)' }}>{priorityScore}/100</span>
          </div>
          <div style={{
            height: '6px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${priorityScore}%`,
              background: email.priority === 'critical' ? '#ef4444' : email.priority === 'high' ? '#f59e0b' : 'var(--blue)',
              borderRadius: '3px'
            }} />
          </div>
        </div>
      </div>
      
      {/* Action Items */}
      {email.actionItems.length > 0 && (
        <div style={{ margin: '0 24px 16px' }}>
          <div style={{ 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: 'var(--text)',
            marginBottom: '10px'
          }}>
            ✅ Action Items
          </div>
          {email.actionItems.map((item, i) => {
            const key = `${email.id}-${i}`
            const done = completedActions.has(key)
            return (
              <div 
                key={i}
                onClick={() => onToggleAction(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: done ? 'rgba(16,185,129,0.1)' : 'rgba(96,165,250,0.05)',
                  borderRadius: '6px',
                  marginBottom: '6px',
                  cursor: 'pointer',
                  textDecoration: done ? 'line-through' : 'none',
                  opacity: done ? 0.6 : 1
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: `2px solid ${done ? '#10b981' : 'var(--blue)'}`,
                  background: done ? '#10b981' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: 'white'
                }}>
                  {done && '✓'}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{item}</span>
              </div>
            )
          })}
        </div>
      )}
      
      {/* Email Body */}
      <div style={{ 
        padding: '0 24px 24px',
        fontSize: '0.9rem',
        lineHeight: 1.7,
        color: 'var(--text)',
        whiteSpace: 'pre-wrap'
      }}>
        {email.body}
      </div>
      
      {/* Attachments */}
      {email.hasAttachments && (
        <div style={{ margin: '0 24px 24px' }}>
          <div style={{ 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: 'var(--text)',
            marginBottom: '10px'
          }}>
            📎 Attachments ({email.attachments.length})
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {email.attachments.map((att, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'rgba(96,165,250,0.05)',
                border: '1px solid rgba(96,165,250,0.1)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{getAttachmentIcon(att.name)}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{att.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{att.size}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Smart Replies */}
      {email.suggestedReplies.length > 0 && (
        <div style={{ 
          margin: '0 24px 24px',
          padding: '16px',
          background: 'rgba(139,92,246,0.05)',
          border: '1px solid rgba(139,92,246,0.1)',
          borderRadius: '8px'
        }}>
          <div style={{ 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: 'var(--vio)',
            marginBottom: '12px'
          }}>
            💡 Smart Replies
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {email.suggestedReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => onReply(reply)}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: '6px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: 'var(--text)',
                  lineHeight: 1.5
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ComposeModal({
  isOpen,
  onClose,
  prefill,
  onSend
}: {
  isOpen: boolean
  onClose: () => void
  prefill: { to?: string; subject?: string; body?: string }
  onSend: (to: string, subject: string, body: string) => void
}) {
  const [to, setTo] = useState(prefill.to || '')
  const [subject, setSubject] = useState(prefill.subject || '')
  const [body, setBody] = useState(prefill.body || '')
  
  useEffect(() => {
    setTo(prefill.to || '')
    setSubject(prefill.subject || '')
    setBody(prefill.body || '')
  }, [prefill, isOpen])
  
  if (!isOpen) return null
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: '600px',
        maxWidth: '90vw',
        background: 'var(--s1)',
        border: '1px solid rgba(96,165,250,0.2)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(96,165,250,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>Compose Email</span>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--muted)',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}>×</button>
        </div>
        
        <div style={{ padding: '20px' }}>
          <input
            type="email"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(96,165,250,0.05)',
              border: '1px solid rgba(96,165,250,0.1)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '0.9rem',
              marginBottom: '12px'
            }}
          />
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(96,165,250,0.05)',
              border: '1px solid rgba(96,165,250,0.1)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '0.9rem',
              marginBottom: '12px'
            }}
          />
          <textarea
            placeholder="Write your message..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(96,165,250,0.05)',
              border: '1px solid rgba(96,165,250,0.1)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '0.9rem',
              resize: 'vertical',
              marginBottom: '16px',
              fontFamily: 'inherit'
            }}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid rgba(96,165,250,0.3)',
                color: 'var(--text)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (to && subject) {
                  onSend(to, subject, body)
                  onClose()
                }
              }}
              style={{
                padding: '10px 24px',
                background: 'var(--blue)',
                border: 'none',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              Send ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Main Component ---
export function EmailEnginePage({ onNavigate, onLogout }: { onNavigate: (p: string) => void, onLogout: () => void }) {
  // Data from shared database
  const dbEmails = useCollection<DbEmail>('emails')
  const contacts = useCollection<Contact>('contacts')
  const customers = useCollection<Customer>('customers')

  // Convert database emails to local Email format
  const [emails, setEmails] = useState<Email[]>([])

  useEffect(() => {
    const mapped = dbEmails.map((e: DbEmail): Email => ({
      id: e.id,
      from: { name: e.fromName, email: e.fromEmail, avatar: e.fromAvatar },
      to: e.to,
      subject: e.subject,
      preview: e.preview,
      body: e.body,
      timestamp: new Date(e.timestamp),
      category: e.category,
      labels: e.labels,
      priority: e.priority,
      isRead: e.isRead,
      isStarred: e.isStarred,
      hasAttachments: e.hasAttachments,
      attachments: e.attachments,
      sentiment: e.sentiment,
      aiSummary: e.aiSummary,
      actionItems: e.actionItems,
      suggestedReplies: e.suggestedReplies,
      thread: [e.threadId],
      unsubscribeLink: null,
      contactId: e.contactId,
      customerId: e.customerId,
    }))
    setEmails(mapped)
  }, [dbEmails])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [activeView, setActiveView] = useState<'inbox' | 'starred' | 'unread' | 'priority'>('inbox')
  const [activeCategory, setActiveCategory] = useState<'all' | 'primary' | 'updates' | 'social' | 'promotions'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set())
  const [composeOpen, setComposeOpen] = useState(false)
  const [composePrefill, setComposePrefill] = useState<{ to?: string; subject?: string; body?: string }>({})
  
  // Stats
  const stats: EmailStats = useMemo(() => ({
    total: emails.length,
    unread: emails.filter(e => !e.isRead).length,
    starred: emails.filter(e => e.isStarred).length,
    critical: emails.filter(e => e.priority === 'critical').length,
    categorized: {
      primary: emails.filter(e => e.category === 'primary').length,
      updates: emails.filter(e => e.category === 'updates').length,
      social: emails.filter(e => e.category === 'social').length,
      promotions: emails.filter(e => e.category === 'promotions').length
    },
    aiProcessed: {
      summarized: emails.filter(e => e.aiSummary).length,
      categorized: emails.length,
      repliesSuggested: emails.filter(e => e.suggestedReplies.length > 0).length,
      actionsExtracted: emails.reduce((acc, e) => acc + e.actionItems.length, 0)
    }
  }), [emails])
  
  // Filtered emails
  const filteredEmails = useMemo(() => {
    let filtered = emails
    
    // View filter
    if (activeView === 'starred') filtered = filtered.filter(e => e.isStarred)
    else if (activeView === 'unread') filtered = filtered.filter(e => !e.isRead)
    else if (activeView === 'priority') filtered = filtered.filter(e => ['critical', 'high'].includes(e.priority))
    
    // Category filter
    if (activeCategory !== 'all') filtered = filtered.filter(e => e.category === activeCategory)
    
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(e => 
        e.subject.toLowerCase().includes(q) ||
        e.from.name.toLowerCase().includes(q) ||
        e.preview.toLowerCase().includes(q) ||
        e.aiSummary.toLowerCase().includes(q)
      )
    }
    
    return filtered
  }, [emails, activeView, activeCategory, searchQuery])
  
  // Handlers
  const handleSelectEmail = useCallback((email: Email) => {
    setSelectedEmail(email)
    // Mark as read
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, isRead: true } : e
    ))
  }, [])
  
  const handleStar = useCallback(() => {
    if (!selectedEmail) return
    setEmails(prev => prev.map(e => 
      e.id === selectedEmail.id ? { ...e, isStarred: !e.isStarred } : e
    ))
    setSelectedEmail(prev => prev ? { ...prev, isStarred: !prev.isStarred } : null)
  }, [selectedEmail])
  
  const handleReply = useCallback((text?: string) => {
    if (!selectedEmail) return
    setComposePrefill({
      to: selectedEmail.from.email,
      subject: `Re: ${selectedEmail.subject}`,
      body: text || ''
    })
    setComposeOpen(true)
  }, [selectedEmail])
  
  const handleToggleAction = useCallback((key: string) => {
    setCompletedActions(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])
  
  const handleSend = useCallback((to: string, subject: string, body: string) => {
    const newEmail: Email = {
      id: `sent-${Date.now()}`,
      from: { name: 'Me', email: 'me@company.com', avatar: 'ME' },
      to,
      subject,
      preview: body.slice(0, 100),
      body,
      timestamp: new Date(),
      category: 'primary',
      labels: [],
      priority: 'medium',
      isRead: true,
      isStarred: false,
      hasAttachments: false,
      attachments: [],
      sentiment: 'neutral',
      aiSummary: `Sent to ${to}: ${subject}`,
      actionItems: [],
      suggestedReplies: [],
      thread: [],
      unsubscribeLink: null,
      contactId: null,
      customerId: null
    }
    setEmails(prev => [newEmail, ...prev])
  }, [])
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid rgba(96,165,250,0.1)',
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('main') }} style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--blue), var(--vio))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none'
          }}>
            RAD<span style={{ color: 'var(--blue)' }}>·</span>ON
          </a>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('neoguard') }} style={{
              color: 'var(--muted)',
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}>NeoGuard</a>
            <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>Email Engine</span>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('analytics') }} style={{
              color: 'var(--muted)',
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}>Analytics</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('crm') }} style={{
              color: 'var(--muted)',
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}>CRM</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('erp') }} style={{
              color: 'var(--muted)',
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}>ERP</a>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setComposeOpen(true)}
            style={{
              padding: '8px 16px',
              background: 'var(--blue)',
              border: 'none',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            + Compose
          </button>
          <button 
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(96,165,250,0.3)',
              color: 'var(--text)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Log Out
          </button>
        </div>
      </nav>
      
      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'grid',
        gridTemplateColumns: '280px 360px 1fr',
        overflow: 'hidden'
      }}>
        {/* Sidebar */}
        <div style={{
          background: 'rgba(96,165,250,0.03)',
          borderRight: '1px solid rgba(96,165,250,0.1)',
          padding: '20px',
          overflow: 'auto'
        }}>
          {/* Stats */}
          <div style={{
            padding: '16px',
            background: 'rgba(96,165,250,0.05)',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--muted)', 
              marginBottom: '12px',
              fontWeight: 600
            }}>
              AI TODAY
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue)' }}>
                  {stats.aiProcessed.summarized}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Summarized</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue)' }}>
                  {stats.aiProcessed.categorized}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Categorized</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue)' }}>
                  {stats.aiProcessed.repliesSuggested}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Replies</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--blue)' }}>
                  {stats.aiProcessed.actionsExtracted}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Actions</div>
              </div>
            </div>
          </div>
          
          {/* Views */}
          <div style={{ marginBottom: '20px' }}>
            {[
              { id: 'inbox', label: 'Inbox', count: stats.unread },
              { id: 'starred', label: 'Starred', count: stats.starred },
              { id: 'unread', label: 'Unread', count: stats.unread },
              { id: 'priority', label: 'Priority', count: stats.critical }
            ].map(view => (
              <div
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: activeView === view.id ? 'rgba(96,165,250,0.1)' : 'transparent',
                  marginBottom: '4px'
                }}
              >
                <span style={{ 
                  fontSize: '0.85rem', 
                  color: activeView === view.id ? 'var(--blue)' : 'var(--text)',
                  fontWeight: activeView === view.id ? 600 : 400
                }}>
                  {view.label}
                </span>
                {view.count > 0 && (
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    background: activeView === view.id ? 'var(--blue)' : 'rgba(96,165,250,0.2)',
                    color: activeView === view.id ? 'white' : 'var(--blue)',
                    borderRadius: '10px',
                    fontWeight: 600
                  }}>
                    {view.count}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Categories */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '10px', fontWeight: 600 }}>
              CATEGORIES
            </div>
            {[
              { id: 'all', label: 'All Mail' },
              { id: 'primary', label: 'Primary', count: stats.categorized.primary },
              { id: 'updates', label: 'Updates', count: stats.categorized.updates },
              { id: 'social', label: 'Social', count: stats.categorized.social },
              { id: 'promotions', label: 'Promotions', count: stats.categorized.promotions }
            ].map(cat => (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: activeCategory === cat.id ? 'rgba(96,165,250,0.1)' : 'transparent',
                  marginBottom: '2px'
                }}
              >
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: activeCategory === cat.id ? 'var(--blue)' : 'var(--muted)'
                }}>
                  {cat.label}
                </span>
                {'count' in cat && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{cat.count}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Email List */}
        <div style={{
          borderRight: '1px solid rgba(96,165,250,0.1)',
          overflow: 'auto',
          background: 'rgba(96,165,250,0.02)'
        }}>
          {/* Search */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid rgba(96,165,250,0.1)'
          }}>
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(96,165,250,0.05)',
                border: '1px solid rgba(96,165,250,0.1)',
                borderRadius: '6px',
                color: 'var(--text)',
                fontSize: '0.85rem'
              }}
            />
          </div>
          
          {/* List */}
          <div>
            {filteredEmails.map(email => (
              <EmailListItem
                key={email.id}
                email={email}
                selected={selectedEmail?.id === email.id}
                onClick={() => handleSelectEmail(email)}
              />
            ))}
            {filteredEmails.length === 0 && (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--muted)',
                fontSize: '0.85rem'
              }}>
                No emails found
              </div>
            )}
          </div>
        </div>
        
        {/* Email Detail */}
        <div style={{
          background: 'var(--bg)',
          overflow: 'auto'
        }}>
          <EmailDetail
            email={selectedEmail}
            onStar={handleStar}
            onReply={handleReply}
            completedActions={completedActions}
            onToggleAction={handleToggleAction}
          />
        </div>
      </div>
      
      {/* Compose Modal */}
      <ComposeModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        prefill={composePrefill}
        onSend={handleSend}
      />
    </div>
  )
}
