#!/usr/bin/env node

/**
 * Watchtower QA Runner - Complete Edge Function Testing Suite
 * Tests real Supabase Edge Function with comprehensive scenarios
 */
require('dotenv').config({path: './enviro.env'});
console.log('Environment check:', { url: process.env.SUPABASE_URL, keyLength: process.env.SUPABASE_ANON_KEY?.length});

const { WatchtowerInputGenerator } = require('./input_generator');
const { WatchtowerValidator } = require('./validator');
const  logger  = require('./logger');
const path = require('path');
const fs = require('fs');

class WatchtowerQARunner {
  constructor() {
    this.generator = new WatchtowerInputGenerator();
    this.validator = new WatchtowerValidator('./decisions.schema.json');
    this.logger = logger;
    
    // Test configurations
    this.testConfigs = {
      quick: { count: 50, testApi: false, description: 'Quick validation tests (schema only)' },
      standard: { count: 200, testApi: true, description: 'Standard API integration tests' },
      comprehensive: { count: 1000, testApi: true, description: 'Comprehensive testing with full API coverage' },
      stress: { count: 5000, testApi: true, parallel: true, description: 'High-volume stress testing' },
      performance: { count: 100, testApi: true, parallel: true, description: 'Performance benchmarking' }
    };

    // Scenario configurations
    this.scenarios = {
      complexity_high: 'High complexity strategic intents (5 decisions expected)',
      complexity_medium: 'Medium complexity strategic intents (3-4 decisions expected)', 
      complexity_low: 'Low complexity strategic intents (3 decisions expected)',
      decision_counts: 'Decision count accuracy testing (3,4,5 + auto)',
      edge_cases: 'Input validation and error handling',
      validation_tests: 'Business logic validation tests'
    };
  }

  async runTest(testType) {
    console.log('🎯 Watchtower QA Testing Suite');
    console.log('================================\n');

    const config = this.testConfigs[testType];
    if (!config) {
      console.error(`❌ Unknown test type: ${testType}`);
      console.log(`Available tests: ${Object.keys(this.testConfigs).join(', ')}`);
      return;
    }

    await this.executeTest(testType, config);
  }

  async runScenario(scenarioType) {
    console.log('🎯 Watchtower Scenario Testing');
    console.log('==============================\n');

    if (!this.scenarios[scenarioType]) {
      console.error(`❌ Unknown scenario: ${scenarioType}`);
      console.log(`Available scenarios: ${Object.keys(this.scenarios).join(', ')}`);
      return;
    }

    console.log(`📋 Running scenario: ${scenarioType}`);
    console.log(`📝 Description: ${this.scenarios[scenarioType]}\n`);

    const inputs = this.generator.generateScenarios(scenarioType);
    console.log(`📊 Generated ${inputs.length} test cases for scenario\n`);

    await this.executeValidation(inputs, true, `scenario_${scenarioType}`);
  }

  async runHealthCheck() {
    console.log('🏥 Watchtower Health Check');
    console.log('==========================\n');

    const healthTests = [
      {
        name: 'Schema Validation',
        test: () => this.testSchemaLoading()
      },
      {
        name: 'Input Generation',
        test: () => this.testInputGeneration()
      },
      {
        name: 'Edge Function Connectivity',
        test: () => this.testEdgeFunctionConnectivity()
      },
      {
        name: 'Basic API Integration',
        test: () => this.testBasicApiIntegration()
      }
    ];

    let allPassed = true;

    for (const healthTest of healthTests) {
      console.log(`🔍 Testing ${healthTest.name}...`);
      try {
        const result = await healthTest.test();
        if (result.success) {
          console.log(`✅ ${healthTest.name}: PASSED`);
        } else {
          console.log(`❌ ${healthTest.name}: FAILED - ${result.error}`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`❌ ${healthTest.name}: ERROR - ${error.message}`);
        allPassed = false;
      }
      console.log();
    }

    console.log(`🏥 Health Check Result: ${allPassed ? '✅ HEALTHY' : '❌ ISSUES DETECTED'}`);
    return allPassed;
  }

  async executeTest(testType, config) {
    console.log(`📋 Running: ${testType.toUpperCase()} TEST`);
    console.log(`📝 Description: ${config.description}`);
    console.log(`📊 Test Count: ${config.count}`);
    console.log(`🔗 API Testing: ${config.testApi ? 'YES' : 'NO'}`);
    console.log(`⚡ Parallel Mode: ${config.parallel ? 'YES' : 'NO'}\n`);

    const inputs = this.generator.generateBatch(config.count);
    await this.executeValidation(inputs, config.testApi, testType, config.parallel);
  }

  async executeValidation(inputs, testApi, testName, parallel = false) {
    const startTime = Date.now();
    
    try {
      // Reset validator statistics
      this.validator.resetStats();
      
      // Log test start
      this.logger.logTestStart(testName, {
        inputCount: inputs.length,
        testApi: testApi,
        parallel: parallel,
        timestamp: new Date().toISOString()
      });

      // Execute validation
      console.log(`🚀 Starting validation of ${inputs.length} inputs...\n`);
      
      const result = await this.validator.validateBatch(inputs, testApi, parallel);
      
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      // Display results
      this.displayResults(result, testName, totalDuration);
      
      // Log results
      this.logger.logTestResults(testName, {
        ...result,
        totalDuration: totalDuration
      });

      // Save detailed results if there are failures
      if (result.summary.overview.failed > 0) {
        await this.saveFailureDetails(result, testName);
      }

    } catch (error) {
      console.error(`❌ Test execution failed: ${error.message}`);
      this.logger.logError(`Test execution failed: ${error.message}`, error);
    }
  }

  displayResults(result, testName, duration) {
    const { performance, summary } = result;
    
    console.log('\n📊 TEST RESULTS');
    console.log('================');
    console.log(`Test: ${testName.toUpperCase()}`);
    console.log(`Duration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log();

    // Overview
    console.log('📈 OVERVIEW:');
    console.log(`  Total Tests: ${summary.overview.totalTests}`);
    console.log(`  Passed: ${summary.overview.passed} (${summary.overview.passRate})`);
    console.log(`  Failed: ${summary.overview.failed}`);
    console.log();

    // Performance
    console.log('⚡ PERFORMANCE:');
    console.log(`  Total Time: ${(duration / 1000).toFixed(2)}s`);
    console.log(`  Average Time: ${performance.averageTime.toFixed(2)}ms per test`);
    console.log(`  Throughput: ${performance.throughput.toFixed(2)} tests/second`);
    
    if (performance.apiCallsPerSecond > 0) {
      console.log(`  API Calls/sec: ${performance.apiCallsPerSecond.toFixed(2)}`);
    }
    console.log();

    // API Results (if applicable)
    if (summary.api.totalCalls > 0) {
      console.log('🔗 API INTEGRATION:');
      console.log(`  Total API Calls: ${summary.api.totalCalls}`);
      console.log(`  API Failures: ${summary.api.failures}`);
      console.log(`  API Success Rate: ${summary.api.successRate}`);
      
      if (summary.performance) {
        console.log(`  Avg Response Time: ${summary.performance.averageResponseTime}`);
        console.log(`  Min Response Time: ${summary.performance.minResponseTime}`);
        console.log(`  Max Response Time: ${summary.performance.maxResponseTime}`);
      }
      console.log();
    }

    // Error Analysis
    if (summary.errors.total > 0) {
      console.log('❌ ERROR ANALYSIS:');
      console.log(`  Total Errors: ${summary.errors.total}`);
      console.log('  Error Types:');
      
      Object.entries(summary.errors.byType).forEach(([type, count]) => {
        console.log(`    ${type}: ${count}`);
      });
      console.log();
    }

    // Final Status
    const status = summary.overview.failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED';
    console.log(`🎯 FINAL STATUS: ${status}\n`);
  }

  async saveFailureDetails(result, testName) {
    const failedTests = result.results.filter(r => r.errors.length > 0);
    const filename = `watchtower_failures_${testName}_${Date.now()}.json`;
    const filepath = path.join('logs', filename);
    
    // Ensure logs directory exists
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    
    const failureReport = {
      testName: testName,
      timestamp: new Date().toISOString(),
      summary: result.summary,
      failedTests: failedTests.map(test => ({
        input: test.input,
        errors: test.errors,
        apiResponse: test.apiResponse ? {
          decisions: test.apiResponse.decisions?.length || 0,
          hasPirWorkflow: !!test.apiResponse.pir_workflow,
          hasFfirWorkflow: !!test.apiResponse.ffir_workflow,
          usedFallback: test.apiResponse.usedFallback
        } : null,
        performance: test.performance
      }))
    };
    
    fs.writeFileSync(filepath, JSON.stringify(failureReport, null, 2));
    console.log(`📁 Failure details saved to: ${filepath}`);
  }

  // Health check test methods
  async testSchemaLoading() {
    try {
      const schema = require('./decisions.schema.json');
      if (schema.input && schema.output) {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid schema structure' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testInputGeneration() {
    try {
      const input = this.generator.generateSingle();
      if (input.strategic_intent && input.strategic_intent.length > 0) {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid input generated' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testEdgeFunctionConnectivity() {
    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/process-intent`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testBasicApiIntegration() {
    try {
      const testInput = {
        strategic_intent: "Test basic API integration functionality"
      };
      
      const result = await this.validator.testEdgeFunction(testInput);
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const param = args[1];
  
  const runner = new WatchtowerQARunner();
  
  if (!command) {
    console.log('🎯 Watchtower QA Testing Suite');
    console.log('===============================\n');
    console.log('Available commands:');
    console.log('  node qa_runner.js quick           - Quick schema validation (50 tests)');
    console.log('  node qa_runner.js standard        - Standard API testing (200 tests)');
    console.log('  node qa_runner.js comprehensive   - Comprehensive testing (1000 tests)');
    console.log('  node qa_runner.js stress          - Stress testing (5000 tests)');
    console.log('  node qa_runner.js performance     - Performance benchmarking');
    console.log('  node qa_runner.js scenario <type> - Run specific scenario tests');
    console.log('  node qa_runner.js health          - Run health check');
    console.log('\nScenario types:');
    Object.entries(runner.scenarios).forEach(([key, desc]) => {
      console.log(`  ${key.padEnd(20)} - ${desc}`);
    });
    return;
  }

  // Check for required environment variables
  if (command !== 'quick' && command !== 'health' && !process.env.SUPABASE_URL) {
    console.error('❌ Missing required environment variables:');
    console.error('   SUPABASE_URL - Your Supabase project URL');
    console.error('   SUPABASE_ANON_KEY - Your Supabase anonymous key');
    console.error('\nSet these in your environment or .env file');
    return;
  }

  switch (command) {
    case 'quick':
    case 'standard':
    case 'comprehensive':
    case 'stress':
    case 'performance':
      await runner.runTest(command);
      break;
      
    case 'scenario':
      if (!param) {
        console.error('❌ Scenario type required');
        console.log('Available scenarios:', Object.keys(runner.scenarios).join(', '));
        return;
      }
      await runner.runScenario(param);
      break;
      
    case 'health':
      await runner.runHealthCheck();
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run without arguments to see available commands');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { WatchtowerQARunner };