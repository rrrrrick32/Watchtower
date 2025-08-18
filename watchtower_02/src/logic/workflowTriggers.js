import { PIRWorkflow } from '../workflows/pir_workflow';
import { FFIRWorkflow } from '../workflows/ffir_workflow';

export const runWorkflows = async ({
  analysis,
  setPirProcessing,
  setFfirProcessing,
  setPirWorkflowData,
  setFfirWorkflowData
}) => {
  setPirProcessing(true);

  setTimeout(() => {
    try {
      const pirData = PIRWorkflow.executeWorkflow(analysis.decisionPoints);
      setPirWorkflowData(pirData);
      setPirProcessing(false);

      setFfirProcessing(true);
      setTimeout(() => {
        try {
          const ffirData = FFIRWorkflow.executeWorkflow(analysis.decisionPoints);
          setFfirWorkflowData(ffirData);
          setFfirProcessing(false);
        } catch (err) {
          console.error('FFIR Workflow Error:', err);
          setFfirWorkflowData(null);
          setFfirProcessing(false);
        }
      }, 1500);

    } catch (err) {
      console.error('PIR Workflow Error:', err);
      setPirWorkflowData(null);
      setPirProcessing(false);
    }
  }, 1500);
};
