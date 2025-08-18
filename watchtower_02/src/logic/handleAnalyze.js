// Updated handleAnalyze for Backend Workflow with Debug Logs
const handleAnalyze = useCallback(async () => {
    if (!formData.objective.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setPirWorkflowData(null);
    setFfirWorkflowData(null);
    
    try {
      console.log('Calling Backend Workflow with:', {
        strategic_intent: formData.objective,
        context_description: formData.context,
        context_links: formData.links
      });

      // Call the comprehensive backend workflow
      const { data, error } = await supabase.functions.invoke('process-intent', {
        body: {
          strategic_intent: formData.objective,
          context_description: formData.context,
          context_links: formData.links
        }
      });

      console.log('Backend Workflow Response:', { data, error });

      // DEBUG LOGS - Add these lines
      console.log('1. Raw Backend Response:', data);
      console.log('2. Extracted Decisions:', data?.decisions);

      if (error) {
        console.error(`Backend workflow error: ${error.message}`);
        throw new Error(`Backend workflow error: ${error.message}`);
      }

      if (!data?.decisions || !data?.pir_workflow || !data?.ffir_workflow) {
        throw new Error('Invalid response format from backend workflow');
      }

      console.log('Complete Intelligence Package:', data);
      
      // Extract the decision points for main analysis
      const decisions = data.decisions;
      
      // Create analysis object for main view
      const strategicAnalysis = {
        objective: formData.objective,
        keyFactors: extractKeyFactors(formData.objective, formData.context),
        decisionPoints: decisions
      };

      // Update the current analysis state
      setCurrentAnalysis(strategicAnalysis);

      // DEBUG LOGS - Add these lines
      console.log('3. Setting Current Analysis:', strategicAnalysis);
      console.log('4. Decision Points Array:', strategicAnalysis?.decisionPoints);

      // Process the complete workflow data
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
        
        // Set PIR workflow data (already processed by backend)
        console.log('Setting PIR Workflow Data:', data.pir_workflow);
        setPirWorkflowData(data.pir_workflow);
        setPirProcessing(false);
        
        // Set FFIR workflow data (already processed by backend)  
        console.log('Setting FFIR Workflow Data:', data.ffir_workflow);
        setFfirWorkflowData(data.ffir_workflow);
        setFfirProcessing(false);
        
      }, 1000);
      
    } catch (error) {
      console.error('Analysis Error:', error);
      setIsAnalyzing(false);
      setPirProcessing(false);
      setFfirProcessing(false);
      
      // Simple fallback for frontend errors
      const fallbackAnalysis = {
        objective: formData.objective,
        keyFactors: extractKeyFactors(formData.objective, formData.context),
        decisionPoints: [
          {
            id: 1,
            title: `Strategic decision needed for: ${formData.objective}`,
            description: "Analysis temporarily unavailable - please try again",
            type: "PIR",
            options: ["Retry analysis", "Manual planning", "Contact support"]
          }
        ]
      };

      setCurrentAnalysis(fallbackAnalysis);
      setAnalysisComplete(true);
      
      // Set empty workflow data
      setPirWorkflowData({
        pirs: {},
        indicators: {},
        summary: { totalDecisions: 0, totalPIRs: 0, totalIndicators: 0 }
      });
      
      setFfirWorkflowData({
        ffirs: {},
        companyIndicators: {},
        summary: { totalDecisions: 0, totalFFIRs: 0, totalCompanyIndicators: 0 }
      });
    }
  }, [formData.objective, formData.context, formData.links]);

  // Helper function to extract key factors (simplified for backend workflow)
  const extractKeyFactors = (objective, context) => {
    const factors = ["Strategic considerations", "Intelligence requirements", "Execution planning"];
    
    const obj = objective.toLowerCase();
    const ctx = (context || '').toLowerCase();
    const combined = `${obj} ${ctx}`;
    
    if (combined.includes('reputation') || combined.includes('crisis')) {
      factors.push("Reputation monitoring", "Crisis management", "Stakeholder communications");
    } else if (combined.includes('market') || combined.includes('customer')) {
      factors.push("Market intelligence", "Customer insights", "Competitive analysis");
    } else if (combined.includes('launch') || combined.includes('product')) {
      factors.push("Launch readiness", "Product positioning", "Market entry");
    } else {
      factors.push("External environment", "Internal capabilities", "Risk assessment");
    }
    
    factors.push("Success metrics");
    
    return factors.slice(0, 6);
  };