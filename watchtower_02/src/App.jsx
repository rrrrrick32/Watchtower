import React, { useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { getStyles } from './styles/uiStyles';

import { TitleBar } from './ui/components/TitleBar';
import { MainLayout } from './ui/components/MainLayout';
import { StatusBar } from './ui/components/StatusBar';

import PIRWorkflow from './workflows/pir_workflow';
import FFIRWorkflow from './workflows/ffir_workflow';
import { generateContextualFallback } from './workflows/fallbackUtils';
import { tabConfig } from './constants/tabs';

const Watchtower = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({ objective: '', context: '', links: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [pirWorkflowData, setPirWorkflowData] = useState(null);
  const [pirProcessing, setPirProcessing] = useState(false);
  const [ffirWorkflowData, setFfirWorkflowData] = useState(null);
  const [ffirProcessing, setFfirProcessing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  const styles = getStyles();
  console.log('styles object:', styles);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAnalyze = useCallback(async (requestedDecisions = null) => {
    if (!formData.objective.trim()) return;

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setPirWorkflowData(null);
    setFfirWorkflowData(null);

    try {
      const { data, error } = await supabase.functions.invoke('process-intent', {
        body: {
          strategic_intent: formData.objective,
          context_description: formData.context,
          context_links: formData.links,
          requested_decisions: requestedDecisions
        }
      });

      let processedData = error ? null : data;
      console.log('Raw AI response:', data);
      console.log('Response structure:', {
        hasDecisions: processedData?.decisions ? true : false,
        hasPirWorkflow: processedData?.pir_workflow ? true : false,
        hasFfirWorkflow: processedData?.ffir_workflow ? true : false,
        isArray: Array.isArray(processedData),
        dataKeys: processedData ? Object.keys(processedData) : 'null'
      });
      
      // Handle the new rich data structure from edge function
      let decisionPoints;
      let pirData = null;
      let ffirData = null;

      if (!processedData) {
        console.log('Using fallback - no data received');
        // Use fallback
        const fallbackData = generateContextualFallback(formData.objective, formData.context);
        decisionPoints = fallbackData.map((point, index) => ({
          id: index + 1,
          title: point.question,
          description: point.description,
          options: point.options || ["Proceed as planned", "Modify approach", "Delay decision"]
        }));
      } else if (processedData.decisions && Array.isArray(processedData.decisions)) {
        console.log('Processing rich data structure from edge function');
        // Handle rich data structure from edge function
        decisionPoints = processedData.decisions.map((decision, index) => ({
          id: index + 1,
          title: decision.title,
          description: decision.description,
          options: decision.options || ["Proceed as planned", "Modify approach", "Delay decision"],
          type: decision.type // PIR or FFIR
        }));

        // Extract PIR and FFIR workflow data
        if (processedData.pir_workflow) {
          console.log('PIR workflow data found:', processedData.pir_workflow);
          pirData = processedData.pir_workflow;
        }
        if (processedData.ffir_workflow) {
          console.log('FFIR workflow data found:', processedData.ffir_workflow);
          ffirData = processedData.ffir_workflow;
        }
      } else if (Array.isArray(processedData)) {
        console.log('Processing legacy array format');
        // Handle legacy array format (your original fallback format)
        decisionPoints = processedData.map((point, index) => ({
          id: index + 1,
          title: point.question,
          description: point.description,
          options: point.options || ["Proceed as planned", "Modify approach", "Delay decision"]
        }));
      } else {
        console.log('Unexpected data format, using fallback');
        // Unexpected format, use fallback
        const fallbackData = generateContextualFallback(formData.objective, formData.context);
        decisionPoints = fallbackData.map((point, index) => ({
          id: index + 1,
          title: point.question,
          description: point.description,
          options: point.options || ["Proceed as planned", "Modify approach", "Delay decision"]
        }));
      }

      console.log('Final decision points:', decisionPoints);

      const realAnalysis = {
        objective: formData.objective,
        decisionPoints: decisionPoints
      };

      setCurrentAnalysis(realAnalysis);

      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);

        // Handle PIR workflow data
        if (pirData) {
          console.log('Using AI-generated PIR data');
          setPirWorkflowData(pirData);
          setPirProcessing(false);
        } else {
          console.log('Generating PIR data from workflow');
          setPirProcessing(true);
          setTimeout(() => {
            try {
              const generatedPirData = PIRWorkflow.executeWorkflow(realAnalysis.decisionPoints);
              setPirWorkflowData(generatedPirData);
              setPirProcessing(false);
            } catch (error) {
              console.error('PIR workflow error:', error);
              setPirProcessing(false);
            }
          }, 2000);
        }

        // Handle FFIR workflow data
        if (ffirData) {
          console.log('Using AI-generated FFIR data');
          setFfirWorkflowData(ffirData);
          setFfirProcessing(false);
        } else {
          console.log('Generating FFIR data from workflow');
          setFfirProcessing(true);
          setTimeout(() => {
            try {
              const generatedFfirData = FFIRWorkflow.executeWorkflow(realAnalysis.decisionPoints);
              setFfirWorkflowData(generatedFfirData);
              setFfirProcessing(false);
            } catch (error) {
              console.error('FFIR workflow error:', error);
              setFfirProcessing(false);
            }
          }, 1500);
        }
      }, 1000);

    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      
      // Use fallback on error
      const fallbackData = generateContextualFallback(formData.objective, formData.context);
      const decisionPoints = fallbackData.map((point, index) => ({
        id: index + 1,
        title: point.question,
        description: point.description,
        options: point.options || ["Proceed as planned", "Modify approach", "Delay decision"]
      }));

      const realAnalysis = {
        objective: formData.objective,
        decisionPoints: decisionPoints
      };

      setCurrentAnalysis(realAnalysis);
      setAnalysisComplete(true);
      
      // Generate workflow data using local workflows
      setPirProcessing(true);
      setFfirProcessing(true);
      
      setTimeout(() => {
        try {
          const pirData = PIRWorkflow.executeWorkflow(decisionPoints);
          setPirWorkflowData(pirData);
          setPirProcessing(false);
        } catch {
          setPirProcessing(false);
        }
        
        try {
          const ffirData = FFIRWorkflow.executeWorkflow(decisionPoints);
          setFfirWorkflowData(ffirData);
          setFfirProcessing(false);
        } catch {
          setFfirProcessing(false);
        }
      }, 2000);
    }
  }, [formData]);

  return (
    <div style={{
      ...styles.container,
      height: 'auto',
      minHeight: '100vh',
      overflow: 'visible'
    }}>
      <TitleBar />
      <MainLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSidebarCollapsed={setSidebarCollapsed}
        sidebarCollapsed={sidebarCollapsed}
        formData={formData}
        handleInputChange={handleInputChange}
        handleAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        analysisComplete={analysisComplete}
        currentAnalysis={currentAnalysis}
        pirWorkflowData={pirWorkflowData}
        ffirWorkflowData={ffirWorkflowData}
        styles={styles}
        tabs={tabConfig}
      />
      <StatusBar
        isAnalyzing={isAnalyzing}
        analysisComplete={analysisComplete}
        pirProcessing={pirProcessing}
        ffirProcessing={ffirProcessing}
        pirWorkflowData={pirWorkflowData}
        ffirWorkflowData={ffirWorkflowData}
      />
    </div>
  );
};

export default Watchtower;