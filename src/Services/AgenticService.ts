/**
 * Mistral AI Agentic Service
 * Handles proactive monitoring, autonomous decision-making, and continuous learning
 */

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

class AgenticService {
  private static instance: AgenticService;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private learningPatterns: Map<string, LearningPattern> = new Map();

  private constructor() {}

  static getInstance(): AgenticService {
    if (!AgenticService.instance) {
      AgenticService.instance = new AgenticService();
    }
    return AgenticService.instance;
  }

  // Start proactive monitoring
  startProactiveMonitoring(): void {
    if (this.monitoringInterval) return;

    console.log('🤖 Starting proactive monitoring...');
    
    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthCheck();
      await this.analyzeFraudPatterns();
      await this.checkBusinessMetrics();
      await this.learnFromPatterns();
    }, 30000);

    // Initial checks
    setTimeout(() => this.performHealthCheck(), 1000);
  }

  // Stop proactive monitoring
  stopProactiveMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🤖 Proactive monitoring stopped');
    }
  }

  // System health monitoring
  private async performHealthCheck(): Promise<void> {
    try {
      const response = await fetch('/api/health');
      const health = await response.json();

      if (health.status !== 'ok') {
        this.logAutonomousAction({
          timestamp: new Date().toISOString(),
          action: 'system_health_alert',
          target: 'system_admin',
          justification: `System health degraded: ${health.status}`,
          agent: 'Mistral AI Agent'
        });
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  // Fraud pattern analysis
  private async analyzeFraudPatterns(): Promise<void> {
    try {
      const response = await fetch('/api/demo');
      const data = await response.json();

      const highRiskTransactions = data.transactions.filter(
        (t: any) => t.risk_score > 1.2
      );

      if (highRiskTransactions.length > 0) {
        // Learn from this pattern
        this.updateLearningPattern('high_risk_fraud', highRiskTransactions.length);

        // Take autonomous action if pattern is significant
        const pattern = this.learningPatterns.get('high_risk_fraud');
        if (pattern && pattern.frequency > 3 && pattern.effectiveness > 0.8) {
          this.logAutonomousAction({
            timestamp: new Date().toISOString(),
            action: 'escalate_fraud_alert',
            target: highRiskTransactions.map((t: any) => t.transaction_id).join(','),
            justification: `Recurring high-risk pattern detected: ${highRiskTransactions.length} transactions`,
            agent: 'Mistral AI Agent'
          });
        }
      }
    } catch (error) {
      console.error('Fraud analysis failed:', error);
    }
  }

  // Business metrics monitoring
  private async checkBusinessMetrics(): Promise<void> {
    try {
      const response = await fetch('/api/enterprise/stats');
      const stats = await response.json();

      // Check CRM win rate
      if (stats.crm.win_rate < 0.7) {
        this.updateLearningPattern('low_win_rate', 1);
        
        const pattern = this.learningPatterns.get('low_win_rate');
        if (pattern && pattern.frequency >= 2) {
          this.logAutonomousAction({
            timestamp: new Date().toISOString(),
            action: 'notify_stakeholders',
            target: 'sales_manager',
            justification: `CRM win rate consistently low: ${stats.crm.win_rate}`,
            agent: 'Mistral AI Agent'
          });
        }
      }

      // Check ERP inventory
      if (stats.erp.low_stock_count > 20) {
        this.logAutonomousAction({
          timestamp: new Date().toISOString(),
          action: 'procurement_alert',
          target: 'procurement_team',
          justification: `High number of low stock items: ${stats.erp.low_stock_count}`,
          agent: 'Mistral AI Agent'
        });
      }
    } catch (error) {
      console.error('Business metrics check failed:', error);
    }
  }

  // Learning from patterns
  private async learnFromPatterns(): Promise<void> {
    const now = new Date().toISOString();
    
    // Update pattern effectiveness based on outcomes
    const actionLogs = this.getActionLogs();
    const recentLogs = actionLogs.filter(log => 
      new Date(log.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    // Analyze which actions were effective
    recentLogs.forEach(log => {
      const patternKey = `${log.action}_${log.target}`;
      const pattern = this.learningPatterns.get(patternKey);
      
      if (pattern) {
        // Simple effectiveness calculation (would be more sophisticated in production)
        pattern.effectiveness = Math.min(1.0, pattern.effectiveness + 0.1);
        pattern.lastSeen = now;
      }
    });

    // Clean up old patterns
    this.cleanupOldPatterns();
  }

  // Update learning patterns
  private updateLearningPattern(patternKey: string, frequency: number): void {
    const existing = this.learningPatterns.get(patternKey);
    
    if (existing) {
      existing.frequency += frequency;
      existing.lastSeen = new Date().toISOString();
    } else {
      this.learningPatterns.set(patternKey, {
        pattern: patternKey,
        frequency,
        lastSeen: new Date().toISOString(),
        effectiveness: 0.5 // Start with neutral effectiveness
      });
    }
  }

  // Clean up old patterns
  private cleanupOldPatterns(): void {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
    
    for (const [key, pattern] of this.learningPatterns.entries()) {
      if (new Date(pattern.lastSeen).getTime() < cutoff) {
        this.learningPatterns.delete(key);
      }
    }
  }

  // Log autonomous actions
  private logAutonomousAction(action: ActionLog): void {
    const existingLogs = this.getActionLogs();
    existingLogs.push(action);
    
    // Keep only last 1000 logs
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    localStorage.setItem('mistral_action_logs', JSON.stringify(existingLogs));
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('autonomousAction', { detail: action }));
    
    console.log('🤖 Autonomous Action:', action);
  }

  // Get action logs
  getActionLogs(): ActionLog[] {
    try {
      return JSON.parse(localStorage.getItem('mistral_action_logs') || '[]');
    } catch {
      return [];
    }
  }

  // Get learning patterns
  getLearningPatterns(): LearningPattern[] {
    return Array.from(this.learningPatterns.values());
  }

  // Get autonomy level based on patterns and effectiveness
  getAutonomyLevel(): number {
    const patterns = this.getLearningPatterns();
    if (patterns.length === 0) return 1;
    
    const avgEffectiveness = patterns.reduce((sum, p) => sum + p.effectiveness, 0) / patterns.length;
    
    if (avgEffectiveness > 0.95) return 4; // Full autonomy
    if (avgEffectiveness > 0.8) return 3;  // Execute workflows
    if (avgEffectiveness > 0.6) return 2;  // Recommend actions
    return 1; // Monitor and alert
  }
}

export default AgenticService;
