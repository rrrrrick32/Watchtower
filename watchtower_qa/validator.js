/**
 * Watchtower Validator - Real Edge Function Testing & Validation
 * Tests actual Supabase Edge Function with comprehensive validation
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class WatchtowerValidator {
  constructor(schemaPath, supabaseConfig = null) {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    
    // Load the Watchtower schema
    this.schema = require(schemaPath);
    this.inputValidator = this.ajv.compile(this.schema.input);
    this.outputValidator = this.ajv.compile(this.schema.output);
    
    // Supabase configuration for API testing
    this.supabaseConfig = supabaseConfig || {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      functionName: 'process-intent'
    };
    
    // Validation statistics
    this.stats = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: [],
      performance: [],
      apiCalls: 0,
      apiFailures: 0
    };
  }

  /**
   * Clean input by removing test metadata fields (anything starting with _)
   */
  cleanInputForValidation(input) {
    const cleaned = { ...input };
    // Remove any fields starting with underscore (test metadata)
    Object.keys(cleaned).forEach(key => {
      if (key.startsWith('_')) {
        delete cleaned[key];
      }
    });
    return cleaned;
  }

  /**
   * Validate single input and optionally test the Edge Function
   */
  async validateSingle(input, testApi = false) {
    this.stats.totalTests++;
    const result = {
      input: input,
      inputValid: false,
      outputValid: false,
      apiResponse: null,
      errors: [],
      performance: {},
      timestamp: new Date().toISOString()
    };

    try {
      // Clean input for validation (remove test metadata)
      const cleanedInput = this.cleanInputForValidation(input);
      
      // 1. Validate input structure
      const inputValidation = this.validateInput(cleanedInput);
      result.inputValid = inputValidation.valid;
      
      if (!inputValidation.valid) {
        result.errors.push(...inputValidation.errors);
        this.stats.failed++;
        this.stats.errors.push(result);
        return result;
      }

      // 2. Test Edge Function if requested
      if (testApi) {
        // Use cleaned input for API call
        const apiResult = await this.testEdgeFunction(cleanedInput);
        result.apiResponse = apiResult.response;
        result.performance = apiResult.performance;
        
        if (apiResult.success) {
          // 3. Validate output structure
          const outputValidation = this.validateOutput(apiResult.response);
          result.outputValid = outputValidation.valid;
          
          if (!outputValidation.valid) {
            result.errors.push(...outputValidation.errors);
          }

          // 4. Business logic validation (use original input for metadata)
          const businessValidation = this.validateBusinessLogic(input, apiResult.response);
          if (!businessValidation.valid) {
            result.errors.push(...businessValidation.errors);
            result.outputValid = false;
          }
        } else {
          result.errors.push(apiResult.error);
          this.stats.apiFailures++;
        }
      }

      // Update statistics
      if (result.errors.length === 0) {
        this.stats.passed++;
      } else {
        this.stats.failed++;
        this.stats.errors.push(result);
      }

      return result;

    } catch (error) {
      result.errors.push({
        type: 'system_error',
        message: error.message,
        stack: error.stack
      });
      
      this.stats.failed++;
      this.stats.errors.push(result);
      return result;
    }
  }

  /**
   * Validate batch of inputs
   */
  async validateBatch(inputs, testApi = false, parallel = false) {
    const startTime = Date.now();
    
    console.log(`🔍 Validating ${inputs.length} inputs${testApi ? ' with API testing' : ''}...`);
    
    let results;
    
    if (parallel && testApi) {
      // Parallel API testing (be careful with rate limits)
      const concurrency = 5; // Limit concurrent API calls
      results = await this.processBatchParallel(inputs, testApi, concurrency);
    } else {
      // Sequential processing
      results = await this.processBatchSequential(inputs, testApi);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Calculate performance metrics
    const performance = {
      totalTime: duration,
      averageTime: duration / inputs.length,
      throughput: (inputs.length / duration) * 1000, // items per second
      apiCallsPerSecond: testApi ? (this.stats.apiCalls / duration) * 1000 : 0
    };

    return {
      results: results,
      performance: performance,
      summary: this.generateSummary()
    };
  }

  async processBatchSequential(inputs, testApi) {
    const results = [];
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      
      if (i % 10 === 0) {
        console.log(`  Processing item ${i + 1}/${inputs.length}...`);
      }
      
      const result = await this.validateSingle(input, testApi);
      results.push(result);
      
      // Add small delay for API testing to avoid rate limits
      if (testApi) {
        await this.delay(100);
      }
    }
    
    return results;
  }

  async processBatchParallel(inputs, testApi, concurrency) {
    const results = [];
    
    for (let i = 0; i < inputs.length; i += concurrency) {
      const batch = inputs.slice(i, i + concurrency);
      console.log(`  Processing batch ${Math.floor(i / concurrency) + 1}/${Math.ceil(inputs.length / concurrency)}...`);
      
      const batchPromises = batch.map(input => this.validateSingle(input, testApi));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      
      // Delay between batches
      if (i + concurrency < inputs.length) {
        await this.delay(500);
      }
    }
    
    return results;
  }

  /**
   * Test the actual Supabase Edge Function
   */
  async testEdgeFunction(input) {
    const startTime = Date.now();
    this.stats.apiCalls++;
    
    try {
      const response = await fetch(`${this.supabaseConfig.url}/functions/v1/${this.supabaseConfig.functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseConfig.anonKey}`
        },
        body: JSON.stringify(input)
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: {
            type: 'api_error',
            status: response.status,
            statusText: response.statusText,
            message: `Edge Function returned ${response.status}: ${response.statusText}`
          },
          performance: { responseTime }
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        response: data,
        performance: {
          responseTime: responseTime,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      const endTime = Date.now();
      return {
        success: false,
        error: {
          type: 'network_error',
          message: error.message,
          stack: error.stack
        },
        performance: { responseTime: endTime - startTime }
      };
    }
  }

  /**
   * Validate input against schema
   */
  validateInput(input) {
    const valid = this.inputValidator(input);
    
    if (valid) {
      return { valid: true, errors: [] };
    } else {
      return {
        valid: false,
        errors: this.inputValidator.errors.map(error => ({
          type: 'input_validation',
          field: error.instancePath || error.dataPath,
          message: error.message,
          value: error.data,
          schema: error.schema
        }))
      };
    }
  }

  /**
   * Validate output against schema
   */
  validateOutput(output) {
    const valid = this.outputValidator(output);
    
    if (valid) {
      return { valid: true, errors: [] };
    } else {
      return {
        valid: false,
        errors: this.outputValidator.errors.map(error => ({
          type: 'output_validation',
          field: error.instancePath || error.dataPath,
          message: error.message,
          value: error.data,
          schema: error.schema
        }))
      };
    }
  }

  /**
   * Validate business logic rules
   */
  validateBusinessLogic(input, output) {
    const errors = [];

    try {
      // Clean input for business logic validation too
      const cleanedInput = this.cleanInputForValidation(input);

      // 1. Decision count validation
      if (cleanedInput.requested_decisions) {
        if (output.decisions.length !== cleanedInput.requested_decisions) {
          errors.push({
            type: 'business_logic',
            rule: 'decision_count_mismatch',
            message: `Expected ${cleanedInput.requested_decisions} decisions, got ${output.decisions.length}`,
            expected: cleanedInput.requested_decisions,
            actual: output.decisions.length
          });
        }
      } else {
        // Auto mode should generate 3-5 decisions
        if (output.decisions.length < 3 || output.decisions.length > 5) {
          errors.push({
            type: 'business_logic',
            rule: 'auto_decision_count_invalid',
            message: `Auto mode should generate 3-5 decisions, got ${output.decisions.length}`,
            actual: output.decisions.length
          });
        }
      }

      // 2. PIR/FFIR type distribution validation
      const pirCount = output.decisions.filter(d => d.type === 'PIR').length;
      const ffirCount = output.decisions.filter(d => d.type === 'FFIR').length;
      
      if (pirCount === 0 && ffirCount === 0) {
        errors.push({
          type: 'business_logic',
          rule: 'missing_decision_types',
          message: 'All decisions missing PIR/FFIR classification'
        });
      }

      // 3. Workflow data consistency
      if (output.pir_workflow && output.pir_workflow.summary) {
        const actualPirDecisions = pirCount;
        const reportedPirDecisions = output.pir_workflow.summary.totalDecisions;
        
        if (actualPirDecisions !== reportedPirDecisions) {
          errors.push({
            type: 'business_logic',
            rule: 'pir_workflow_inconsistency',
            message: `PIR workflow summary mismatch: ${actualPirDecisions} actual vs ${reportedPirDecisions} reported`,
            actual: actualPirDecisions,
            reported: reportedPirDecisions
          });
        }
      }

      if (output.ffir_workflow && output.ffir_workflow.summary) {
        const actualFfirDecisions = ffirCount;
        const reportedFfirDecisions = output.ffir_workflow.summary.totalDecisions;
        
        if (actualFfirDecisions !== reportedFfirDecisions) {
          errors.push({
            type: 'business_logic',
            rule: 'ffir_workflow_inconsistency',
            message: `FFIR workflow summary mismatch: ${actualFfirDecisions} actual vs ${reportedFfirDecisions} reported`,
            actual: actualFfirDecisions,
            reported: reportedFfirDecisions
          });
        }
      }

      // 4. Complexity assessment validation (heuristic)
      // Use original input to check for _expectedComplexity test metadata
      const testExpectedComplexity = input._expectedComplexity;
      const actualComplexity = this.assessComplexity(cleanedInput.strategic_intent, cleanedInput.context_description);
      
      if (testExpectedComplexity && testExpectedComplexity !== actualComplexity) {
        errors.push({
          type: 'business_logic',
          rule: 'complexity_assessment_test_mismatch',
          message: `Test expected ${testExpectedComplexity} complexity, but system assessed ${actualComplexity}`,
          expected: testExpectedComplexity,
          actual: actualComplexity
        });
      }

      if (!cleanedInput.requested_decisions) { // Only check in auto mode
        const expectedDecisionCount = actualComplexity === 'high' ? 5 : 3;
        const tolerance = 1; // Allow ±1 decision
        if (Math.abs(output.decisions.length - expectedDecisionCount) > tolerance) {
          errors.push({
            type: 'business_logic',
            rule: 'complexity_assessment_mismatch',
            message: `Complexity assessment may be incorrect. Expected ~${expectedDecisionCount} decisions for ${actualComplexity} complexity, got ${output.decisions.length}`,
            expectedComplexity: actualComplexity,
            expectedDecisions: expectedDecisionCount,
            actualDecisions: output.decisions.length
          });
        }
      }

      return { valid: errors.length === 0, errors };

    } catch (error) {
      return {
        valid: false,
        errors: [{
          type: 'business_logic_error',
          message: `Error validating business logic: ${error.message}`,
          stack: error.stack
        }]
      };
    }
  }

  /**
   * Assess expected complexity (mirrors Edge Function logic)
   */
  assessComplexity(objective, context) {
    const objLower = objective.toLowerCase();
    const contextLower = (context || '').toLowerCase();
    const combined = `${objLower} ${contextLower}`;
    
    const complexIndicators = [
      'multi', 'global', 'international', 'expansion', 'transformation',
      'merger', 'acquisition', 'launch', 'regulatory', 'compliance',
      'stakeholder', 'crisis', 'emergency', 'restructure'
    ];
    
    const complexScore = complexIndicators.filter(word => combined.includes(word)).length;
    return complexScore >= 2 || combined.length > 150 ? 'high' : 'medium';
  }

  /**
   * Generate comprehensive test summary
   */
  generateSummary() {
    const summary = {
      overview: {
        totalTests: this.stats.totalTests,
        passed: this.stats.passed,
        failed: this.stats.failed,
        passRate: this.stats.totalTests > 0 ? (this.stats.passed / this.stats.totalTests * 100).toFixed(2) + '%' : '0%'
      },
      api: {
        totalCalls: this.stats.apiCalls,
        failures: this.stats.apiFailures,
        successRate: this.stats.apiCalls > 0 ? ((this.stats.apiCalls - this.stats.apiFailures) / this.stats.apiCalls * 100).toFixed(2) + '%' : '0%'
      },
      errors: {
        total: this.stats.errors.length,
        byType: this.categorizeErrors()
      }
    };

    if (this.stats.performance.length > 0) {
      const responseTimes = this.stats.performance.map(p => p.responseTime);
      summary.performance = {
        averageResponseTime: (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2) + 'ms',
        minResponseTime: Math.min(...responseTimes) + 'ms',
        maxResponseTime: Math.max(...responseTimes) + 'ms'
      };
    }

    return summary;
  }

  categorizeErrors() {
    const categories = {};
    
    this.stats.errors.forEach(result => {
      result.errors.forEach(error => {
        const type = error.type || 'unknown';
        categories[type] = (categories[type] || 0) + 1;
      });
    });
    
    return categories;
  }

  /**
   * Reset statistics for new test run
   */
  resetStats() {
    this.stats = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: [],
      performance: [],
      apiCalls: 0,
      apiFailures: 0
    };
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { WatchtowerValidator };