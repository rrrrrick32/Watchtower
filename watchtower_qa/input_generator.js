/**
 * Watchtower Input Generator - Real Business Strategic Intent Generation
 * Generates realistic business scenarios for testing the Watchtower Edge Function
 */

class WatchtowerInputGenerator {
  constructor() {
    // Business domain templates for strategic intents
    this.strategicIntentTemplates = {
      market_expansion: [
        "Expand into the European market within 18 months",
        "Launch our SaaS platform in the Asian Pacific region",
        "Enter the healthcare vertical with our existing technology",
        "Establish a presence in the Latin American market",
        "Penetrate the enterprise segment with our SMB product"
      ],
      
      product_launch: [
        "Launch our AI-powered analytics platform by Q3",
        "Introduce a mobile-first version of our product",
        "Release our enterprise security suite",
        "Launch a freemium version to capture more market share",
        "Develop and launch our API marketplace"
      ],
      
      digital_transformation: [
        "Modernize our legacy systems to cloud-native architecture",
        "Implement AI-driven customer service automation",
        "Transform our sales process with digital tools",
        "Migrate to a microservices architecture",
        "Digitize our supply chain management"
      ],
      
      competitive_response: [
        "Respond to new competitor entering our market",
        "Defend against price competition from established players",
        "Counter competitor's acquisition of key supplier",
        "Address competitive threat from big tech companies",
        "Respond to competitor's patent challenges"
      ],
      
      scaling_operations: [
        "Scale our engineering team from 20 to 100 people",
        "Expand customer support to 24/7 global coverage",
        "Build redundant infrastructure across three regions",
        "Scale our marketing operations for growth",
        "Establish international sales and support teams"
      ],
      
      financial_strategy: [
        "Raise a Series B funding round of $25M",
        "Achieve profitability within 12 months",
        "Optimize cash flow for sustainable growth",
        "Prepare for an IPO within 24 months",
        "Restructure debt to improve financial flexibility"
      ],
      
      partnership_strategy: [
        "Form strategic partnership with industry leader",
        "Acquire complementary technology company",
        "Establish channel partner network",
        "Create joint venture in new market",
        "Build ecosystem of technology integrations"
      ],
      
      crisis_management: [
        "Address significant security breach and rebuild trust",
        "Navigate regulatory compliance investigation",
        "Manage reputation crisis from product failure",
        "Handle key executive departure",
        "Respond to supply chain disruption"
      ]
    };

    // Context templates that add complexity
    this.contextTemplates = {
      constraints: [
        "Limited budget of $2M for this initiative",
        "Must comply with GDPR and SOX regulations",
        "Existing technical debt slowing development",
        "Key team members unavailable for 3 months",
        "Regulatory approval required before launch"
      ],
      
      market_conditions: [
        "Economic uncertainty affecting customer spending",
        "Rapid technological change in our industry",
        "New regulations coming into effect",
        "Seasonal demand patterns to consider",
        "Supply chain instability"
      ],
      
      competitive_landscape: [
        "Three new competitors entered market this year",
        "Market leader reducing prices aggressively",
        "Technology disruption changing customer expectations",
        "Consolidation happening in our industry",
        "Patent disputes affecting the market"
      ],
      
      internal_factors: [
        "Recent leadership changes affecting strategy",
        "Cultural integration challenges from acquisition",
        "Technical team stretched across multiple projects",
        "Customer churn increasing in key segments",
        "Product quality issues affecting reputation"
      ]
    };

    // Reference link patterns
    this.linkTemplates = [
      "https://company.com/strategy-docs/initiative-{id}",
      "https://docs.google.com/document/d/{id}/edit",
      "https://confluence.company.com/strategic-planning/{id}",
      "https://notion.so/company/Strategic-Initiative-{id}",
      "https://sharepoint.company.com/strategy/{id}"
    ];

    // Business complexity indicators
    this.complexityIndicators = {
      high: ['global', 'regulatory', 'acquisition', 'transformation', 'crisis', 'IPO', 'merger'],
      medium: ['launch', 'expand', 'scale', 'partnership', 'competitive'],
      low: ['optimize', 'improve', 'update', 'maintain']
    };
  }

  /**
   * Generate a single strategic intent input
   */
  generateSingle() {
    const category = this.getRandomKey(this.strategicIntentTemplates);
    const intent = this.getRandomItem(this.strategicIntentTemplates[category]);
    
    const includeContext = Math.random() > 0.3; // 70% chance of context
    const includeLinks = Math.random() > 0.6; // 40% chance of links
    const includeDecisionCount = Math.random() > 0.5; // 50% chance of specific count

    const input = {
      strategic_intent: intent
    };

    if (includeContext) {
      input.context_description = this.generateContext();
    }

    if (includeLinks) {
      input.context_links = this.generateLinks();
    }

    if (includeDecisionCount) {
      input.requested_decisions = Math.floor(Math.random() * 3) + 3; // 3-5
    }

    return input;
  }

  /**
   * Generate multiple inputs for batch testing
   */
  generateBatch(count) {
    const inputs = [];
    const categories = Object.keys(this.strategicIntentTemplates);
    
    for (let i = 0; i < count; i++) {
      // Ensure even distribution across categories
      const categoryIndex = i % categories.length;
      const category = categories[categoryIndex];
      
      const intent = this.getRandomItem(this.strategicIntentTemplates[category]);
      
      const input = {
        strategic_intent: intent,
        _testId: i + 1,
        _category: category,
        _expectedComplexity: this.assessExpectedComplexity(intent)
      };

      // Add context based on test requirements
      if (i % 3 === 0) { // Every 3rd item gets context
        input.context_description = this.generateContext();
      }

      if (i % 5 === 0) { // Every 5th item gets links  
        input.context_links = this.generateLinks();
      }

      if (i % 4 === 0) { // Every 4th item gets specific decision count
        input.requested_decisions = (i % 3) + 3; // Cycles through 3,4,5
      }

      inputs.push(input);
    }

    return inputs;
  }

  /**
   * Generate targeted test scenarios
   */
  generateScenarios(scenarioType) {
    switch (scenarioType) {
      case 'complexity_high':
        return this.generateComplexityScenarios('high');
      case 'complexity_medium':
        return this.generateComplexityScenarios('medium');
      case 'complexity_low':
        return this.generateComplexityScenarios('low');
      case 'decision_counts':
        return this.generateDecisionCountScenarios();
      case 'edge_cases':
        return this.generateEdgeCases();
      case 'validation_tests':
        return this.generateValidationTests();
      default:
        return this.generateBatch(10);
    }
  }

  generateComplexityScenarios(complexity) {
    const indicators = this.complexityIndicators[complexity];
    const scenarios = [];

    for (let i = 0; i < 5; i++) {
      const intent = this.generateIntentWithComplexity(complexity, indicators);
      scenarios.push({
        strategic_intent: intent,
        context_description: this.generateContextForComplexity(complexity),
        _expectedComplexity: complexity,
        _testType: 'complexity_validation'
      });
    }

    return scenarios;
  }

  generateDecisionCountScenarios() {
    const scenarios = [];
    const baseCases = [
      "Launch new product in competitive market",
      "Expand operations to three new regions", 
      "Implement company-wide digital transformation"
    ];

    // Test each decision count (3,4,5) and auto
    [null, 3, 4, 5].forEach(count => {
      baseCases.forEach(intent => {
        const scenario = {
          strategic_intent: intent,
          _testType: 'decision_count_validation',
          _expectedDecisionCount: count
        };
        
        if (count !== null) {
          scenario.requested_decisions = count;
        }
        
        scenarios.push(scenario);
      });
    });

    return scenarios;
  }

  generateEdgeCases() {
    return [
      {
        strategic_intent: "a", // Too short
        _testType: 'validation_error',
        _expectedError: 'length_validation'
      },
      {
        strategic_intent: "A".repeat(501), // Too long
        _testType: 'validation_error', 
        _expectedError: 'length_validation'
      },
      {
        strategic_intent: "Valid strategic intent",
        requested_decisions: 2, // Below minimum
        _testType: 'validation_error',
        _expectedError: 'decision_count_validation'
      },
      {
        strategic_intent: "Valid strategic intent",
        requested_decisions: 6, // Above maximum
        _testType: 'validation_error',
        _expectedError: 'decision_count_validation'
      },
      {
        strategic_intent: "Launch product with very specific niche market targeting", 
        context_description: "C".repeat(1001), // Context too long
        _testType: 'validation_error',
        _expectedError: 'context_length_validation'
      }
    ];
  }

  generateValidationTests() {
    return [
      {
        strategic_intent: "Launch enterprise software platform",
        _testType: 'response_structure_validation'
      },
      {
        strategic_intent: "Expand into international markets", 
        requested_decisions: 4,
        _testType: 'decision_count_accuracy_validation'
      },
      {
        strategic_intent: "Navigate complex regulatory compliance transformation",
        context_description: "Must comply with GDPR, SOX, and emerging AI regulations",
        _testType: 'complexity_assessment_validation'
      }
    ];
  }

  // Helper methods
  generateContext() {
    const contextTypes = Object.keys(this.contextTemplates);
    const selectedType = this.getRandomItem(contextTypes);
    const contexts = this.contextTemplates[selectedType];
    
    // Combine 1-2 context elements
    const numContexts = Math.random() > 0.7 ? 2 : 1;
    const selectedContexts = [];
    
    for (let i = 0; i < numContexts; i++) {
      const context = this.getRandomItem(contexts);
      if (!selectedContexts.includes(context)) {
        selectedContexts.push(context);
      }
    }
    
    return selectedContexts.join('. ');
  }

  generateLinks() {
    const template = this.getRandomItem(this.linkTemplates);
    const id = Math.random().toString(36).substring(2, 15);
    return template.replace('{id}', id);
  }

  generateIntentWithComplexity(complexity, indicators) {
    const templates = Object.values(this.strategicIntentTemplates).flat();
    let candidates = templates.filter(template => {
      const lower = template.toLowerCase();
      return indicators.some(indicator => lower.includes(indicator));
    });

    if (candidates.length === 0) {
      candidates = templates;
    }

    return this.getRandomItem(candidates);
  }

  generateContextForComplexity(complexity) {
    const contextMap = {
      high: ['constraints', 'competitive_landscape', 'market_conditions'],
      medium: ['market_conditions', 'internal_factors'],
      low: ['internal_factors']
    };

    const applicableTypes = contextMap[complexity];
    const selectedType = this.getRandomItem(applicableTypes);
    return this.getRandomItem(this.contextTemplates[selectedType]);
  }

  assessExpectedComplexity(intent) {
    const lower = intent.toLowerCase();
    
    if (this.complexityIndicators.high.some(indicator => lower.includes(indicator))) {
      return 'high';
    } else if (this.complexityIndicators.medium.some(indicator => lower.includes(indicator))) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getRandomKey(object) {
    const keys = Object.keys(object);
    return keys[Math.floor(Math.random() * keys.length)];
  }
}

module.exports = { WatchtowerInputGenerator };