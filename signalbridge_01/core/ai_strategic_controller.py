# signalbridge/core/ai_strategic_controller.py
"""
AI Strategic Controller - Central Brain for Strategic Intelligence

Replaces all keyword-based logic with pure AI strategic analysis.
Coordinates unified collection strategies across all PIRs.

PRINCIPLES:
- AI determines everything: domains, thresholds, collection intensity, source priorities
- No predefined categories or fallbacks - fail fast and loud
- Speed optimized for user experience (60 second max analysis time)
- Cross-PIR intelligence coordination
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
import aiohttp
import json
import os

logger = logging.getLogger(__name__)

class AIStrategicController:
    """
    Central AI brain for strategic intelligence collection.
    Analyzes complete strategic context and coordinates all collection activities.
    """
    
    def __init__(self, supabase_client):
        self.supabase = supabase_client
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        if not self.openai_api_key:
            raise ValueError("❌ FATAL: OPENAI_API_KEY required for AI-first operation")
        
        # Performance constraints - fail fast
        self.MAX_STRATEGY_TIME = 60  # seconds
        self.MAX_FEED_DISCOVERY_TIME = 45  # seconds  
        
        logger.info("🧠 AI Strategic Controller initialized (AI-First Mode)")
    
    async def analyze_strategic_context_and_generate_collection_strategy(self, strategic_context: Dict, pirs: List[Dict]) -> Dict:
        """
        MAIN AI BRAIN METHOD
        
        Analyzes complete strategic context and generates unified collection strategy
        across all PIRs with dynamic parameters determined by AI.
        
        FAILS FAST AND LOUD if AI cannot determine strategy.
        """
        start_time = datetime.now()
        
        try:
            # Store the strategic context for latuer use in RSS discovery
            self.strategic_context = strategic_context
            logger.info("🚀 AI Strategic Analysis: Starting comprehensive intelligence strategy generation")
            
            # Step 1: AI Strategic Analysis (60 seconds max)
            strategy = await self._ai_generate_unified_strategy(strategic_context, pirs)
            
            if not strategy:
                raise ValueError("❌ AI STRATEGIC ANALYSIS FAILED: Could not generate collection strategy")
            
            # Step 2: AI Collection Parameters (instant)
            collection_params = await self._ai_determine_collection_parameters(strategy, pirs)
            
            total_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"✅ AI Strategic Analysis Complete: {total_time:.1f}s")
            logger.info(f"   🎯 Strategy: {strategy['strategic_approach']}")
            logger.info(f"   ⚡ Collection Intensity: {collection_params['intensity_level']}")
            logger.info(f"   🎚️ AI Threshold: {collection_params['relevance_threshold']:.3f}")
            
            return {
                'strategy': strategy,
                'collection_params': collection_params,
                'analysis_time': total_time,
                'ai_confidence': strategy.get('confidence_score', 0.8)
            }
            
        except Exception as e:
            total_time = (datetime.now() - start_time).total_seconds()
            logger.error(f"❌ AI STRATEGIC ANALYSIS FAILED after {total_time:.1f}s: {e}")
            raise ValueError(f"AI Strategic Controller failed: {e}")
    
    async def ai_discover_optimal_rss_sources(self, strategy: Dict) -> List[Dict]:
        """
        AI discovers optimal RSS sources based on strategic analysis.
        Uses fast discovery (no crawling) for speed.
        """
        try:
            logger.info("📡 AI RSS Discovery: Finding optimal sources for strategic objectives")
            
            prompt = self._build_rss_discovery_prompt(strategy)
            
            async with aiohttp.ClientSession() as session:
                ai_response = await asyncio.wait_for(
                    self._call_openai_rss_discovery(session, prompt),
                    timeout=self.MAX_FEED_DISCOVERY_TIME
                )
            
            if not ai_response or 'recommended_sources' not in ai_response:
                raise ValueError("❌ AI RSS DISCOVERY FAILED: Invalid source recommendations")
            
            discovered_sources = ai_response['recommended_sources']
            
            logger.info(f"✅ AI RSS Discovery: {len(discovered_sources)} sources identified")
            logger.info(f"   🎯 Strategic Focus: {ai_response.get('industry_analysis', 'Multi-domain')}")
            
            failed_feed_names = []
            if hasattr(self, 'rss_discovery') and hasattr(self.rss_discovery, 'failed_feed_names'):
                failed_feed_names = self.rss_discovery.failed_feed_names

            return discovered_sources, failed_feed_names
            
        except asyncio.TimeoutError:
            raise ValueError(f"❌ AI RSS discovery timed out after {self.MAX_FEED_DISCOVERY_TIME}s")
        except Exception as e:
            raise ValueError(f"❌ AI RSS discovery failed: {e}")
    
    async def _ai_generate_unified_strategy(self, strategic_context: Dict, pirs: List[Dict]) -> Dict:
        """
        AI analyzes strategic context and generates unified collection strategy.
        """
        try:
            prompt = self._build_strategic_analysis_prompt(strategic_context, pirs)
            
            async with aiohttp.ClientSession() as session:
                response = await asyncio.wait_for(
                    self._call_openai_strategic_analysis(session, prompt),
                    timeout=self.MAX_STRATEGY_TIME
                )
            
            if not response or 'strategic_approach' not in response:
                raise ValueError("AI returned invalid strategic analysis")
            
            # Validate required AI analysis components
            required_fields = ['strategic_approach', 'intelligence_domains', 'urgency_level', 
                             'collection_intensity', 'relevance_threshold']
            for field in required_fields:
                if field not in response:
                    raise ValueError(f"AI analysis missing required field: {field}")
            
            return response
            
        except asyncio.TimeoutError:
            raise ValueError(f"❌ AI strategic analysis timed out after {self.MAX_STRATEGY_TIME}s")
        except Exception as e:
            raise ValueError(f"❌ AI strategic analysis failed: {e}")
    
    def _build_strategic_analysis_prompt(self, strategic_context: Dict, pirs: List[Dict]) -> str:
        """
        Build comprehensive prompt for AI strategic analysis.
        """
        strategic_goal = strategic_context.get('intent_text', '')
        context = strategic_context.get('context', '')
        decisions = strategic_context.get('decisions', [])
        
        pir_summaries = []
        for pir in pirs:
            pir_summaries.append(f"- {pir.get('indicator_text', '')}")
        
        decision_summaries = []
        for decision in decisions:
            decision_summaries.append(f"- {decision}")
        
        prompt = f"""You are an expert strategic intelligence analyst. Analyze this complete strategic context and generate a unified intelligence collection strategy.

STRATEGIC OBJECTIVE:
{strategic_goal}

STRATEGIC CONTEXT:
{context}

CRITICAL DECISIONS TO INFORM:
{chr(10).join(decision_summaries)}

PRIORITY INTELLIGENCE REQUIREMENTS:
{chr(10).join(pir_summaries)}

ANALYSIS TASK:
Generate a unified intelligence collection strategy that determines:

1. STRATEGIC APPROACH: What is the core intelligence challenge? (competitive intelligence, market analysis, regulatory monitoring, technology assessment, crisis management, etc.)

2. INTELLIGENCE DOMAINS: What specific domains/industries/sectors need monitoring? (Discover from context - do NOT use predefined categories)

3. URGENCY LEVEL: How urgent is this intelligence need? 
   - crisis (immediate decisions needed, lower quality thresholds)
   - strategic (weeks timeframe, balanced approach)  
   - long_term (months, higher quality thresholds)

4. CROSS-PIR CONNECTIONS: How do these PIRs relate to each other? What intelligence serves multiple PIRs?

5. COLLECTION INTENSITY: How much data collection is warranted?
   - light (200 articles per PIR)
   - standard (500 articles per PIR)
   - intensive (1000 articles per PIR)
   - comprehensive (2000 articles per PIR)

6. RELEVANCE THRESHOLD: How selective should signal evaluation be?
   - very_selective (0.7 threshold - only high-confidence matches)
   - selective (0.5 threshold - good quality control)
   - balanced (0.3 threshold - balanced coverage vs quality) [RECOMMENDED FOR MOST CASES]
   - inclusive (0.15 threshold - broad coverage, more noise)

7. SOURCE PRIORITIES: What types of sources are most valuable? (news, industry_publications, government_data, financial_reports, technology_sources)

Respond in JSON format:
{{
    "strategic_approach": "Brief description of the core intelligence challenge",
    "intelligence_domains": ["domain1", "domain2", "domain3"],
    "urgency_level": "crisis|strategic|long_term",
    "cross_pir_analysis": "How PIRs connect and support each other",
    "collection_intensity": "light|standard|intensive|comprehensive", 
    "relevance_threshold": "very_selective|selective|balanced|inclusive",
    "source_priorities": ["priority1", "priority2", "priority3"],
    "confidence_score": 0.0-1.0,
    "reasoning": "Brief explanation of strategic analysis"
}}

Focus on what intelligence is actually needed to answer the decisions and PIRs. Be specific about domains discovered from the strategic context."""
        
        return prompt
    
    def _build_rss_discovery_prompt(self, strategy: Dict) -> str:
        """
        Build prompt for AI RSS source discovery based on strategic analysis. 
        Now with proper domain analysis and debug logging.
        """
        domains = strategy.get('intelligence_domains', [])
        approach = strategy.get('strategic_approach', '')
        priorities = strategy.get('source_priorities', [])
    
        # Get the full strategic context for domain analysis
        strategic_goal = self.strategic_context.get('strategic_goal', '')
        strategic_context = self.strategic_context.get('strategic_context', '')
    
        # DEBUG: Log what the AI is seeing
        logger.info(f"🔍 AI RSS Discovery Debug:")
        logger.info(f"   📋 Strategic Goal: {strategic_goal[:100]}...")
        logger.info(f"   📝 Strategic Context: {strategic_context[:150]}...")
        logger.info(f"   🎯 AI Strategy: {approach}")
        logger.info(f"   🏷️ Domains: {domains}")
    
        prompt = f"""You are an expert intelligence analyst specializing in identifying industry-specific information sources. Your task is to perform DOMAIN-SPECIFIC analysis and find specialized trade publications.

STRATEGIC OBJECTIVE: {strategic_goal}

STRATEGIC CONTEXT: {strategic_context}

AI STRATEGY: {approach}
INTELLIGENCE DOMAINS: {', '.join(domains)}

CRITICAL ANALYSIS TASK:

1. DOMAIN IDENTIFICATION (MANDATORY):
   - Analyze the strategic objective and context for specific industry indicators
   - Look for technical terms, company names, geographic regions, technologies, business sectors
   - Examples of industry indicators:
     * "hydraulic fracturing" + "upstream" + "oil and gas" = OIL & GAS INDUSTRY
     * "pharmaceutical development" + "FDA" = PHARMACEUTICAL INDUSTRY  
     * "cybersecurity" + "network security" = CYBERSECURITY INDUSTRY
     * "agricultural" + "farming" + "crops" = AGRICULTURE INDUSTRY

2. INDUSTRY MAPPING (MANDATORY):
   - Once you identify the specific industry, find the AUTHORITATIVE TRADE PUBLICATIONS that professionals in that industry read
   - DO NOT suggest generic business publications (Forbes, Bloomberg, Reuters) unless the objective is specifically about general business/finance
   - Examples of proper industry mapping:
     * Oil & Gas Industry → Oil & Gas Journal, Rigzone, World Oil, SPE publications, Energy industry sources
     * Pharma Industry → BioPharma Dive, FiercePharma, FDA feeds, PharmaManufacturing
     * Cybersecurity → Dark Reading, Security Week, CISA feeds, InfoSec publications

3. SOURCE PRIORITIZATION:
   - Prioritize specialized trade magazines and professional journals
   - Include relevant regulatory/government sources for the specific industry
   - Include industry association publications
   - AVOID generic news sources unless they have industry-specific sections

ANALYSIS INSTRUCTIONS:
- Start by identifying the core industry from technical terminology in the strategic context
- Map that industry to its specialized publication ecosystem
- Think like a domain expert - what publications would professionals in this specific field read?
- Be industry-specific, not generic

Find 8-12 RSS sources that industry professionals would actually use for intelligence in this specific domain:

Respond in JSON format:
{{
    "domain_analysis": {{
        "industry_identified": "Name of the specific industry identified from context",
        "key_indicators": ["list", "of", "technical", "terms", "that", "identified", "industry"],
        "reasoning": "Why this context indicates this specific industry"
    }},
    "industry_mapping": {{
        "trade_publications": "What are the key trade publications for this industry",
        "professional_sources": "What sources do professionals in this field read",
        "regulatory_sources": "What regulatory/government sources are relevant"
    }},
    "recommended_sources": [
        {{
            "domain": "example.com",
            "name": "Publication Name",
            "rss_url": "https://example.com/rss.xml",
            "source_type": "trade_publication|professional_journal|regulatory|industry_association",
            "industry_relevance": "Why this specific publication is authoritative for the identified industry",
            "confidence": 0.0-1.0
        }}
    ]
}}

CRITICAL: You must identify the specific industry first, then find sources that industry experts read. Do not suggest generic business publications unless specifically relevant."""
    
        return prompt
    
    async def _ai_determine_collection_parameters(self, strategy: Dict, pirs: List[Dict]) -> Dict:
        """
        AI determines dynamic collection parameters based on strategic analysis.
        """
        urgency = strategy.get('urgency_level', 'strategic')
        intensity = strategy.get('collection_intensity', 'standard')
        threshold_type = strategy.get('relevance_threshold', 'balanced')
        
        # AI-determined parameters
        params = {
            'max_articles_per_pir': self._calculate_collection_volume(intensity, len(pirs)),
            'relevance_threshold': self._calculate_relevance_threshold(threshold_type, urgency),
            'parallel_processing': True,
            'cross_pir_analysis': strategy.get('cross_pir_analysis', ''),
            'collection_timeout': self._calculate_timeout(urgency, intensity),
            'intensity_level': intensity,
            'urgency_level': urgency,
            'ai_evaluation_batch_size': self._calculate_ai_batch_size(intensity),
            'max_signals_per_pir': self._calculate_max_signals(intensity)
        }
        
        logger.info(f"⚡ AI Collection Parameters:")
        logger.info(f"   📊 Articles per PIR: {params['max_articles_per_pir']}")
        logger.info(f"   🎯 Relevance Threshold: {params['relevance_threshold']:.3f}")
        logger.info(f"   ⏱️ Timeout: {params['collection_timeout']}s")
        logger.info(f"   🎚️ Max Signals per PIR: {params['max_signals_per_pir']}")
        
        return params
    
    def _calculate_collection_volume(self, intensity: str, pir_count: int) -> int:
        """Calculate collection volume based on AI-determined intensity"""
        base_volumes = {
            'light': 200,
            'standard': 500, 
            'intensive': 1000,
            'comprehensive': 2000
        }
        
        base = base_volumes.get(intensity, 500)
        
        # Scale down for many PIRs to manage total volume and API costs
        if pir_count > 5:
            scaling_factor = max(0.5, 1.0 - (pir_count - 5) * 0.1)
            base = int(base * scaling_factor)
        
        return base
    
    def _calculate_relevance_threshold(self, threshold_type: str, urgency: str) -> float:
        """Calculate AI-determined relevance threshold"""
        base_thresholds = {
            'very_selective': 0.7,
            'selective': 0.5, 
            'balanced': 0.3,
            'inclusive': 0.15
        }
        
        threshold = base_thresholds.get(threshold_type, 0.3)
        
        # Adjust for urgency
        if urgency == 'crisis':
            threshold *= 0.7  # Lower threshold for urgent needs
        elif urgency == 'long_term':
            threshold *= 1.2  # Higher threshold for long-term strategic
        
        return max(0.1, min(0.8, threshold))
    
    def _calculate_timeout(self, urgency: str, intensity: str) -> int:
        """Calculate collection timeout based on urgency and intensity"""
        base_timeouts = {
            'crisis': 180,      # 3 minutes for urgent
            'strategic': 300,   # 5 minutes for standard
            'long_term': 450    # 7.5 minutes for comprehensive
        }
        
        timeout = base_timeouts.get(urgency, 300)
        
        # Adjust for intensity
        if intensity == 'comprehensive':
            timeout = int(timeout * 1.5)
        elif intensity == 'light':
            timeout = int(timeout * 0.7)
        
        return timeout
    
    def _calculate_ai_batch_size(self, intensity: str) -> int:
        """Calculate AI evaluation batch size for performance"""
        batch_sizes = {
            'light': 20,
            'standard': 30,
            'intensive': 50,
            'comprehensive': 100
        }
        return batch_sizes.get(intensity, 30)
    
    def _calculate_max_signals(self, intensity: str) -> int:
        """Calculate maximum signals per PIR"""
        max_signals = {
            'light': 15,
            'standard': 25,
            'intensive': 50,
            'comprehensive': 100
        }
        return max_signals.get(intensity, 25)
    
    async def _call_openai_strategic_analysis(self, session: aiohttp.ClientSession, prompt: str) -> Dict:
        """Call OpenAI for strategic analysis"""
        try:
            headers = {
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'model': 'gpt-4o',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an expert strategic intelligence analyst. Always respond with valid JSON only.'
                    },
                    {
                        'role': 'user', 
                        'content': prompt
                    }
                ],
                'temperature': 0.2,
                'max_tokens': 1000
            }
            
            async with session.post('https://api.openai.com/v1/chat/completions', 
                                   headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    content = data['choices'][0]['message']['content']
                    
                    # Clean and parse JSON
                    clean_content = content.strip()
                    if clean_content.startswith('```json'):
                        clean_content = clean_content.replace('```json', '').replace('```', '').strip()
                    
                    return json.loads(clean_content)
                else:
                    error_text = await response.text()
                    raise ValueError(f"OpenAI API error {response.status}: {error_text}")
                    
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON from AI strategic analysis: {e}")
        except Exception as e:
            raise ValueError(f"AI strategic analysis API call failed: {e}")
    
    async def _call_openai_rss_discovery(self, session: aiohttp.ClientSession, prompt: str) -> Dict:
        """Call OpenAI for RSS source discovery"""
        try:
            headers = {
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'model': 'gpt-4o-mini',  # Use mini for source discovery
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an expert at finding RSS feeds for strategic intelligence. Always respond with valid JSON only.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.1,
                'max_tokens': 1500
            }
            
            async with session.post('https://api.openai.com/v1/chat/completions',
                                   headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    content = data['choices'][0]['message']['content']

                    # DEBUG: Log the raw AI response
                    logger.info(f"Raw AI RSS DISCOVERY RESPONSE:")
                    logger.info(f"Content: {content}")
                    
                    # Clean and parse JSON
                    clean_content = content.strip()
                    if clean_content.startswith('```json'):
                        clean_content = clean_content.replace('```json', '').replace('```', '').strip()

                    parsed_response = json.loads(clean_content)

                    #DEBUG: Log the parsed response structure
                    logger.info(f"PARSED AI ANALYSIS:")
                    if 'domain_analysis' in parsed_response:
                        domain_info = parsed_response['domain_analysis']
                        logger.info(f" Industry Identified: {domain_info.get('industry_identified', 'N/A')}")
                        logger.info(f" Key Indicators: {domain_info.get('key_indicators', [])}")
                        logger.info(f" Reasoning: {domain_info.get('reasoning', 'N/A')}")

                    return parsed_response
                else:
                    error_text = await response.text()
                    raise ValueError(f"OpenAI API error {response.status}: {error_text}")
                
        except json.JSONDecodeError as e:
            logger.error(f"INVALID JSON FROM AI: {e}")
            logger.error(f"Raw content: {content}")
            raise ValueError(f"Invalid JSON from AI RSS discovery: {e}")
        except Exception as e:
            raise ValueError(f"AI RSS discovery API call failed{e}")
        
    async def ai_discover_sec_sources(self, strategy: Dict) -> List[Dict]:
        """
        AI discovers relevant SEC sources (companies) based on strategic analysis.
        """
        try:
            logger.info("📊 AI SEC Discovery: Finding companies for SEC/EDGAR monitoring")
            
            # Use SEC-specific discovery prompt
            prompt = self._build_sec_company_discovery_prompt(strategy)
            
            async with aiohttp.ClientSession() as session:
                ai_response = await asyncio.wait_for(
                    self._call_openai_sec_discovery(session, prompt),
                    timeout=self.MAX_FEED_DISCOVERY_TIME
                )
            
            if not ai_response or 'recommended_companies' not in ai_response:
                logger.warning("AI SEC discovery returned no companies")
                return []
            
            discovered_companies = ai_response['recommended_companies']
            
            logger.info(f"✅ AI SEC Discovery: {len(discovered_companies)} companies identified")
            logger.info(f"   🎯 Focus: {ai_response.get('strategic_analysis', {}).get('intelligence_focus', 'Multi-sector')}")
            
            return discovered_companies
            
        except Exception as e:
            logger.error(f"❌ AI SEC discovery failed: {e}")
            return []

    def _build_sec_company_discovery_prompt(self, strategy: Dict) -> str:
        """Build prompt for AI company discovery for SEC monitoring."""
        domains = strategy.get('intelligence_domains', [])
        approach = strategy.get('strategic_approach', '')
        
        strategic_goal = self.strategic_context.get('strategic_goal', '')
        strategic_context = self.strategic_context.get('strategic_context', '')
        
        prompt = f"""You are an expert financial intelligence analyst. Your task is to identify publicly traded companies whose SEC filings would provide strategic intelligence.

STRATEGIC OBJECTIVE: {strategic_goal}

STRATEGIC CONTEXT: {strategic_context}

AI STRATEGY: {approach}
INTELLIGENCE DOMAINS: {', '.join(domains)}

COMPANY IDENTIFICATION TASK:

1. STRATEGIC COMPANY ANALYSIS:
   - Identify publicly traded companies mentioned in the strategic context
   - Find industry leaders relevant to the intelligence domains
   - Include competitors and market movers in relevant sectors

2. FILING VALUE ASSESSMENT:
   - Focus on companies whose SEC filings would contain strategic intelligence
   - Prioritize companies with material impact on the strategic objectives
   - Include both direct competitors and supply chain partners

3. TICKER/CIK IDENTIFICATION:
   - Provide stock ticker symbols when known
   - Include company legal names for CIK lookup

Find 8-15 companies whose SEC filings would provide strategic intelligence:

Respond in JSON format:
{{
    "strategic_analysis": {{
        "key_sectors": ["sector1", "sector2"],
        "intelligence_focus": "What type of intelligence these filings will provide",
        "competitive_landscape": "How these companies relate strategically"
    }},
    "recommended_companies": [
        {{
            "company_name": "Apple Inc.",
            "ticker": "AAPL",
            "strategic_relevance": "Why this company's filings are strategically important",
            "filing_focus": "What specific information to monitor in their filings",
            "priority": "high|medium|low"
        }}
    ]
}}

Focus on companies whose SEC filings would directly inform the strategic decisions and PIRs."""
        
        return prompt

    async def _call_openai_sec_discovery(self, session: aiohttp.ClientSession, prompt: str) -> Dict:
        """Call OpenAI for SEC company discovery"""
        try:
            headers = {
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'model': 'gpt-4o-mini',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an expert at identifying companies for strategic intelligence. Always respond with valid JSON only.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.1,
                'max_tokens': 1500
            }
            
            async with session.post('https://api.openai.com/v1/chat/completions',
                                   headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    content = data['choices'][0]['message']['content']
                    
                    clean_content = content.strip()
                    if clean_content.startswith('```json'):
                        clean_content = clean_content.replace('```json', '').replace('```', '').strip()
                    
                    return json.loads(clean_content)
                else:
                    error_text = await response.text()
                    raise ValueError(f"OpenAI API error {response.status}: {error_text}")
                    
        except json.JSONDecodeError as e:
            logger.warning(f"Invalid JSON from AI SEC discovery: {e}")
            return {}
        except Exception as e:
            logger.error(f"SEC discovery API call failed: {e}")
            return {}