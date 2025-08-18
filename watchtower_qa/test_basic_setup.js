/**
 * Basic Setup Test - Verifies all components work together
 * Run this first to ensure your Watchtower QA system is properly configured
 */

const InputGenerator = require('./input_generator');
const DecisionValidator = require('./validator');
const QARunner = require('./qa_runner');
const logger = require('./logger');

async function testBasicSetup() {
    console.log('\n🎯 WATCHTOWER QA - BASIC SETUP TEST');
    console.log('=' .repeat(50));
    
    let allTestsPassed = true;
    const testResults = [];

    // Test 1: Logger functionality
    console.log('\n📝 Test 1: Logger functionality...');
    try {
        logger.info('Testing logger - this should appear in console and log file');
        logger.warn('Testing warning level');
        logger.error('Testing error level (this is expected)');
        console.log('✅ Logger test passed');
        testResults.push({ test: 'Logger', status: 'PASS' });
    } catch (error) {
        console.log('❌ Logger test failed:', error.message);
        testResults.push({ test: 'Logger', status: 'FAIL', error: error.message });
        allTestsPassed = false;
    }

    // Test 2: Schema loading
    console.log('\n📋 Test 2: Schema loading...');
    try {
        const validator = new DecisionValidator();
        if (validator.schema && validator.schema.title) {
            console.log(`✅ Schema loaded: "${validator.schema.title}"`);
            console.log(`   Required fields: ${validator.schema.required.length}`);
            testResults.push({ test: 'Schema Loading', status: 'PASS' });
        } else {
            throw new Error('Schema not properly loaded');
        }
    } catch (error) {
        console.log('❌ Schema loading failed:', error.message);
        testResults.push({ test: 'Schema Loading', status: 'FAIL', error: error.message });
        allTestsPassed = false;
    }

    // Test 3: Data generation
    console.log('\n🎲 Test 3: Data generation...');
    try {
        const generator = new InputGenerator();
        
        // Test valid data generation
        const validDecision = generator.generateValidDecision();
        if (validDecision && validDecision.scenario_id && validDecision.mission_type) {
            console.log(`✅ Valid decision generated`);
            console.log(`   Scenario ID: ${validDecision.scenario_id}`);
            console.log(`   Mission: ${validDecision.mission_type}`);
        } else {
            throw new Error('Valid decision not properly generated');
        }
        
        // Test invalid data generation
        const invalidDecision = generator.generateInvalidDecision('missing_required');
        console.log(`✅ Invalid decision generated (for testing)`);
        
        // Test batch generation
        const batch = generator.generateBatch(5, { validRatio: 0.6 });
        if (batch && batch.length === 5) {
            console.log(`✅ Batch generation (${batch.length} items)`);
        } else {
            throw new Error('Batch generation failed');
        }
        
        testResults.push({ test: 'Data Generation', status: 'PASS' });
    } catch (error) {
        console.log('❌ Data generation failed:', error.message);
        testResults.push({ test: 'Data Generation', status: 'FAIL', error: error.message });
        allTestsPassed = false;
    }

    // Test 4: Validation
    console.log('\n🔍 Test 4: Validation...');
    try {
        const validator = new DecisionValidator();
        const generator = new InputGenerator();
        
        // Test valid data validation
        const validData = generator.generateValidDecision();
        const validResult = validator.validateDecision(validData);
        
        if (validResult.isValid) {
            console.log('✅ Valid data correctly validated as valid');
        } else {
            console.log('⚠️  Valid data was marked invalid - checking errors...');
            console.log('   Errors:', validResult.errors.map(e => e.message));
        }
        
        // Test invalid data validation
        const invalidData = generator.generateInvalidDecision('missing_required');
        const invalidResult = validator.validateDecision(invalidData);
        
        if (!invalidResult.isValid) {
            console.log('✅ Invalid data correctly validated as invalid');
            console.log(`   Found ${invalidResult.errors.length} validation errors`);
        } else {
            console.log('⚠️  Invalid data was marked valid - this might be a problem');
        }
        
        testResults.push({ test: 'Validation', status: 'PASS' });
    } catch (error) {
        console.log('❌ Validation failed:', error.message);
        testResults.push({ test: 'Validation', status: 'FAIL', error: error.message });
        allTestsPassed = false;
    }

    // Test 5: Integration
    console.log('\n🔗 Test 5: Integration test...');
    try {
        const generator = new InputGenerator();
        const validator = new DecisionValidator();
        
        // Generate a small batch and validate it
        const decisions = generator.generateBatch(10, { validRatio: 0.7 });
        const results = validator.validateBatch(decisions, { logProgress: false });
        
        console.log(`✅ Integration test completed`);
        console.log(`   Generated: ${decisions.length} decisions`);
        console.log(`   Valid: ${results.summary.validCount}`);
        console.log(`   Invalid: ${results.summary.invalidCount}`);
        console.log(`   Accuracy: ${results.summary.accuracy}%`);
        
        testResults.push({ test: 'Integration', status: 'PASS' });
    } catch (error) {
        console.log('❌ Integration test failed:', error.message);
        testResults.push({ test: 'Integration', status: 'FAIL', error: error.message });
        allTestsPassed = false;
    }

    // Test 6: QA Runner health check
    console.log('\n🏥 Test 6: QA Runner health check...');
    try {
        const qaRunner = new QARunner();
        const healthReport = await qaRunner.systemHealthCheck();
        
        if (healthReport.overallHealth === 'healthy') {
            console.log('✅ QA Runner health check passed');
            console.log(`   Schema: ${healthReport.schemaValid ? '✅' : '❌'}`);
            console.log(`   Generator: ${healthReport.generatorWorking ? '✅' : '❌'}`);
            console.log(`   Validator: ${healthReport.validatorWorking ? '✅' : '❌'}`);
        } else {
            console.log('⚠️  QA Runner health check found issues');
            console.log('   Health report:', healthReport);
        }
        
        testResults.push({ test: 'QA Runner Health', status: 'PASS' });
    } catch (error) {
        console.log('❌ QA Runner health check failed:', error.message);
        testResults.push({ test: 'QA Runner Health', status: 'FAIL', error: error.message });
        allTestsPassed = false;
    }

    // Final results summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SETUP TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    
    testResults.forEach((result, index) => {
        const status = result.status === 'PASS' ? '✅' : '❌';
        console.log(`${index + 1}. ${result.test}: ${status} ${result.status}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });
    
    const passedTests = testResults.filter(r => r.status === 'PASS').length;
    const totalTests = testResults.length;
    
    console.log('\n' + '-'.repeat(50));
    console.log(`📈 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED! Your Watchtower QA system is ready.');
        console.log('\n🚀 Next steps:');
        console.log('   • Run: node qa_runner.js quick');
        console.log('   • Run: node qa_runner.js help (for all commands)');
        console.log('   • Check the logs/ folder for detailed logs');
    } else {
        console.log('⚠️  Some tests failed. Please check the errors above.');
        console.log('💡 Common issues:');
        console.log('   • Make sure all npm packages are installed');
        console.log('   • Check that decisions.schema.json is valid JSON');
        console.log('   • Ensure all files are in the same directory');
    }
    
    console.log('='.repeat(50) + '\n');
    
    return allTestsPassed;
}

// Test dependencies
function testDependencies() {
    console.log('\n📦 Checking dependencies...');
    
    const requiredModules = [
        '@faker-js/faker',
        'jsonschema', 
        'winston'
    ];
    
    let allDependenciesPresent = true;
    
    requiredModules.forEach(moduleName => {
        try {
            require(moduleName);
            console.log(`✅ ${moduleName}`);
        } catch (error) {
            console.log(`❌ ${moduleName} - NOT FOUND`);
            allDependenciesPresent = false;
        }
    });
    
    if (!allDependenciesPresent) {
        console.log('\n❌ Missing dependencies detected!');
        console.log('🔧 Please run: npm install @faker-js/faker jsonschema winston');
        return false;
    }
    
    console.log('✅ All dependencies present');
    return true;
}

// Run the test
async function main() {
    console.log('🎯 Watchtower QA - Basic Setup Test');
    console.log('This will verify that all components are working correctly.\n');
    
    // First check dependencies
    if (!testDependencies()) {
        process.exit(1);
    }
    
    // Then run the full setup test
    const success = await testBasicSetup();
    
    process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Setup test crashed:', error);
        process.exit(1);
    });
}

module.exports = { testBasicSetup, testDependencies };