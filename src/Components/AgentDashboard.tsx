import React, { useState, useEffect } from 'react';
import AgenticService from '../Services/AgenticService';

interface ActionLog {
  timestamp: string;
  action: string;
  target: string;
  justification: string;
  outcome?: 'success' | 'failure' | 'partial';
  agent: string;
}

interface LearningPattern {
  pattern: string;
  frequency: number;
  lastSeen: string;
  effectiveness: number;
}

export default function AgentDashboard() {
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
  const [autonomyLevel, setAutonomyLevel] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const agenticService = AgenticService.getInstance();
    
    // Initial data load
    setActionLogs(agenticService.getActionLogs().slice(-10).reverse());
    setLearningPatterns(agenticService.getLearningPatterns());
    setAutonomyLevel(agenticService.getAutonomyLevel());

    // Update every 5 seconds
    const interval = setInterval(() => {
      setActionLogs(agenticService.getActionLogs().slice(-10).reverse());
      setLearningPatterns(agenticService.getLearningPatterns());
      setAutonomyLevel(agenticService.getAutonomyLevel());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getAutonomyLevelColor = (level: number) => {
    switch (level) {
      case 1: return '#60a5fa'; // blue
      case 2: return '#8b5cf6'; // violet  
      case 3: return '#22c55e'; // green
      case 4: return '#34d399'; // emerald
      default: return '#6b7280'; // gray
    }
  };

  const getAutonomyLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Monitor & Alert';
      case 2: return 'Recommend Actions';
      case 3: return 'Execute Workflows';
      case 4: return 'Full Autonomy';
      default: return 'Initializing';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '32px',
      right: '1.25rem',
      zIndex: 9998,
      fontFamily: '"Space Mono", monospace',
      fontSize: '12px'
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'rgba(7, 7, 26, 0.92)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          border: '1px solid rgba(96, 165, 250, 0.12)',
          borderRadius: '10px',
          padding: '7px 14px',
          color: '#e8eaf6',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all .25s cubic-bezier(.16,1,.3,1)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          fontSize: '11px',
          letterSpacing: '0.04em',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <span style={{ 
          width: '7px', 
          height: '7px', 
          borderRadius: '50%', 
          background: getAutonomyLevelColor(autonomyLevel),
          boxShadow: `0 0 8px ${getAutonomyLevelColor(autonomyLevel)}60`,
          animation: 'agentPulse 2s infinite'
        }}></span>
        <span style={{ fontWeight: 600 }}>AI Agent</span>
        <span style={{
          padding: '1px 6px',
          borderRadius: '6px',
          background: `${getAutonomyLevelColor(autonomyLevel)}15`,
          border: `1px solid ${getAutonomyLevelColor(autonomyLevel)}30`,
          color: getAutonomyLevelColor(autonomyLevel),
          fontSize: '9px',
          fontWeight: 700,
        }}>L{autonomyLevel}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,0.5)" strokeWidth="2" strokeLinecap="round" style={{ transition: 'transform .25s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Expanded Dashboard */}
      {isExpanded && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          width: '380px',
          maxHeight: '520px',
          background: 'rgba(7, 7, 26, 0.95)',
          backdropFilter: 'blur(24px) saturate(1.3)',
          border: '1px solid rgba(96, 165, 250, 0.1)',
          borderTop: '1px solid rgba(96, 165, 250, 0.18)',
          borderRadius: '14px',
          padding: '0',
          color: '#e8eaf6',
          boxShadow: '0 20px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(96,165,250,0.04)',
          overflow: 'hidden',
          animation: 'dashSlideIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            borderBottom: '1px solid rgba(96,165,250,0.08)',
            background: 'rgba(10,10,32,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(59,130,246,0.3)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', fontFamily: '"Syne", sans-serif', letterSpacing: '0.02em' }}>
                  AI Agent Status
                </div>
                <div style={{ 
                  color: getAutonomyLevelColor(autonomyLevel),
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: getAutonomyLevelColor(autonomyLevel), boxShadow: `0 0 6px ${getAutonomyLevelColor(autonomyLevel)}` }}></span>
                  {getAutonomyLevelText(autonomyLevel)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 14px', maxHeight: '420px', overflowY: 'auto' }}>
            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              marginBottom: '14px',
            }}>
              {[
                { label: 'Actions', value: actionLogs.length, color: '#60a5fa' },
                { label: 'Patterns', value: learningPatterns.length, color: '#8b5cf6' },
                { label: 'Autonomy', value: `L${autonomyLevel}`, color: '#34d399' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '10px',
                  padding: '10px',
                  textAlign: 'center',
                  transition: 'all .25s',
                }}>
                  <div style={{
                    fontFamily: '"Bebas Neue", sans-serif',
                    fontSize: '1.4rem',
                    color: stat.color,
                    lineHeight: 1,
                    letterSpacing: '0.04em',
                    filter: `drop-shadow(0 0 6px ${stat.color}40)`,
                  }}>{stat.value}</div>
                  <div style={{ fontSize: '9px', color: '#4a5568', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Learning Patterns */}
            {learningPatterns.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{
                  fontSize: '10px', fontWeight: 700, marginBottom: '8px', color: '#60a5fa',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>
                  Learning Patterns
                </div>
                {learningPatterns.slice(0, 3).map((pattern, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(96,165,250,0.04)',
                    border: '1px solid rgba(96,165,250,0.08)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    marginBottom: '6px',
                    transition: 'all .2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#e8eaf6' }}>{pattern.pattern}</span>
                      <span style={{ 
                        fontSize: '9px',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        background: pattern.effectiveness > 0.8 ? 'rgba(34,197,94,0.1)' : 'rgba(96,165,250,0.1)',
                        color: pattern.effectiveness > 0.8 ? '#22c55e' : '#60a5fa',
                        border: `1px solid ${pattern.effectiveness > 0.8 ? 'rgba(34,197,94,0.2)' : 'rgba(96,165,250,0.2)'}`,
                      }}>
                        {Math.round(pattern.effectiveness * 100)}%
                      </span>
                    </div>
                    <div style={{ fontSize: '9px', color: '#4a5568', marginTop: '3px' }}>
                      Freq: {pattern.frequency} · Last: {formatTimestamp(pattern.lastSeen)}
                    </div>
                    {/* Effectiveness bar */}
                    <div style={{ marginTop: '4px', height: '2px', background: 'rgba(255,255,255,0.04)', borderRadius: '1px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pattern.effectiveness * 100}%`,
                        background: pattern.effectiveness > 0.8
                          ? 'linear-gradient(to right, #22c55e, #34d399)'
                          : 'linear-gradient(to right, #3b82f6, #60a5fa)',
                        borderRadius: '1px',
                        transition: 'width 1s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Actions */}
            <div>
              <div style={{
                fontSize: '10px', fontWeight: 700, marginBottom: '8px', color: '#8b5cf6',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Recent Actions
              </div>
              {actionLogs.length === 0 ? (
                <div style={{
                  fontSize: '10px', color: '#4a5568', fontStyle: 'italic',
                  padding: '16px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.06)',
                }}>
                  No autonomous actions yet. Agent is learning...
                </div>
              ) : (
                actionLogs.map((log, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderLeft: '2px solid #8b5cf6',
                    borderRadius: '0 8px 8px 0',
                    padding: '8px 10px',
                    marginBottom: '6px',
                    transition: 'all .2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#60a5fa' }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: '9px', color: '#4a5568' }}>
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <div style={{ fontSize: '9px', color: '#e8eaf6', marginTop: '3px', opacity: 0.7 }}>
                      Target: {log.target}
                    </div>
                    <div style={{ fontSize: '9px', color: '#4a5568', marginTop: '2px', fontStyle: 'italic' }}>
                      {log.justification}
                    </div>
                    {log.outcome && (
                      <div style={{ 
                        fontSize: '8px',
                        marginTop: '3px',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        background: log.outcome === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: log.outcome === 'success' ? '#22c55e' : '#ef4444',
                        border: `1px solid ${log.outcome === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      }}>
                        {log.outcome}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes agentPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          @keyframes dashSlideIn {
            from { opacity: 0; transform: translateY(-8px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `
      }} />
    </div>
  );
}
