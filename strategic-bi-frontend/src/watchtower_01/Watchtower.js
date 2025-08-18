import React, { useState, useCallback } from 'react';
import { 
  ChevronRight, 
  Settings,
  X,
  Maximize2,
  Minimize2,
  Brain,
  GitBranch,
  Target,
  TrendingUp
} from 'lucide-react';

// Import UI components
import { 
  FileExplorer, 
  FlowchartVisualization, 
  AnalysisPanel, 
  getStyles 
} from './watchtower_ui.jsx';

// Import PIR Workflow
import { PIRWorkflow, PIRVisualization } from './pir_workflow.jsx';

// Import FFIR Workflow  
import { FFIRWorkflow, FFIRVisualization } from './ffir_workflow.jsx';

// Import Supabase client
import { supabase } from './supabaseClient.js';

// Original mock data as fallback
const originalMockAnalysis = {
  objective: "Expand market presence in Southeast Asia",
  keyFactors: [
    "Market penetration rates",
    "Regulatory environment", 
    "Competition analysis",
    "Cultural considerations",
    "Economic stability",
    "Infrastructure readiness"
  ],
  decisionPoints: [
    {
      id: 1,
      title: "Should we establish operations in Singapore or Thailand first?",
      description: "Primary market entry location will determine our regional expansion strategy and resource allocation",
      options: ["Singapore (stable, higher costs)", "Thailand (growing market, lower costs)", "Simultaneous entry (higher risk)"]
    },
    {
      id: 2,
      title: "Should we partner with local distributors or build our own distribution network?",
      description: "Distribution strategy will affect market reach, control, and long-term profitability",
      options: ["Local partnership (faster entry)", "Own network (more control)", "Hybrid approach (balanced risk)"]
    },
    {
      id: 3,
      title: "Should we hire local talent or relocate existing employees to manage operations?",
      description: "Staffing strategy impacts cultural integration, costs, and operational effectiveness",
      options: ["Hire locally (cultural fit)", "Relocate employees (known capabilities)", "Mixed team approach"]
    }
  ]
};

const StrategicBITool = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    objective: '',
    context: '',
    links: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [pirWorkflowData, setPirWorkflowData] = useState(null);
  const [pirProcessing, setPirProcessing] = useState(false);
  const [ffirWorkflowData, setFfirWorkflowData] = useState(null);
  const [ffirProcessing, setFfirProcessing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(originalMockAnalysis);

  // Get styles from UI module
  const styles = getStyles();

  // Stable input handler with useCallback
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Helper function to extract key factors from the objective and context
  const extractKeyFactors = (objective, context) => {
    const factors = ["Strategic considerations", "Market dynamics", "Competitive landscape"];
    
    const obj = objective.toLowerCase();
    const ctx = (context || '').toLowerCase();
    const combined = `${obj} ${ctx}`;
    
    if (combined.includes('market') || combined.includes('expansion')) {
      factors.push("Market penetration analysis", "Regional considerations");
    }
    if (combined.includes('cost') || combined.includes('budget')) {
      factors.push("Cost optimization", "Resource allocation");
    }
    if (combined.includes('partner') || combined.includes('acquisition')) {
      factors.push("Partnership evaluation", "Integration complexity");
    }
    if (combined.includes('product') || combined.includes('service')) {
      factors.push("Product development", "Service delivery");
    }
    if (combined.includes('technology') || combined.includes('digital')) {
      factors.push("Technology infrastructure", "Digital transformation");
    }
    
    factors.push("Implementation timeline", "Risk assessment");
    
    return factors.slice(0, 6); // Keep it manageable
  };

  // Enhanced fallback decision generation
  const generateContextualFallback = (objective, context) => {
    const obj = objective.toLowerCase();
    const ctx = (context || '').toLowerCase();
    const combined = `${obj} ${ctx}`;
    
    const decisions = [];
    
    // Market-related decisions
    if (combined.includes('market') || combined.includes('expansion') || combined.includes('enter')) {
      decisions.push({
        id: decisions.length + 1,
        title: "Which target markets should we prioritize for entry?",
        description: "Market selection affects resource allocation, regulatory requirements, and competitive positioning.",
        options: ["Primary market focus", "Multi-market approach", "Phased market entry"]
      });
    }
    
    // Partnership/acquisition decisions
    if (combined.includes('partner') || combined.includes('acquisition') || combined.includes('merge')) {
      decisions.push({
        id: decisions.length + 1,
        title: "Should we pursue partnerships or independent development?",
        description: "Partnership strategy impacts speed to market, resource requirements, and strategic control.",
        options: ["Strategic partnerships", "Independent development", "Hybrid approach"]
      });
    }
    
    // Technology decisions
    if (combined.includes('technology') || combined.includes('digital') || combined.includes('system')) {
      decisions.push({
        id: decisions.length + 1,
        title: "What technology infrastructure approach should we adopt?",
        description: "Technology choices affect scalability, costs, and competitive advantages.",
        options: ["Build internal capabilities", "Leverage external platforms", "Hybrid technology stack"]
      });
    }
    
    // Resource allocation decisions
    decisions.push({
      id: decisions.length + 1,
      title: "How should we allocate resources to maximize strategic impact?",
      description: "Resource allocation determines execution speed and competitive positioning.",
      options: ["Concentrated investment", "Distributed approach", "Phased resource deployment"]
    });
    
    // Timeline decisions
    decisions.push({
      id: decisions.length + 1,
      title: "What implementation timeline optimizes success probability?",
      description: "Timeline affects competitive advantage, resource efficiency, and execution risk.",
      options: ["Aggressive timeline", "Conservative approach", "Milestone-driven phases"]
    });
    
    return decisions.slice(0, 4); // Return up to 4 decisions
  };

  const handleAnalyze = useCallback(async () => {
    if (!formData.objective.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setPirWorkflowData(null);
    setFfirWorkflowData(null);
    
    try {
      console.log('Calling Edge Function with:', {
        strategic_intent: formData.objective,
        context_description: formData.context,
        context_links: formData.links
      });

      // Call your Supabase Edge Function to get real AI data
      const { data, error } = await supabase.functions.invoke('process-intent', {
        body: {
          strategic_intent: formData.objective,
          context_description: formData.context,
          context_links: formData.links
        }
      });

      console.log('Edge Function response:', { data, error });

      let aiDecisionPoints;
      
      if (error) {
        console.error(`Supabase function error: ${error.message}`);
        // If it's a fallback response from the edge function, use it
        if (error.fallback && Array.isArray(data)) {
          aiDecisionPoints = data;
        } else {
          throw new Error(`Supabase function error: ${error.message}`);
        }
      } else {
        // Use the AI-generated decision points
        aiDecisionPoints = data;
      }
      
      if (!aiDecisionPoints || !Array.isArray(aiDecisionPoints)) {
        throw new Error('Invalid response format from AI');
      }

      console.log('AI Decision Points:', aiDecisionPoints);
      
      // Transform AI response to match app's expected format
      const transformedDecisionPoints = aiDecisionPoints.map((point, index) => ({
        id: index + 1,
        title: point.question,
        description: point.description,
        options: point.options || ["Option A", "Option B", "Option C"] // Use AI options if provided
      }));

      // Create analysis with real user input and AI-generated decision points
      const realAnalysis = {
        objective: formData.objective,
        keyFactors: extractKeyFactors(formData.objective, formData.context),
        decisionPoints: transformedDecisionPoints
      };

      // Update the current analysis state
      setCurrentAnalysis(realAnalysis);

      // Continue with workflow processing
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
        
        // After analysis complete, start PIR workflow
        setPirProcessing(true);
        
        // Generate PIR workflow data with real decision points
        setTimeout(() => {
          try {
            const workflowData = PIRWorkflow.executeWorkflow(realAnalysis.decisionPoints);
            setPirWorkflowData(workflowData);
            setPirProcessing(false);
            
            // Start FFIR workflow after PIR completes
            setFfirProcessing(true);
            
            setTimeout(() => {
              try {
                const ffirData = FFIRWorkflow.executeWorkflow(realAnalysis.decisionPoints);
                setFfirWorkflowData(ffirData);
                setFfirProcessing(false);
              } catch (error) {
                console.error('FFIR Workflow Error:', error);
                setFfirProcessing(false);
                setFfirWorkflowData({
                  ffirs: {},
                  companyIndicators: {},
                  summary: { totalDecisions: 0, totalFFIRs: 0, totalCompanyIndicators: 0 }
                });
              }
            }, 1500);
            
          } catch (error) {
            console.error('PIR Workflow Error:', error);
            setPirProcessing(false);
            setPirWorkflowData({
              pirs: {},
              indicators: {},
              summary: { totalDecisions: 0, totalPIRs: 0, totalIndicators: 0 }
            });
          }
        }, 2000);
      }, 1000);
      
    } catch (error) {
      console.error('Analysis Error:', error);
      setIsAnalyzing(false);
      
      // Enhanced fallback logic
      console.log('API failed, using enhanced fallback data generation');
      
      const fallbackDecisionPoints = generateContextualFallback(formData.objective, formData.context);

      const fallbackAnalysis = {
        objective: formData.objective,
        keyFactors: extractKeyFactors(formData.objective, formData.context),
        decisionPoints: fallbackDecisionPoints
      };

      setCurrentAnalysis(fallbackAnalysis);
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
        
        setPirProcessing(true);
        setTimeout(() => {
          try {
            const workflowData = PIRWorkflow.executeWorkflow(fallbackAnalysis.decisionPoints);
            setPirWorkflowData(workflowData);
            setPirProcessing(false);
            
            setFfirProcessing(true);
            setTimeout(() => {
              try {
                const ffirData = FFIRWorkflow.executeWorkflow(fallbackAnalysis.decisionPoints);
                setFfirWorkflowData(ffirData);
                setFfirProcessing(false);
              } catch (error) {
                console.error('FFIR Workflow Error:', error);
                setFfirProcessing(false);
              }
            }, 1500);
            
          } catch (error) {
            console.error('PIR Workflow Error:', error);
            setPirProcessing(false);
          }
        }, 2000);
      }, 1000);
    }
  }, [formData.objective, formData.context, formData.links]);

  // PIR Decision Flow Component
  const PIRDecisionFlow = () => (
    <div style={{
      height: '100%',
      padding: '20px',
      overflow: 'auto',
      backgroundColor: '#f8f9fa'
    }}>
      {isAnalyzing || pirProcessing ? (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #4299e1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{ color: '#666', fontSize: '16px' }}>
            Generating PIR Decision Flow...
          </div>
        </div>
      ) : !analysisComplete ? (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '16px'
        }}>
          Complete analysis to view PIR decision flow
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>
            PIR Strategic Decision Flow
          </h3>
          
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '30px',
            padding: '20px',
            minHeight: '400px'
          }}>
            {/* Decision Points Column */}
            <div style={{ minWidth: '300px' }}>
              <h4 style={{ 
                backgroundColor: '#4299e1', 
                color: 'white', 
                padding: '10px', 
                borderRadius: '6px',
                textAlign: 'center',
                marginBottom: '15px'
              }}>
                Decision Points
              </h4>
              {currentAnalysis.decisionPoints.map((decision) => (
                <div key={decision.id} style={{
                  backgroundColor: '#e6f3ff',
                  border: '2px solid #4299e1',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  position: 'relative'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#000' }}>
                    {decision.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {decision.description}
                  </div>
                  <div style={{
                    position: 'absolute',
                    right: '-25px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '20px',
                    color: '#4299e1'
                  }}>
                    →
                  </div>
                </div>
              ))}
            </div>

            {/* PIRs Column */}
            {pirWorkflowData && (
              <div style={{ minWidth: '350px' }}>
                <h4 style={{ 
                  backgroundColor: '#48bb78', 
                  color: 'white', 
                  padding: '10px', 
                  borderRadius: '6px',
                  textAlign: 'center',
                  marginBottom: '15px'
                }}>
                  Priority Intelligence Requirements
                </h4>
                {Object.keys(pirWorkflowData.pirs).map(decisionId => (
                  <div key={`pir-${decisionId}`} style={{ marginBottom: '20px' }}>
                    {pirWorkflowData.pirs[decisionId]?.map(pir => (
                      <div key={pir.id} style={{
                        backgroundColor: '#f0fff4',
                        border: '2px solid #48bb78',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '10px',
                        position: 'relative'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#000' }}>
                          {pir.question}
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#666',
                          display: 'flex',
                          gap: '10px'
                        }}>
                          <span>Priority: {pir.priority}</span>
                          <span>|</span>
                          <span>{pir.timeframe}</span>
                        </div>
                        <div style={{
                          position: 'absolute',
                          right: '-25px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '18px',
                          color: '#48bb78'
                        }}>
                          →
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* External Indicators Column */}
            {pirWorkflowData && (
              <div style={{ minWidth: '380px' }}>
                <h4 style={{ 
                  backgroundColor: '#ed8936', 
                  color: 'white', 
                  padding: '10px', 
                  borderRadius: '6px',
                  textAlign: 'center',
                  marginBottom: '15px'
                }}>
                  External Indicators
                </h4>
                {Object.keys(pirWorkflowData.pirs).map(decisionId => (
                  <div key={`ind-${decisionId}`} style={{ marginBottom: '20px' }}>
                    {pirWorkflowData.pirs[decisionId]?.map(pir => (
                      <div key={`indicators-${pir.id}`} style={{ marginBottom: '15px' }}>
                        {pirWorkflowData.indicators[pir.id]?.map(indicator => (
                          <div key={indicator.id} style={{
                            backgroundColor: '#fffaf0',
                            border: '2px solid #ed8936',
                            borderRadius: '8px',
                            padding: '10px',
                            marginBottom: '8px'
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '12px', color: '#000' }}>
                              {indicator.description}
                            </div>
                            <div style={{ fontSize: '10px', color: '#666' }}>
                              <div>Source: {indicator.source}</div>
                              <div>Frequency: {indicator.frequency}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // FFIR Decision Flow Component
  const FFIRDecisionFlow = () => (
    <div style={{
      height: '100%',
      padding: '20px',
      overflow: 'auto',
      backgroundColor: '#f8f9fa'
    }}>
      {isAnalyzing || pirProcessing || ffirProcessing ? (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #805ad5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{ color: '#666', fontSize: '16px' }}>
            Generating FFIR Decision Flow...
          </div>
        </div>
      ) : !ffirWorkflowData ? (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '16px'
        }}>
          Complete analysis to view FFIR decision flow
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>
            FFIR Strategic Decision Flow
          </h3>
          
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '30px',
            padding: '20px',
            minHeight: '400px'
          }}>
            {/* Decision Points Column */}
            <div style={{ minWidth: '300px' }}>
              <h4 style={{ 
                backgroundColor: '#4299e1', 
                color: 'white', 
                padding: '10px', 
                borderRadius: '6px',
                textAlign: 'center',
                marginBottom: '15px'
              }}>
                Decision Points
              </h4>
              {currentAnalysis.decisionPoints.map((decision) => (
                <div key={decision.id} style={{
                  backgroundColor: '#e6f3ff',
                  border: '2px solid #4299e1',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  position: 'relative'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#000' }}>
                    {decision.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {decision.description}
                  </div>
                  <div style={{
                    position: 'absolute',
                    right: '-25px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '20px',
                    color: '#4299e1'
                  }}>
                    →
                  </div>
                </div>
              ))}
            </div>

            {/* FFIRs Column */}
            {ffirWorkflowData && (
              <div style={{ minWidth: '380px' }}>
                <h4 style={{ 
                  backgroundColor: '#805ad5', 
                  color: 'white', 
                  padding: '10px', 
                  borderRadius: '6px',
                  textAlign: 'center',
                  marginBottom: '15px'
                }}>
                  Friendly Force Information Requirements
                </h4>
                {Object.keys(ffirWorkflowData.ffirs).map(decisionId => (
                  <div key={`ffir-${decisionId}`} style={{ marginBottom: '20px' }}>
                    {ffirWorkflowData.ffirs[decisionId]?.map(ffir => (
                      <div key={ffir.id} style={{
                        backgroundColor: '#faf5ff',
                        border: '2px solid #805ad5',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '10px',
                        position: 'relative'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#000' }}>
                          {ffir.question}
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#666',
                          display: 'flex',
                          gap: '10px'
                        }}>
                          <span>Priority: {ffir.priority}</span>
                          <span>|</span>
                          <span>{ffir.timeframe}</span>
                          <span>|</span>
                          <span>{ffir.category}</span>
                        </div>
                        <div style={{
                          position: 'absolute',
                          right: '-25px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '18px',
                          color: '#805ad5'
                        }}>
                          →
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Company Status Indicators Column */}
            {ffirWorkflowData && (
              <div style={{ minWidth: '400px' }}>
                <h4 style={{ 
                  backgroundColor: '#38b2ac', 
                  color: 'white', 
                  padding: '10px', 
                  borderRadius: '6px',
                  textAlign: 'center',
                  marginBottom: '15px'
                }}>
                  Company Status Indicators
                </h4>
                {Object.keys(ffirWorkflowData.ffirs).map(decisionId => (
                  <div key={`comp-ind-${decisionId}`} style={{ marginBottom: '20px' }}>
                    {ffirWorkflowData.ffirs[decisionId]?.map(ffir => (
                      <div key={`comp-indicators-${ffir.id}`} style={{ marginBottom: '15px' }}>
                        {ffirWorkflowData.companyIndicators[ffir.id]?.map(indicator => (
                          <div key={indicator.id} style={{
                            backgroundColor: '#e6fffa',
                            border: '2px solid #38b2ac',
                            borderRadius: '8px',
                            padding: '10px',
                            marginBottom: '8px'
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '12px', color: '#000' }}>
                              {indicator.description}
                            </div>
                            <div style={{ fontSize: '10px', color: '#666' }}>
                              <div>Source: {indicator.source}</div>
                              <div>Frequency: {indicator.frequency}</div>
                              <div>Measurement: {indicator.measurement}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Add CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Title Bar */}
      <div style={styles.titleBar}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={styles.windowControls}>
            <div style={{...styles.windowButton, ...styles.redButton}}></div>
            <div style={{...styles.windowButton, ...styles.yellowButton}}></div>
            <div style={{...styles.windowButton, ...styles.greenButton}}></div>
          </div>
          <div style={{fontWeight: '600'}}>Aletheia Watchtower</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#969696'}}>
          <Settings size={16} style={{cursor: 'pointer'}} />
          <Minimize2 size={16} style={{cursor: 'pointer'}} />
          <Maximize2 size={16} style={{cursor: 'pointer'}} />
          <X size={16} style={{cursor: 'pointer'}} />
        </div>
      </div>

      <div style={styles.mainContent}>
        <FileExplorer sidebarCollapsed={sidebarCollapsed} styles={styles} />

        <div style={styles.contentArea}>
          <div style={styles.tabBar}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={styles.sidebarToggle}
            >
              <ChevronRight 
                style={{
                  transform: !sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
                size={16} 
              />
            </button>
            
            <div style={{display: 'flex', flex: 1}}>
              {[
                { id: 'analysis', label: 'Analysis', icon: Brain },
                { id: 'pir_flow', label: 'PIR Decision Flow', icon: GitBranch },
                { id: 'pir', label: 'PIR Analysis', icon: Target },
                { id: 'ffir_flow', label: 'FFIR Decision Flow', icon: GitBranch },
                { id: 'ffir', label: 'FFIR Analysis', icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab.id ? styles.activeTab : {})
                  }}
                >
                  <tab.icon size={14} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <X size={12} style={{marginLeft: '8px', cursor: 'pointer'}} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{flex: 1}}>
            {activeTab === 'analysis' && (
              <AnalysisPanel 
                formData={formData} 
                handleInputChange={handleInputChange}
                handleAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                analysisComplete={analysisComplete}
                styles={styles}
                mockAnalysis={currentAnalysis}
              />
            )}
            {activeTab === 'pir_flow' && <PIRDecisionFlow />}
            {activeTab === 'pir' && (
              <div style={{height: '100%', overflow: 'auto'}}>
                {!pirWorkflowData ? (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '16px'
                  }}>
                    Complete analysis to view PIR workflow
                  </div>
                ) : (
                  <PIRVisualization 
                    decisionPoints={currentAnalysis.decisionPoints}
                    workflowData={pirWorkflowData}
                    styles={styles}
                  />
                )}
              </div>
            )}
            {activeTab === 'ffir_flow' && <FFIRDecisionFlow />}
            {activeTab === 'ffir' && (
              <div style={{height: '100%', overflow: 'auto'}}>
                {!ffirWorkflowData ? (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '16px'
                  }}>
                    Complete analysis to view FFIR workflow
                  </div>
                ) : (
                  <FFIRVisualization 
                    decisionPoints={currentAnalysis.decisionPoints}
                    workflowData={ffirWorkflowData}
                    styles={styles}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.statusBar}>
        <div style={styles.statusLeft}>
          <div style={styles.statusIndicator}>
            <div style={styles.statusDot}></div>
            <span>System Online</span>
          </div>
          <div>
            {ffirProcessing ? 'Generating FFIR Analysis...' :
             pirProcessing ? 'Generating PIR Analysis...' : 
             analysisComplete ? 'Analysis Complete' : 
             isAnalyzing ? 'Processing...' : 'Ready for Analysis'}
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <span>Strategic Intelligence v2.1</span>
          <span>Claude AI Engine</span>
          {pirWorkflowData && (
            <span style={{color: '#48bb78'}}>
              PIR: {pirWorkflowData.summary.totalPIRs} | EXT: {pirWorkflowData.summary.totalIndicators}
            </span>
          )}
          {ffirWorkflowData && (
            <span style={{color: '#805ad5'}}>
              FFIR: {ffirWorkflowData.summary.totalFFIRs} | COMP: {ffirWorkflowData.summary.totalCompanyIndicators}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategicBITool;