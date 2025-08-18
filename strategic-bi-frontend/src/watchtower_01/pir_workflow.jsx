// pir_workflow.jsx
import React from 'react';

/**
 * PIR Workflow Engine - Generates Priority Intelligence Requirements and Indicators
 * This module analyzes decision points and creates actionable intelligence requirements
 */

// PIR Generation Templates
const PIR_TEMPLATES = {
  market_entry: [
    {
      id: 'pir_market_1',
      question: 'Is the regulatory environment stable and business-friendly?',
      type: 'confirm_deny',
      priority: 'high',
      timeframe: '30 days'
    },
    {
      id: 'pir_market_2',
      question: 'Are market entry costs within acceptable parameters?',
      type: 'confirm_deny',
      priority: 'high',
      timeframe: '15 days'
    },
    {
      id: 'pir_market_3',
      question: 'Is the competitive landscape favorable for new entrants?',
      type: 'confirm_deny',
      priority: 'medium',
      timeframe: '45 days'
    },
    {
      id: 'pir_market_4',
      question: 'Are local infrastructure capabilities sufficient for operations?',
      type: 'confirm_deny',
      priority: 'medium',
      timeframe: '30 days'
    }
  ],
  partnership: [
    {
      id: 'pir_partner_1',
      question: 'Do potential partners have proven track records in the region?',
      type: 'confirm_deny',
      priority: 'high',
      timeframe: '20 days'
    },
    {
      id: 'pir_partner_2',
      question: 'Are partnership terms financially advantageous?',
      type: 'confirm_deny',
      priority: 'high',
      timeframe: '30 days'
    },
    {
      id: 'pir_partner_3',
      question: 'Will partnerships provide sufficient market access?',
      type: 'confirm_deny',
      priority: 'medium',
      timeframe: '25 days'
    }
  ],
  staffing: [
    {
      id: 'pir_staff_1',
      question: 'Is local talent pool sufficient for operational needs?',
      type: 'confirm_deny',
      priority: 'high',
      timeframe: '30 days'
    },
    {
      id: 'pir_staff_2',
      question: 'Are compensation expectations within budget parameters?',
      type: 'confirm_deny',
      priority: 'high',
      timeframe: '15 days'
    },
    {
      id: 'pir_staff_3',
      question: 'Can cultural integration be achieved effectively?',
      type: 'confirm_deny',
      priority: 'medium',
      timeframe: '45 days'
    }
  ],
  timing: [
    {
      id: 'pir_timing_1',
      question: 'Are market conditions optimal for the proposed launch window?',
      type: 'confirm_deny',
      priority: 'high',
      timeframe: '20 days'
    },
    {
      id: 'pir_timing_2',
      question: 'Will internal capabilities be ready by launch date?',
      type: 'confirm_deny',
      priority: 'high',
      timeframe: '30 days'
    },
    {
      id: 'pir_timing_3',
      question: 'Are competitive threats manageable in the proposed timeframe?',
      type: 'confirm_deny',
      priority: 'medium',
      timeframe: '25 days'
    }
  ],
  marketing: [
    {
      id: 'pir_marketing_1',
      question: 'Are target demographics reachable through proposed channels?',
      type: 'confirm_deny',
      priority: 'high',
      timeframe: '30 days'
    },
    {
      id: 'pir_marketing_2',
      question: 'Is the marketing budget sufficient for effective penetration?',
      type: 'confirm_deny',
      priority: 'high',
      timeframe: '15 days'
    },
    {
      id: 'pir_marketing_3',
      question: 'Will the chosen channels provide measurable ROI?',
      type: 'confirm_deny',
      priority: 'medium',
      timeframe: '45 days'
    }
  ],
  default: [
    {
      id: 'pir_default_1',
      question: 'Are the necessary resources available for implementation?',
      type: 'confirm_deny',
      priority: 'high',
      timeframe: '30 days'
    },
    {
      id: 'pir_default_2',
      question: 'Do stakeholders support the proposed approach?',
      type: 'confirm_deny',
      priority: 'medium',
      timeframe: '20 days'
    },
    {
      id: 'pir_default_3',
      question: 'Are potential risks within acceptable limits?',
      type: 'confirm_deny',
      priority: 'high',
      timeframe: '25 days'
    }
  ]
};

// Indicator Generation Templates
const INDICATOR_TEMPLATES = {
  regulatory: [
    {
      id: 'ind_reg_1',
      description: 'Government policy announcements affecting business operations',
      type: 'observable_event',
      source: 'Government publications, news media',
      frequency: 'Weekly monitoring'
    },
    {
      id: 'ind_reg_2',
      description: 'Changes in licensing requirements or procedures',
      type: 'process_change',
      source: 'Regulatory agencies, legal advisors',
      frequency: 'Monthly review'
    },
    {
      id: 'ind_reg_3',
      description: 'Competitor compliance issues or regulatory challenges',
      type: 'market_intelligence',
      source: 'Industry reports, competitor analysis',
      frequency: 'Bi-weekly monitoring'
    }
  ],
  financial: [
    {
      id: 'ind_fin_1',
      description: 'Market pricing data and cost benchmarks',
      type: 'quantitative_data',
      source: 'Market research, vendor quotes',
      frequency: 'Monthly updates'
    },
    {
      id: 'ind_fin_2',
      description: 'Currency exchange rate fluctuations',
      type: 'economic_indicator',
      source: 'Financial markets, central bank data',
      frequency: 'Daily monitoring'
    },
    {
      id: 'ind_fin_3',
      description: 'Budget allocation approvals and constraints',
      type: 'internal_decision',
      source: 'Finance department, executive decisions',
      frequency: 'As needed'
    }
  ],
  competitive: [
    {
      id: 'ind_comp_1',
      description: 'Competitor market entry announcements',
      type: 'market_intelligence',
      source: 'Press releases, industry news',
      frequency: 'Weekly monitoring'
    },
    {
      id: 'ind_comp_2',
      description: 'Market share data and customer sentiment',
      type: 'market_research',
      source: 'Customer surveys, market reports',
      frequency: 'Quarterly assessment'
    },
    {
      id: 'ind_comp_3',
      description: 'Pricing changes by key competitors',
      type: 'competitive_intelligence',
      source: 'Market analysis, customer feedback',
      frequency: 'Monthly tracking'
    }
  ],
  human_resources: [
    {
      id: 'ind_hr_1',
      description: 'Local talent availability surveys and reports',
      type: 'market_research',
      source: 'Recruitment agencies, HR consultants',
      frequency: 'Quarterly review'
    },
    {
      id: 'ind_hr_2',
      description: 'Salary benchmark studies and compensation trends',
      type: 'compensation_data',
      source: 'HR consulting firms, industry surveys',
      frequency: 'Semi-annual updates'
    },
    {
      id: 'ind_hr_3',
      description: 'Employee retention rates in similar companies',
      type: 'industry_benchmark',
      source: 'Industry associations, peer networks',
      frequency: 'Annual assessment'
    }
  ],
  operational: [
    {
      id: 'ind_ops_1',
      description: 'Infrastructure capacity assessments and upgrades',
      type: 'capability_assessment',
      source: 'Technical audits, vendor assessments',
      frequency: 'Quarterly review'
    },
    {
      id: 'ind_ops_2',
      description: 'Technology platform performance metrics',
      type: 'performance_data',
      source: 'System monitoring, technical teams',
      frequency: 'Real-time monitoring'
    },
    {
      id: 'ind_ops_3',
      description: 'Supply chain reliability and disruption reports',
      type: 'supply_chain_data',
      source: 'Vendor reports, logistics partners',
      frequency: 'Weekly updates'
    }
  ],
  partnership: [
    {
      id: 'ind_part_1',
      description: 'Partner financial health and stability reports',
      type: 'financial_intelligence',
      source: 'Financial statements, credit reports',
      frequency: 'Quarterly review'
    },
    {
      id: 'ind_part_2',
      description: 'Partner performance metrics and KPIs',
      type: 'performance_data',
      source: 'Partner reports, joint reviews',
      frequency: 'Monthly assessment'
    },
    {
      id: 'ind_part_3',
      description: 'Market feedback on partner reputation',
      type: 'reputation_intelligence',
      source: 'Customer feedback, industry contacts',
      frequency: 'Bi-monthly monitoring'
    }
  ],
  default: [
    {
      id: 'ind_def_1',
      description: 'Key stakeholder communications and decisions',
      type: 'stakeholder_intelligence',
      source: 'Meeting minutes, executive communications',
      frequency: 'As needed'
    },
    {
      id: 'ind_def_2',
      description: 'Resource availability and allocation status',
      type: 'resource_tracking',
      source: 'Project management, resource planning',
      frequency: 'Weekly updates'
    },
    {
      id: 'ind_def_3',
      description: 'Risk assessment updates and mitigation status',
      type: 'risk_intelligence',
      source: 'Risk management, project reviews',
      frequency: 'Monthly review'
    }
  ]
};

/**
 * Analyzes decision context to determine PIR type
 */
function analyzeDecisionContext(decision) {
  const title = decision.title.toLowerCase();
  const description = decision.description.toLowerCase();
  
  if (title.includes('market') || title.includes('location') || description.includes('market')) {
    return { type: 'market_entry' };
  } else if (title.includes('partner') || title.includes('distribution') || description.includes('partnership')) {
    return { type: 'partnership' };
  } else if (title.includes('talent') || title.includes('hire') || description.includes('staffing')) {
    return { type: 'staffing' };
  } else if (title.includes('launch') || title.includes('timing') || description.includes('timing')) {
    return { type: 'timing' };
  } else if (title.includes('marketing') || title.includes('budget') || description.includes('marketing')) {
    return { type: 'marketing' };
  }
  
  return { type: 'default' };
}

/**
 * Creates PIRs for a specific decision point
 */
function createPIRsForDecision(decision) {
  const decisionContext = analyzeDecisionContext(decision);
  return PIR_TEMPLATES[decisionContext.type] || PIR_TEMPLATES.default;
}

/**
 * Analyzes PIR to determine indicator type
 */
function analyzePIRType(pir) {
  const question = pir.question.toLowerCase();
  
  if (question.includes('regulatory') || question.includes('legal')) {
    return 'regulatory';
  } else if (question.includes('cost') || question.includes('budget') || question.includes('financial')) {
    return 'financial';
  } else if (question.includes('competitive') || question.includes('market')) {
    return 'competitive';
  } else if (question.includes('talent') || question.includes('staff') || question.includes('compensation')) {
    return 'human_resources';
  } else if (question.includes('infrastructure') || question.includes('capabilities')) {
    return 'operational';
  } else if (question.includes('partner') || question.includes('stakeholder')) {
    return 'partnership';
  }
  
  return 'default';
}

/**
 * Creates indicators for a specific PIR
 */
function createIndicatorsForPIR(pir) {
  const pirType = analyzePIRType(pir);
  return INDICATOR_TEMPLATES[pirType] || INDICATOR_TEMPLATES.default;
}

/**
 * Main PIR Workflow object
 */
const PIRWorkflow = {
  
  // Generate PIRs based on decision points
  generatePIRs: function(decisionPoints) {
    const pirsByDecision = {};
    
    decisionPoints.forEach(decision => {
      pirsByDecision[decision.id] = createPIRsForDecision(decision);
    });
    
    return pirsByDecision;
  },

  // Generate indicators for PIRs
  generateIndicators: function(pirsByDecision) {
    const indicatorsByPIR = {};
    
    Object.keys(pirsByDecision).forEach(decisionId => {
      pirsByDecision[decisionId].forEach(pir => {
        indicatorsByPIR[pir.id] = createIndicatorsForPIR(pir);
      });
    });
    
    return indicatorsByPIR;
  },

  // Complete workflow to generate PIRs and indicators
  executeWorkflow: function(decisionPoints) {
    const pirs = this.generatePIRs(decisionPoints);
    const indicators = this.generateIndicators(pirs);
    
    return {
      pirs,
      indicators,
      summary: {
        totalDecisions: decisionPoints.length,
        totalPIRs: Object.values(pirs).flat().length,
        totalIndicators: Object.values(indicators).flat().length
      }
    };
  }
};

/**
 * React component for PIR visualization
 */
const PIRVisualization = ({ decisionPoints, workflowData, styles }) => {
  if (!workflowData) {
    return null;
  }

  const { pirs, indicators } = workflowData;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>
        Priority Intelligence Requirements & Indicators
      </h3>
      
      {decisionPoints.map(decision => (
        <div key={decision.id} style={{ marginBottom: '30px' }}>
          <div style={{
            backgroundColor: '#4299e1',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontWeight: '600'
          }}>
            Decision: {decision.title}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {pirs[decision.id] && pirs[decision.id].map(pir => (
              <div key={pir.id} style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '15px'
              }}>
                <div style={{
                  backgroundColor: '#48bb78',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  PIR: {pir.question}
                </div>
                
                <div style={{ paddingLeft: '20px' }}>
                  <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                    Priority: {pir.priority} | Timeframe: {pir.timeframe}
                  </div>
                  
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Indicators:
                  </div>
                  
                  {indicators[pir.id] && indicators[pir.id].map(indicator => (
                    <div key={indicator.id} style={{
                      backgroundColor: '#ffd89b',
                      padding: '8px',
                      borderRadius: '4px',
                      marginBottom: '5px',
                      fontSize: '12px'
                    }}>
                      <div style={{ fontWeight: '500' }}>{indicator.description}</div>
                      <div style={{ color: '#666', marginTop: '2px' }}>
                        Source: {indicator.source} | {indicator.frequency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Exports
export { PIRWorkflow, PIRVisualization };
export default PIRWorkflow;