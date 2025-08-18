// ffir_workflow.jsx
import React from 'react';

/**
 * FFIR Workflow Engine - Generates Friendly Force Information Requirements and Company Status Indicators
 * This module analyzes decision points and creates actionable internal readiness requirements
 */

// FFIR Generation Templates - Focus on internal capabilities and readiness
const FFIR_TEMPLATES = {
  market_entry: [
    {
      id: 'ffir_market_1',
      question: 'Do we have sufficient financial resources allocated for market entry?',
      type: 'readiness_assessment',
      priority: 'high',
      timeframe: '15 days',
      category: 'financial'
    },
    {
      id: 'ffir_market_2',
      question: 'Is our team equipped with necessary regional expertise and language capabilities?',
      type: 'capability_assessment',
      priority: 'high',
      timeframe: '30 days',
      category: 'personnel'
    },
    {
      id: 'ffir_market_3',
      question: 'Are our operational systems ready to support international expansion?',
      type: 'infrastructure_assessment',
      priority: 'medium',
      timeframe: '45 days',
      category: 'operational'
    },
    {
      id: 'ffir_market_4',
      question: 'Do we have legal and compliance frameworks ready for new market regulations?',
      type: 'compliance_readiness',
      priority: 'high',
      timeframe: '30 days',
      category: 'strategic'
    }
  ],
  partnership: [
    {
      id: 'ffir_partner_1',
      question: 'Do we have dedicated personnel available to manage partnership relationships?',
      type: 'resource_allocation',
      priority: 'high',
      timeframe: '20 days',
      category: 'personnel'
    },
    {
      id: 'ffir_partner_2',
      question: 'Are our internal processes capable of supporting partnership integration?',
      type: 'process_readiness',
      priority: 'medium',
      timeframe: '30 days',
      category: 'operational'
    },
    {
      id: 'ffir_partner_3',
      question: 'Is our technology infrastructure compatible with potential partner systems?',
      type: 'technical_compatibility',
      priority: 'high',
      timeframe: '25 days',
      category: 'operational'
    }
  ],
  staffing: [
    {
      id: 'ffir_staff_1',
      question: 'Do we have budget allocated for additional hiring and onboarding costs?',
      type: 'budget_availability',
      priority: 'high',
      timeframe: '15 days',
      category: 'financial'
    },
    {
      id: 'ffir_staff_2',
      question: 'Is our HR infrastructure ready to handle increased recruitment volume?',
      type: 'capacity_assessment',
      priority: 'medium',
      timeframe: '30 days',
      category: 'operational'
    },
    {
      id: 'ffir_staff_3',
      question: 'Are our training and development programs scalable for new team members?',
      type: 'scalability_assessment',
      priority: 'medium',
      timeframe: '45 days',
      category: 'operational'
    }
  ],
  timing: [
    {
      id: 'ffir_timing_1',
      question: 'Are our current project timelines flexible enough to accommodate new initiatives?',
      type: 'capacity_planning',
      priority: 'high',
      timeframe: '10 days',
      category: 'operational'
    },
    {
      id: 'ffir_timing_2',
      question: 'Do we have contingency funding available for accelerated timelines?',
      type: 'financial_flexibility',
      priority: 'high',
      timeframe: '15 days',
      category: 'financial'
    },
    {
      id: 'ffir_timing_3',
      question: 'Is our leadership team aligned and available for decision-making during critical phases?',
      type: 'governance_readiness',
      priority: 'high',
      timeframe: '20 days',
      category: 'strategic'
    }
  ],
  marketing: [
    {
      id: 'ffir_marketing_1',
      question: 'Do we have sufficient marketing budget allocated for the proposed channels?',
      type: 'budget_verification',
      priority: 'high',
      timeframe: '15 days',
      category: 'financial'
    },
    {
      id: 'ffir_marketing_2',
      question: 'Is our marketing team equipped with skills for the selected channels?',
      type: 'skill_assessment',
      priority: 'high',
      timeframe: '20 days',
      category: 'personnel'
    },
    {
      id: 'ffir_marketing_3',
      question: 'Are our analytics and measurement systems ready to track campaign performance?',
      type: 'measurement_readiness',
      priority: 'medium',
      timeframe: '25 days',
      category: 'operational'
    }
  ],
  default: [
    {
      id: 'ffir_default_1',
      question: 'Do we have adequate financial reserves to support this initiative?',
      type: 'financial_readiness',
      priority: 'high',
      timeframe: '15 days',
      category: 'financial'
    },
    {
      id: 'ffir_default_2',
      question: 'Is our organizational bandwidth sufficient to take on additional workload?',
      type: 'capacity_assessment',
      priority: 'high',
      timeframe: '20 days',
      category: 'personnel'
    },
    {
      id: 'ffir_default_3',
      question: 'Are our operational systems and processes ready to support expansion?',
      type: 'infrastructure_readiness',
      priority: 'medium',
      timeframe: '30 days',
      category: 'operational'
    }
  ]
};

// Company Status Indicator Templates - Internal metrics and readiness indicators
const COMPANY_INDICATOR_TEMPLATES = {
  financial: [
    {
      id: 'comp_fin_1',
      description: 'Monthly cash flow statements and burn rate analysis',
      type: 'financial_metric',
      source: 'Finance department, accounting systems',
      frequency: 'Monthly review',
      measurement: 'Cash position, runway months'
    },
    {
      id: 'comp_fin_2',
      description: 'Budget utilization rates by department and project',
      type: 'budget_tracking',
      source: 'Financial management systems, project reports',
      frequency: 'Weekly updates',
      measurement: 'Percentage budget utilized vs allocated'
    },
    {
      id: 'comp_fin_3',
      description: 'Credit facility availability and terms status',
      type: 'credit_availability',
      source: 'Banking relationships, finance team',
      frequency: 'Monthly assessment',
      measurement: 'Available credit, terms conditions'
    }
  ],
  personnel: [
    {
      id: 'comp_per_1',
      description: 'Team capacity utilization and availability metrics',
      type: 'capacity_tracking',
      source: 'Project management tools, HR systems',
      frequency: 'Weekly analysis',
      measurement: 'Utilization rates, available hours'
    },
    {
      id: 'comp_per_2',
      description: 'Skill gap analysis and training completion rates',
      type: 'capability_assessment',
      source: 'HR assessments, training records',
      frequency: 'Quarterly review',
      measurement: 'Skill ratings, training progress'
    },
    {
      id: 'comp_per_3',
      description: 'Key personnel availability and succession planning status',
      type: 'personnel_risk',
      source: 'HR planning, leadership team',
      frequency: 'Monthly check',
      measurement: 'Key person dependencies, backup plans'
    }
  ],
  operational: [
    {
      id: 'comp_ops_1',
      description: 'System performance metrics and capacity thresholds',
      type: 'infrastructure_monitoring',
      source: 'IT monitoring tools, system logs',
      frequency: 'Real-time monitoring',
      measurement: 'System load, response times, capacity'
    },
    {
      id: 'comp_ops_2',
      description: 'Process efficiency metrics and bottleneck identification',
      type: 'process_performance',
      source: 'Operations metrics, workflow analysis',
      frequency: 'Weekly assessment',
      measurement: 'Process completion times, error rates'
    },
    {
      id: 'comp_ops_3',
      description: 'Vendor relationship health and service level compliance',
      type: 'vendor_performance',
      source: 'Vendor reports, contract management',
      frequency: 'Monthly review',
      measurement: 'SLA compliance, relationship scores'
    }
  ],
  strategic: [
    {
      id: 'comp_str_1',
      description: 'Leadership decision-making speed and consensus tracking',
      type: 'governance_efficiency',
      source: 'Meeting minutes, decision logs',
      frequency: 'Weekly analysis',
      measurement: 'Decision cycle time, consensus rate'
    },
    {
      id: 'comp_str_2',
      description: 'Stakeholder alignment and support measurement',
      type: 'stakeholder_assessment',
      source: 'Stakeholder surveys, feedback sessions',
      frequency: 'Monthly evaluation',
      measurement: 'Alignment scores, support levels'
    },
    {
      id: 'comp_str_3',
      description: 'Risk tolerance levels and mitigation capability status',
      type: 'risk_readiness',
      source: 'Risk management reports, leadership input',
      frequency: 'Quarterly assessment',
      measurement: 'Risk appetite, mitigation readiness'
    }
  ],
  default: [
    {
      id: 'comp_def_1',
      description: 'Overall organizational readiness score and capacity index',
      type: 'readiness_dashboard',
      source: 'Cross-functional metrics, leadership assessment',
      frequency: 'Weekly summary',
      measurement: 'Composite readiness score'
    },
    {
      id: 'comp_def_2',
      description: 'Resource allocation efficiency and optimization opportunities',
      type: 'resource_optimization',
      source: 'Resource planning tools, utilization reports',
      frequency: 'Bi-weekly analysis',
      measurement: 'Resource efficiency ratios'
    },
    {
      id: 'comp_def_3',
      description: 'Change management capability and adaptation speed',
      type: 'adaptability_metric',
      source: 'Change management tracking, team feedback',
      frequency: 'Monthly review',
      measurement: 'Change adoption rates, adaptation time'
    }
  ]
};

/**
 * Analyzes decision context to determine FFIR type (same logic as PIR)
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
 * Creates FFIRs for a specific decision point
 */
function createFFIRsForDecision(decision) {
  const decisionContext = analyzeDecisionContext(decision);
  return FFIR_TEMPLATES[decisionContext.type] || FFIR_TEMPLATES.default;
}

/**
 * Analyzes FFIR to determine company indicator type
 */
function analyzeFFIRType(ffir) {
  const question = ffir.question.toLowerCase();
  
  if (question.includes('financial') || question.includes('budget') || question.includes('funding') || question.includes('cost')) {
    return 'financial';
  } else if (question.includes('team') || question.includes('personnel') || question.includes('staff') || question.includes('skill')) {
    return 'personnel';
  } else if (question.includes('system') || question.includes('process') || question.includes('infrastructure') || question.includes('operational')) {
    return 'operational';
  } else if (question.includes('leadership') || question.includes('stakeholder') || question.includes('governance') || question.includes('alignment')) {
    return 'strategic';
  }
  
  return 'default';
}

/**
 * Creates company status indicators for a specific FFIR
 */
function createIndicatorsForFFIR(ffir) {
  const ffirType = analyzeFFIRType(ffir);
  return COMPANY_INDICATOR_TEMPLATES[ffirType] || COMPANY_INDICATOR_TEMPLATES.default;
}

/**
 * Main FFIR Workflow object
 */
const FFIRWorkflow = {
  
  // Generate FFIRs based on decision points
  generateFFIRs: function(decisionPoints) {
    const ffirsByDecision = {};
    
    decisionPoints.forEach(decision => {
      ffirsByDecision[decision.id] = createFFIRsForDecision(decision);
    });
    
    return ffirsByDecision;
  },

  // Generate company status indicators for FFIRs
  generateCompanyIndicators: function(ffirsByDecision) {
    const indicatorsByFFIR = {};
    
    Object.keys(ffirsByDecision).forEach(decisionId => {
      ffirsByDecision[decisionId].forEach(ffir => {
        indicatorsByFFIR[ffir.id] = createIndicatorsForFFIR(ffir);
      });
    });
    
    return indicatorsByFFIR;
  },

  // Complete workflow to generate FFIRs and company indicators
  executeWorkflow: function(decisionPoints) {
    const ffirs = this.generateFFIRs(decisionPoints);
    const companyIndicators = this.generateCompanyIndicators(ffirs);
    
    return {
      ffirs,
      companyIndicators,
      summary: {
        totalDecisions: decisionPoints.length,
        totalFFIRs: Object.values(ffirs).flat().length,
        totalCompanyIndicators: Object.values(companyIndicators).flat().length
      }
    };
  }
};

/**
 * React component for FFIR visualization
 */
const FFIRVisualization = ({ decisionPoints, workflowData, styles }) => {
  if (!workflowData) {
    return null;
  }

  const { ffirs, companyIndicators } = workflowData;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>
        Friendly Force Information Requirements & Company Status Indicators
      </h3>
      
      {decisionPoints.map(decision => (
        <div key={decision.id} style={{ marginBottom: '30px' }}>
          <div style={{
            backgroundColor: '#805ad5',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontWeight: '600'
          }}>
            Decision: {decision.title}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {ffirs[decision.id] && ffirs[decision.id].map(ffir => (
              <div key={ffir.id} style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '15px'
              }}>
                <div style={{
                  backgroundColor: '#9f7aea',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  FFIR: {ffir.question}
                </div>
                
                <div style={{ paddingLeft: '20px' }}>
                  <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                    Priority: {ffir.priority} | Timeframe: {ffir.timeframe} | Category: {ffir.category}
                  </div>
                  
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Company Status Indicators:
                  </div>
                  
                  {companyIndicators[ffir.id] && companyIndicators[ffir.id].map(indicator => (
                    <div key={indicator.id} style={{
                      backgroundColor: '#e6fffa',
                      border: '1px solid #4fd1c7',
                      padding: '8px',
                      borderRadius: '4px',
                      marginBottom: '5px',
                      fontSize: '12px'
                    }}>
                      <div style={{ fontWeight: '500' }}>{indicator.description}</div>
                      <div style={{ color: '#666', marginTop: '2px' }}>
                        <div>Source: {indicator.source}</div>
                        <div>Frequency: {indicator.frequency}</div>
                        <div>Measurement: {indicator.measurement}</div>
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
export { FFIRWorkflow, FFIRVisualization };
export default FFIRWorkflow;