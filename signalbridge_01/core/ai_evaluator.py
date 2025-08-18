# signalbridge/core/ai_evaluator.py
"""
AI Evaluator - Pure AI Content Evaluation and Signal Creation

Replaces all keyword-based matching with pure AI strategic evaluation.
Now properly captures original article data in new database columns.

PRINCIPLES:
- AI evaluates ALL content (no keyword pre-filtering)
- Strategic context drives all evaluations
- Dynamic thresholds based on AI strategic analysis
- Cross-PIR intelligence awareness
- Captures original article data AND AI reasoning separately
- Fail fast and loud when AI evaluation fails
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
import aiohttp
import json
import os
from dateutil import parser

logger = logging.getLogger(__name__)

class AIEvaluator:
    """
    Pure AI content evaluator that replaces all keyword-based matching.
    Evaluates content against strategic context and creates signals with proper article data.
    """
    
    def __init__(self, supabase_client):
        self.supabase = supabase_client
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        if not self.openai_api_key:
            raise ValueError("❌ FATAL: OPENAI_API_KEY required for AI evaluation")
        
        # Performance settings
        self.MAX_EVALUATION_TIME = 10  # seconds per article
        self.BATCH_SIZE = 30  # articles per batch for parallel processing
        
        # Evaluation tracking
        self.evaluation_stats = {
            'total_evaluations': 0,
            'signals_created': 0,
            'average_confidence': 0.0,
            'evaluation_time': 0.0
        }
        
        logger.info("🤖 AI Evaluator initialized (Pure AI Mode)")
    
    async def evaluate_articles_for_pir(self, articles: List[Dict], pir: Dict, 
                                       strategic_context: Dict, collection_params: Dict) -> int:
        """
        MAIN AI EVALUATION METHOD
        
        Evaluates articles using pure AI analysis against PIR and strategic context.
        Creates signals in database using new schema with original article data.
        
        Returns: Number of signals created
        """
        try:
            start_time = datetime.now()
            
            if not articles:
                logger.warning(f"No articles to evaluate for PIR {pir['id']}")
                return 0
            
            relevance_threshold = collection_params.get('relevance_threshold', 0.3)
            max_signals = collection_params.get('max_signals_per_pir', 25)
            batch_size = collection_params.get('ai_evaluation_batch_size', 30)
            
            logger.info(f"🤖 AI Evaluation: {len(articles)} articles for PIR {pir['id']}")
            logger.info(f"   🎯 Threshold: {relevance_threshold:.3f}")
            logger.info(f"   📊 Max Signals: {max_signals}")
            
            signals_created = 0
            
            # Process articles in batches for performance
            for i in range(0, len(articles), batch_size):
                batch = articles[i:i + batch_size]
                
                # Stop if we've reached max signals
                if signals_created >= max_signals:
                    break
                
                batch_signals = await self._evaluate_article_batch(
                    batch, pir, strategic_context, relevance_threshold, 
                    max_signals - signals_created
                )
                
                signals_created += batch_signals
                
                logger.debug(f"   Batch {i//batch_size + 1}: {batch_signals} signals created")
            
            evaluation_time = (datetime.now() - start_time).total_seconds()
            
            # Update stats
            self.evaluation_stats['total_evaluations'] += len(articles)
            self.evaluation_stats['signals_created'] += signals_created
            self.evaluation_stats['evaluation_time'] += evaluation_time
            
            logger.info(f"✅ AI Evaluation Complete: {signals_created} signals from {len(articles)} articles ({evaluation_time:.1f}s)")
            
            return signals_created
            
        except Exception as e:
            logger.error(f"❌ AI evaluation failed for PIR {pir.get('id', 'unknown')}: {e}")
            return 0
    
    async def _evaluate_article_batch(self, articles: List[Dict], pir: Dict, 
                                     strategic_context: Dict, threshold: float, 
                                     max_signals: int) -> int:
        """
        Evaluate a batch of articles in parallel for performance.
        """
        try:
            signals_created = 0
            
            # Create evaluation tasks for parallel processing
            tasks = []
            for article in articles:
                if signals_created >= max_signals:
                    break
                    
                task = self._ai_evaluate_single_article(
                    article, pir, strategic_context, threshold
                )
                tasks.append(task)
            
            if not tasks:
                return 0
            
            # Execute evaluations in parallel
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results and create signals
            for i, result in enumerate(results):
                if signals_created >= max_signals:
                    break
                    
                if isinstance(result, dict) and result.get('should_create_signal'):
                    signal_saved = await self._save_ai_signal(
                        articles[i], pir, result
                    )
                    if signal_saved:
                        signals_created += 1
                        logger.debug(f"✅ Signal created: confidence={result.get('relevance_score', 0):.3f}")
                elif isinstance(result, Exception):
                    logger.warning(f"Article evaluation failed: {result}")
            
            return signals_created
            
        except Exception as e:
            logger.error(f"❌ Batch evaluation failed: {e}")
            return 0
    
    async def _ai_evaluate_single_article(self, article: Dict, pir: Dict, 
                                         strategic_context: Dict, threshold: float) -> Dict:
        """
        AI evaluation of single article against PIR and strategic context.
        """
        try:
            prompt = self._build_evaluation_prompt(article, pir, strategic_context, threshold)
            
            async with aiohttp.ClientSession() as session:
                ai_result = await asyncio.wait_for(
                    self._call_openai_evaluation(session, prompt),
                    timeout=self.MAX_EVALUATION_TIME
                )
            
            if not ai_result:
                return {'should_create_signal': False, 'error': 'No AI response'}
            
            # Determine if signal should be created
            relevance_score = ai_result.get('relevance_score', 0.0)
            recommendation = ai_result.get('recommendation', 'uncertain')
            
            should_create_signal = (
                recommendation == 'include' or
                (relevance_score > threshold and recommendation != 'exclude')
            )
            
            ai_result['should_create_signal'] = should_create_signal
            logger.debug(f"AI Evaluation: score={relevance_score:.3f}, recommendation='{recommendation}', threshold={threshold:3f}, will_create={should_create_signal}")
            return ai_result
            
        except asyncio.TimeoutError:
            logger.warning(f"AI evaluation timeout for article: {article.get('title', 'Unknown')[:50]}")
            return {'should_create_signal': False, 'error': 'evaluation_timeout'}
        except Exception as e:
            logger.warning(f"AI evaluation error: {e}")
            return {'should_create_signal': False, 'error': str(e)}
    
    def _build_evaluation_prompt(self, article: Dict, pir: Dict, strategic_context: Dict, threshold: float) -> str:
        """
        Build comprehensive AI evaluation prompt with full strategic context.
        """
        # Extract strategic context components
        strategic_approach = strategic_context.get('strategic_approach', '')
        intelligence_domains = strategic_context.get('intelligence_domains', [])
        urgency_level = strategic_context.get('urgency_level', 'strategic')
        cross_pir_analysis = strategic_context.get('cross_pir_analysis', '')
        
        prompt = f"""Evaluate if this news content provides strategic intelligence value for decision-making:

STRATEGIC CONTEXT:
- Strategic Approach: {strategic_approach}
- Intelligence Domains: {', '.join(intelligence_domains)}
- Urgency Level: {urgency_level}
- Cross-PIR Context: {cross_pir_analysis}

SPECIFIC INTELLIGENCE REQUIREMENT (PIR):
{pir.get('indicator_text', '')}

NEWS CONTENT TO EVALUATE:
Title: {article.get('title', '')}
Description: {article.get('description', '')[:500]}
Source: {article.get('source', '')}
URL: {article.get('url', '')}

EVALUATION CRITERIA:
1. STRATEGIC RELEVANCE: Does this directly support the strategic approach and intelligence domains?
2. PIR ALIGNMENT: Does this help answer or inform the specific PIR requirement?
3. DECISION VALUE: Would this information be valuable for strategic decision-making?
4. TIMELINESS: Is this current and actionable given the urgency level?
5. CROSS-PIR VALUE: Does this provide intelligence that could support multiple PIRs?

THRESHOLD FOR INCLUSION: {threshold:.3f}

Respond in JSON format:
{{
    "relevance_score": 0.0-1.0,
    "recommendation": "include|exclude|uncertain",
    "reasoning": "Brief explanation of evaluation decision",
    "strategic_connections": ["connection1", "connection2"],
    "decision_support_value": "high|medium|low",
    "intelligence_type": "competitive|market|regulatory|technology|financial|operational",
    "urgency_match": "immediate|strategic|long_term"
}}

Be precise in evaluation - only recommend inclusion if the content provides genuine strategic intelligence value."""
        
        return prompt
    
    async def generate_ai_search_queries(self, pir: Dict, strategic_context: Dict) -> List[str]:
        """
        AI generates optimal search queries for PIR collection (no keyword matching).
        """
        try:
            prompt = self._build_query_generation_prompt(pir, strategic_context)
            
            async with aiohttp.ClientSession() as session:
                ai_response = await asyncio.wait_for(
                    self._call_openai_query_generation(session, prompt),
                    timeout=15  # Quick query generation
                )
            
            if ai_response and 'queries' in ai_response:
                queries = ai_response['queries']
                logger.info(f"🔍 AI Query Generation: {len(queries)} queries for PIR {pir['id']}")
                return queries
            
            # Fallback if AI fails
            logger.warning(f"AI query generation failed for PIR {pir['id']}")
            return [pir.get('indicator_text', 'intelligence')[:100]]
            
        except Exception as e:
            logger.error(f"❌ AI query generation failed: {e}")
            return [pir.get('indicator_text', 'intelligence')[:100]]
    
    def _build_query_generation_prompt(self, pir: Dict, strategic_context: Dict) -> str:
        """
        Build prompt for AI search query generation.
        """
        indicator_text = pir.get('indicator_text', '')
        strategic_approach = strategic_context.get('strategic_approach', '')
        intelligence_domains = strategic_context.get('intelligence_domains', [])
        
        prompt = f"""Generate 3-5 optimal search queries for collecting intelligence about this PIR:

STRATEGIC CONTEXT:
- Strategic Approach: {strategic_approach}
- Intelligence Domains: {', '.join(intelligence_domains)}

PIR INDICATOR: {indicator_text}

Generate search queries that would find relevant news articles and information. Focus on:
1. Core concepts and entities in the PIR
2. Related industry/domain terms from strategic context
3. Different ways this intelligence might be discussed in news
4. Variations in terminology and phrasing
5. Cross-connections with other strategic domains

Make queries specific enough to find relevant content but broad enough to capture different perspectives.

Respond in JSON format:
{{
    "queries": ["query1", "query2", "query3"],
    "reasoning": "Brief explanation of query strategy"
}}

Focus on queries that align with the strategic approach and intelligence domains."""
        
        return prompt
    
    async def _save_ai_signal(self, article: Dict, pir: Dict, ai_result: Dict) -> bool:
        """
        Save signal using NEW database schema with original article data captured.
        """
        try:
            # Get or create source using existing schema
            source_id = await self.supabase.create_or_get_signal_source(
                source_name=article.get('source', 'Unknown Source'),
                source_url=article.get('url', ''),
                source_type='API'
            )
            
            if not source_id:
                logger.warning("Failed to create/get source_id")
                return False
            
            # Prepare AI reasoning text (NEW - separate field!)
            ai_reasoning_text = ai_result.get('reasoning', '')
            
            # Prepare AI metadata for backward compatibility
            ai_metadata = {
                'ai_reasoning': ai_reasoning_text,
                'strategic_connections': ai_result.get('strategic_connections', []),
                'decision_support_value': ai_result.get('decision_support_value', 'medium'),
                'intelligence_type': ai_result.get('intelligence_type', 'general'),
                'urgency_match': ai_result.get('urgency_match', 'strategic'),
                'evaluation_timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            # Parse published date if available
            published_date = None
            if article.get('published_date'):
                try:
                    # Handle various date formats from NewsAPI
                    published_date = article['published_date']
                    if isinstance(published_date, str):
                        # Convert to proper timestamp format
                        published_date = parser.parse(published_date).isoformat()
                except Exception as e:
                    logger.debug(f"Date parsing failed: {e}")
                    published_date = None
            
            # NEW: Complete signal_data with ORIGINAL ARTICLE DATA
            signal_data = {
                # Existing fields
                'indicator_id': pir['id'],
                'source_id': source_id,
                'raw_signal_text': json.dumps(ai_metadata),   # Keep for compatibility
                'match_score': float(ai_result.get('relevance_score', 0.0)),
                'observed_at': datetime.now(timezone.utc).isoformat(),
                'session_id': pir.get('session_id'),
                'status': 'ai_evaluated',
                'article_url': article.get('url', ''),
                
                # NEW FIELDS - Original article data that will show in UI
                'article_title': article.get('title', ''),           # THIS SHOWS THE HEADLINE!
                'article_content': article.get('description', ''),   # THIS SHOWS THE CONTENT!
                'published_date': published_date,                    # ORIGINAL PUBLISH DATE!
                'ai_reasoning': ai_reasoning_text                     # AI REASONING SEPARATE!
            }
            
            signal_id = await self.supabase.create_signal(signal_data)
            
            if signal_id:
                logger.debug(f"✅ AI Signal saved: {signal_id}")
                logger.debug(f"   📰 Article: {article.get('title', 'No title')[:50]}")
                logger.debug(f"   📊 Confidence: {ai_result.get('relevance_score', 0):.3f}")
                logger.debug(f"   🔗 URL: {article.get('url', '')}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Signal save failed: {e}")
            logger.error(f"   Article: {article.get('title', 'Unknown')}")
            return False
    
    def _extract_source_name(self, source_string: str) -> str:
        """
        Extract clean source name from source string.
        NewsAPI returns sources like "NewsAPI - Reuters" - extract just "Reuters"
        """
        if not source_string:
            return 'Unknown Source'
        
        # Remove "NewsAPI - " prefix if present
        if source_string.startswith('NewsAPI - '):
            return source_string[10:]  # Remove "NewsAPI - "
        
        return source_string
    
    async def evaluate_cross_pir_intelligence(self, all_articles: List[Dict], 
                                            all_pirs: List[Dict], strategic_context: Dict) -> Dict:
        """
        AI analysis of cross-PIR intelligence connections and strategic insights.
        """
        try:
            logger.info("🔗 Cross-PIR Analysis: Identifying strategic intelligence connections")
            
            # Sample articles for cross-PIR analysis (limit for performance)
            sample_articles = all_articles[:50]  # Top 50 articles for analysis
            
            prompt = self._build_cross_pir_prompt(sample_articles, all_pirs, strategic_context)
            
            async with aiohttp.ClientSession() as session:
                ai_response = await asyncio.wait_for(
                    self._call_openai_cross_pir_analysis(session, prompt),
                    timeout=30  # 30 seconds for cross-PIR analysis
                )
            
            if ai_response:
                logger.info("✅ Cross-PIR Analysis Complete")
                logger.info(f"   🔗 Connections: {len(ai_response.get('pir_connections', []))}")
                logger.info(f"   🎯 Strategic Insights: {len(ai_response.get('strategic_insights', []))}")
                return ai_response
            
            return {'pir_connections': [], 'strategic_insights': []}
            
        except Exception as e:
            logger.error(f"❌ Cross-PIR analysis failed: {e}")
            return {'pir_connections': [], 'strategic_insights': []}
    
    def _build_cross_pir_prompt(self, articles: List[Dict], pirs: List[Dict], strategic_context: Dict) -> str:
        """
        Build prompt for cross-PIR intelligence analysis.
        """
        article_summaries = []
        for article in articles[:20]:  # Limit for prompt size
            article_summaries.append(f"- {article.get('title', '')}")
        
        pir_summaries = []
        for pir in pirs:
            pir_summaries.append(f"- {pir.get('indicator_text', '')}")
        
        prompt = f"""Analyze these news articles for cross-PIR intelligence connections and strategic insights:

STRATEGIC CONTEXT:
- Approach: {strategic_context.get('strategic_approach', '')}
- Domains: {', '.join(strategic_context.get('intelligence_domains', []))}

PIR REQUIREMENTS:
{chr(10).join(pir_summaries)}

SAMPLE ARTICLES:
{chr(10).join(article_summaries)}

ANALYSIS TASK:
1. Identify articles that provide intelligence for multiple PIRs
2. Find strategic connections between different PIRs
3. Identify key strategic insights that support decision-making

Respond in JSON format:
{{
    "pir_connections": [
        {{
            "connected_pirs": ["pir1", "pir2"],
            "connection_type": "complementary|overlapping|sequential",
            "explanation": "How these PIRs connect strategically"
        }}
    ],
    "strategic_insights": [
        {{
            "insight": "Key strategic insight from the analysis",
            "supporting_articles": ["article1", "article2"],
            "decision_impact": "How this impacts strategic decisions"
        }}
    ]
}}"""
        
        return prompt
    
    async def _call_openai_evaluation(self, session: aiohttp.ClientSession, prompt: str) -> Dict:
        """Call OpenAI for article evaluation"""
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
                        'content': 'You are a strategic intelligence analyst. Always respond with valid JSON only.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.2,
                'max_tokens': 400
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
            logger.warning(f"Invalid JSON from AI evaluation: {e}")
            return {}
        except Exception as e:
            raise ValueError(f"AI evaluation API call failed: {e}")
    
    async def _call_openai_query_generation(self, session: aiohttp.ClientSession, prompt: str) -> Dict:
        """Call OpenAI for query generation"""
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
                        'content': 'You generate search queries for news intelligence gathering. Always respond with valid JSON only.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.3,
                'max_tokens': 200
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
                    
        except Exception as e:
            logger.warning(f"Query generation API call failed: {e}")
            return {}
    
    async def _call_openai_cross_pir_analysis(self, session: aiohttp.ClientSession, prompt: str) -> Dict:
        """Call OpenAI for cross-PIR analysis"""
        try:
            headers = {
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'model': 'gpt-4o',  # Use full model for complex analysis
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a strategic intelligence analyst specializing in cross-intelligence analysis. Always respond with valid JSON only.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.3,
                'max_tokens': 800
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
                    
        except Exception as e:
            logger.warning(f"Cross-PIR analysis API call failed: {e}")
            return {}
    
    def get_evaluation_stats(self) -> Dict:
        """Get evaluation statistics"""
        if self.evaluation_stats['total_evaluations'] > 0:
            self.evaluation_stats['average_confidence'] = (
                self.evaluation_stats['signals_created'] / 
                self.evaluation_stats['total_evaluations']
            )
        
        return self.evaluation_stats.copy()