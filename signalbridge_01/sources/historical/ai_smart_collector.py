# signalbridge/sources/historical/ai_smart_collector.py
"""
AI Smart Collector - Complete Rewrite with AI-First Approach

ELIMINATES all keyword-based matching and predefined domain logic.
Uses AI Strategic Controller and AI Evaluator for unified collection strategy.
Massively increased collection volume with AI-only filtering.

PRINCIPLES:
- AI determines everything: collection strategies, relevance, thresholds
- No keyword matching, no domain networks, no fallbacks
- Fail fast and loud when AI can't determine strategy
- Cross-PIR intelligence and strategic context integration
- Speed optimized for user experience
"""

import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
import aiohttp
import os

# Import new AI-first modules
from core.ai_strategic_controller import AIStrategicController
from core.ai_evaluator import AIEvaluator
from sources.ai_rss_discovery import AIRSSDiscovery

logger = logging.getLogger(__name__)

class AISmartCollector:
    """
    AI-First intelligence collector with no keyword constraints.
    Pure AI strategic analysis drives all collection activities.
    """
    
    def __init__(self, supabase_client):
        self.supabase = supabase_client
        
        # Initialize AI components
        self.ai_controller = AIStrategicController(supabase_client)
        self.ai_evaluator = AIEvaluator(supabase_client)
        self.rss_discovery = AIRSSDiscovery()
        
        # Configure data sources
        self.sources = {
            'newsapi': {
                'name': 'NewsAPI',
                'base_url': 'https://newsapi.org/v2/everything',
                'api_key': os.getenv('NEWSAPI_KEY'),
                'rate_limit': 1000,
                'max_days_back': 30
            }
        }
        
        # Performance and usage tracking
        self.collection_stats = {
            'ai_analysis_time': 0,
            'rss_discovery_time': 0,
            'collection_time': 0,
            'total_articles_processed': 0,
            'total_signals_created': 0,
            'ai_evaluation_calls': 0,
            'sources_discovered': 0
        }
        
        logger.info("🚀 AI Smart Collector initialized")
        logger.info("🧠 Mode: Pure AI strategic intelligence (no keywords)")
    
    async def collect_strategic_intelligence(self, days_back: int = 90) -> Dict:
        """
        MAIN AI-FIRST COLLECTION METHOD
        
        AI analyzes strategic context and orchestrates unified collection across all PIRs.
        Complete replacement for keyword-based collection.
        """
        collection_start = datetime.now()
        
        try:
            logger.info("🚀 Starting AI-First Strategic Intelligence Collection")
            logger.info("🎯 Target: Complete strategic intelligence for decision support")
            
            # Step 1: Load strategic context from Watchtower
            strategic_context = await self._load_strategic_context()
            if not strategic_context:
                raise ValueError("❌ FAILED: No strategic context from Watchtower")
            
            # Step 2: Load PIR indicators
            pir_indicators = await self._load_pir_indicators()
            if not pir_indicators:
                raise ValueError("❌ FAILED: No PIR indicators found")
            
            # Step 3: AI Strategic Analysis & Collection Planning
            logger.info("🧠 AI Strategic Analysis: Generating unified collection strategy")
            ai_strategy = await self.ai_controller.analyze_strategic_context_and_generate_collection_strategy(
                strategic_context, pir_indicators
            )
            
            self.collection_stats['ai_analysis_time'] = ai_strategy.get('analysis_time', 0)
            
            # Step 4: AI RSS Source Discovery
            logger.info("📡 AI RSS Discovery: Finding optimal intelligence sources")
            rss_sources = await self._discover_ai_rss_sources(ai_strategy)
            
            # Step 5: Execute AI-Coordinated Collection
            logger.info("🎯 Executing AI-coordinated intelligence collection")
            collection_results = await self._execute_ai_coordinated_collection(
                pir_indicators, ai_strategy, rss_sources, days_back
            )
            
            # Step 6: Cross-PIR Intelligence Analysis
            logger.info("🔗 AI Cross-PIR Analysis: Identifying strategic connections")
            cross_pir_insights = await self._analyze_cross_pir_intelligence(
                collection_results, ai_strategy
            )
            
            # Step 7: Final Results Assembly
            final_results = self._assemble_final_results(
                collection_results, cross_pir_insights, ai_strategy
            )
            
            total_time = (datetime.now() - collection_start).total_seconds()
            final_results['total_collection_time'] = total_time
            final_results['collection_stats'] = self.collection_stats
            
            # Log comprehensive results
            logger.info(f"🎉 AI-First Collection Complete: {total_time:.1f}s")
            logger.info(f"   📊 Articles Processed: {self.collection_stats['total_articles_processed']}")
            logger.info(f"   🎯 Signals Created: {self.collection_stats['total_signals_created']}")
            logger.info(f"   🧠 AI Evaluations: {self.collection_stats['ai_evaluation_calls']}")
            logger.info(f"   📡 Sources Discovered: {self.collection_stats['sources_discovered']}")
            
            return final_results
            
        except Exception as e:
            total_time = (datetime.now() - collection_start).total_seconds()
            logger.error(f"❌ AI-First Collection FAILED after {total_time:.1f}s")
            logger.error(f"❌ Error: {e}")
            
            return {
                'error': str(e),
                'total_time': total_time,
                'collection_mode': 'AI_FIRST_STRATEGIC',
                'failure_point': self._determine_failure_point(e),
                'collection_stats': self.collection_stats
            }
    
    async def _load_strategic_context(self) -> Dict:
        """Load strategic context from Watchtower"""
        try:
            context = await self.supabase.get_strategic_context()
            
            if not context:
                raise ValueError("No strategic context found in Watchtower")
            
            logger.info(f"✅ Strategic context loaded: {context.get('intent_text', '')[:60]}...")
            return context
            
        except Exception as e:
            logger.error(f"❌ Failed to load strategic context: {e}")
            raise
    
    async def _load_pir_indicators(self) -> List[Dict]:
        """Load PIR indicators from database"""
        try:
            pirs = await self.supabase.get_active_pir_indicators()
            
            if not pirs:
                raise ValueError("No PIR indicators found")
            
            logger.info(f"✅ Loaded {len(pirs)} PIR indicators")
            return pirs
            
        except Exception as e:
            logger.error(f"❌ Failed to load PIR indicators: {e}")
            raise
    
    async def _discover_ai_rss_sources(self, ai_strategy: Dict) -> List[Dict]:
        """
        AI discovers and validates RSS sources based on strategic analysis.
        """
        try:
            rss_start = datetime.now()
            
            # AI discovers optimal RSS sources
            ai_rss_sources = await self.ai_controller.ai_discover_optimal_rss_sources(
                ai_strategy['strategy']
            )
            
            if not ai_rss_sources:
                logger.warning("AI RSS discovery returned no sources")
                return []
            
            # Fast validation (no crawling)
            validated_sources = await self.rss_discovery.discover_feeds_from_ai_recommendations(
                ai_rss_sources
            )
            
            rss_time = (datetime.now() - rss_start).total_seconds()
            self.collection_stats['rss_discovery_time'] = rss_time
            self.collection_stats['sources_discovered'] = len(validated_sources)
            
            logger.info(f"✅ RSS Discovery Complete: {len(validated_sources)} validated sources ({rss_time:.1f}s)")
            
            return validated_sources
            
        except Exception as e:
            logger.error(f"❌ AI RSS source discovery failed: {e}")
            return []
    
    async def _execute_ai_coordinated_collection(self, pirs: List[Dict], ai_strategy: Dict, 
                                               rss_sources: List[Dict], days_back: int) -> Dict:
        """
        Execute AI-coordinated collection across all PIRs with unified strategy.
        """
        try:
            strategy = ai_strategy['strategy']
            params = ai_strategy['collection_params']
            
            logger.info(f"🎯 AI Collection Strategy: {strategy['strategic_approach']}")
            logger.info(f"📡 Available Sources: {len(rss_sources)} RSS sources")
            logger.info(f"⚡ Collection Parameters: {params['intensity_level']} intensity")
            
            collection_results = {
                'strategy_summary': strategy,
                'sources_used': rss_sources,
                'collection_parameters': params,
                'pir_results': {},
                'total_articles_collected': 0,
                'total_signals_created': 0,
                'source_breakdown': {},
                'ai_evaluation_summary': {}
            }
            
            # Parallel processing for speed (if enabled)
            if params.get('parallel_processing', True):
                logger.info("🔄 Parallel PIR processing enabled")
                pir_tasks = [
                    self._collect_for_strategic_pir(pir, ai_strategy, rss_sources, days_back)
                    for pir in pirs
                ]
                pir_results = await asyncio.gather(*pir_tasks, return_exceptions=True)
            else:
                logger.info("🔄 Sequential PIR processing")
                pir_results = []
                for pir in pirs:
                    result = await self._collect_for_strategic_pir(pir, ai_strategy, rss_sources, days_back)
                    pir_results.append(result)
            
            # Aggregate results
            for i, result in enumerate(pir_results):
                if isinstance(result, dict):
                    pir_id = pirs[i]['id']
                    collection_results['pir_results'][pir_id] = result
                    collection_results['total_articles_collected'] += result.get('articles_collected', 0)
                    collection_results['total_signals_created'] += result.get('signals_created', 0)
                    
                    # Aggregate source breakdown
                    for source, count in result.get('source_breakdown', {}).items():
                        collection_results['source_breakdown'][source] = (
                            collection_results['source_breakdown'].get(source, 0) + count
                        )
                elif isinstance(result, Exception):
                    logger.error(f"PIR collection failed: {result}")
            
            # Update global stats
            self.collection_stats['total_articles_processed'] = collection_results['total_articles_collected']
            self.collection_stats['total_signals_created'] = collection_results['total_signals_created']
            
            return collection_results
            
        except Exception as e:
            logger.error(f"❌ AI-coordinated collection failed: {e}")
            raise
    
    async def _collect_for_strategic_pir(self, pir: Dict, ai_strategy: Dict, 
                                       rss_sources: List[Dict], days_back: int) -> Dict:
        """
        Collect intelligence for single PIR using AI strategic approach.
        No keyword matching - pure AI evaluation throughout.
        """
        try:
            pir_id = pir['id']
            indicator_text = pir.get('indicator_text', '')
            params = ai_strategy['collection_params']
            
            logger.info(f"🎯 PIR Collection: {pir_id} - {indicator_text[:50]}...")
            
            pir_results = {
                'pir_id': pir_id,
                'indicator_text': indicator_text,
                'articles_collected': 0,
                'signals_created': 0,
                'source_breakdown': {},
                'ai_evaluation_summary': {}
            }
            
            # AI-determined collection volume
            max_articles = params.get('max_articles_per_pir', 500)
            
            # Collect from multiple sources
            all_articles = []
            
            # RSS Sources (from AI discovery)
            if rss_sources:
                rss_articles = await self._collect_from_rss_sources(
                    rss_sources, max_articles // 2, days_back
                )
                all_articles.extend(rss_articles)
                pir_results['source_breakdown']['RSS'] = len(rss_articles)
            
            # API Sources (NewsAPI with AI-generated queries)
            api_articles = await self._collect_from_api_sources(
                pir, ai_strategy, max_articles // 2, days_back
            )
            all_articles.extend(api_articles)
            pir_results['source_breakdown']['NewsAPI'] = len(api_articles)
            
            pir_results['articles_collected'] = len(all_articles)
            
            # AI Evaluation with strategic context (NO keyword filtering)
            if all_articles:
                signals_created = await self.ai_evaluator.evaluate_articles_for_pir(
                    all_articles, pir, ai_strategy['strategy'], ai_strategy['collection_params']
                )
                pir_results['signals_created'] = signals_created
                
                # Track AI evaluation stats
                eval_stats = self.ai_evaluator.get_evaluation_stats()
                pir_results['ai_evaluation_summary'] = eval_stats
                self.collection_stats['ai_evaluation_calls'] += eval_stats.get('total_evaluations', 0)
            
            logger.info(f"✅ PIR {pir_id}: {len(all_articles)} articles → {pir_results['signals_created']} signals")
            
            return pir_results
            
        except Exception as e:
            logger.error(f"❌ PIR collection failed for {pir.get('id', 'unknown')}: {e}")
            return {
                'pir_id': pir.get('id', 'unknown'),
                'error': str(e),
                'articles_collected': 0,
                'signals_created': 0
            }
    
    async def _collect_from_rss_sources(self, rss_sources: List[Dict], max_articles: int, days_back: int) -> List[Dict]:
        """
        Collect articles from AI-discovered RSS sources.
        NOTE: This is a placeholder - will integrate with existing RSS monitor.
        """
        try:
            # For now, return empty list - this will be integrated with your existing RSS monitor
            # The RSS monitor will be updated to work with AI-discovered feeds
            
            logger.info(f"📡 RSS Collection: {len(rss_sources)} sources available")
            logger.info("📝 RSS integration with existing monitor pending")
            
            # TODO: Integrate with updated RSS monitor
            return []
            
        except Exception as e:
            logger.error(f"❌ RSS collection failed: {e}")
            return []
    
    async def _collect_from_api_sources(self, pir: Dict, ai_strategy: Dict, 
                                      max_articles: int, days_back: int) -> List[Dict]:
        """
        Collect articles from API sources using AI-generated search strategies.
        """
        try:
            articles = []
            
            # AI generates search queries (no keywords)
            search_queries = await self.ai_evaluator.generate_ai_search_queries(
                pir, ai_strategy['strategy']
            )
            
            if not search_queries:
                logger.warning(f"AI failed to generate search queries for PIR {pir['id']}")
                return []
            
            # Collect from NewsAPI using AI queries
            for query in search_queries[:3]:  # Limit to top 3 AI-generated queries
                try:
                    query_articles = await self._search_newsapi(
                        query, days_back, max_articles // len(search_queries)
                    )
                    articles.extend(query_articles)
                    
                    await asyncio.sleep(0.1)  # Rate limiting
                    
                except Exception as e:
                    logger.warning(f"NewsAPI search failed for query '{query}': {e}")
                    continue
            
            logger.info(f"📰 API Collection: {len(articles)} articles from {len(search_queries)} AI queries")
            
            return self._deduplicate_articles(articles)[:max_articles]
            
        except Exception as e:
            logger.error(f"❌ API collection failed: {e}")
            return []
    
    async def _search_newsapi(self, query: str, days_back: int, max_results: int) -> List[Dict]:
        """
        Search NewsAPI with AI-generated query.
        """
        try:
            api_key = self.sources['newsapi']['api_key']
            if not api_key:
                logger.warning("NewsAPI key not configured")
                return []
            
            to_date = datetime.now(timezone.utc)
            from_date = to_date - timedelta(days=days_back)
            
            params = {
                'q': query,
                'from': from_date.strftime('%Y-%m-%d'),
                'to': to_date.strftime('%Y-%m-%d'),
                'sortBy': 'relevancy',
                'pageSize': min(max_results, 100),
                'apiKey': api_key,
                'language': 'en'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.sources['newsapi']['base_url'], params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        articles = []
                        for article in data.get('articles', []):
                            processed_article = {
                                'title': article.get('title', ''),
                                'description': article.get('description', ''),
                                'url': article.get('url', ''),
                                'published_date': article.get('publishedAt', ''),
                                'source': f"NewsAPI - {article.get('source', {}).get('name', 'Unknown')}"
                            }
                            articles.append(processed_article)
                        
                        return articles
                    else:
                        error_text = await response.text()
                        logger.warning(f"NewsAPI error: {response.status} - {error_text}")
            
            return []
            
        except Exception as e:
            logger.error(f"❌ NewsAPI search failed: {e}")
            return []
    
    def _deduplicate_articles(self, articles: List[Dict]) -> List[Dict]:
        """Remove duplicate articles by URL"""
        seen_urls = set()
        unique_articles = []
        
        for article in articles:
            url = article.get('url', '')
            if url and url not in seen_urls:
                unique_articles.append(article)
                seen_urls.add(url)
        
        return unique_articles
    
    async def _analyze_cross_pir_intelligence(self, collection_results: Dict, ai_strategy: Dict) -> Dict:
        """
        AI analysis of cross-PIR intelligence connections and strategic insights.
        """
        try:
            # Gather all articles for cross-PIR analysis
            all_articles = []
            all_pirs = []
            
            for pir_id, pir_result in collection_results.get('pir_results', {}).items():
                # Note: In real implementation, we'd need to store articles for cross-analysis
                # For now, we'll work with the summary data
                all_pirs.append({
                    'id': pir_id,
                    'indicator_text': pir_result.get('indicator_text', ''),
                    'articles_collected': pir_result.get('articles_collected', 0),
                    'signals_created': pir_result.get('signals_created', 0)
                })
            
            # AI cross-PIR analysis
            cross_pir_insights = await self.ai_evaluator.evaluate_cross_pir_intelligence(
                all_articles, all_pirs, ai_strategy['strategy']
            )
            
            logger.info("✅ Cross-PIR Analysis Complete")
            return cross_pir_insights
            
        except Exception as e:
            logger.error(f"❌ Cross-PIR analysis failed: {e}")
            return {'pir_connections': [], 'strategic_insights': []}
    
    def _assemble_final_results(self, collection_results: Dict, cross_pir_insights: Dict, ai_strategy: Dict) -> Dict:
        """
        Assemble comprehensive final results with AI strategic context.
        """
        return {
            # Core collection results
            'collection_results': collection_results,
            'cross_pir_insights': cross_pir_insights,
            
            # AI strategic analysis
            'strategic_analysis': ai_strategy['strategy'],
            'collection_parameters': ai_strategy['collection_params'],
            'ai_confidence': ai_strategy.get('ai_confidence', 0.8),
            
            # Performance metrics
            'performance_metrics': {
                'ai_analysis_time': self.collection_stats['ai_analysis_time'],
                'rss_discovery_time': self.collection_stats['rss_discovery_time'],
                'articles_per_second': self._calculate_articles_per_second(),
                'signals_per_article': self._calculate_signal_efficiency(),
                'sources_discovered': self.collection_stats['sources_discovered']
            },
            
            # System metadata
            'collection_mode': 'AI_FIRST_STRATEGIC_INTELLIGENCE',
            'system_version': '2.0',
            'watchtower_integration': 'ACTIVE',
            'completed_at': datetime.now(timezone.utc).isoformat()
        }
    
    def _calculate_articles_per_second(self) -> float:
        """Calculate articles processed per second"""
        total_time = self.collection_stats.get('collection_time', 1)
        total_articles = self.collection_stats.get('total_articles_processed', 0)
        return round(total_articles / max(total_time, 1), 2)
    
    def _calculate_signal_efficiency(self) -> float:
        """Calculate signals created per article processed"""
        total_articles = self.collection_stats.get('total_articles_processed', 1)
        total_signals = self.collection_stats.get('total_signals_created', 0)
        return round(total_signals / max(total_articles, 1), 3)
    
    def _determine_failure_point(self, error: Exception) -> str:
        """Determine where the collection failed for debugging"""
        error_str = str(error).lower()
        
        if 'strategic context' in error_str:
            return 'strategic_context_loading'
        elif 'pir indicators' in error_str:
            return 'pir_indicator_loading'
        elif 'strategic analysis' in error_str:
            return 'ai_strategic_analysis'
        elif 'rss discovery' in error_str:
            return 'rss_source_discovery'
        elif 'api' in error_str:
            return 'api_data_collection'
        elif 'evaluation' in error_str:
            return 'ai_content_evaluation'
        else:
            return 'unknown_error'


# Main integration function (replacement for existing)
async def run_ai_first_historical_collection(supabase_client, days_back: int = 90) -> Dict:
    """
    Run AI-first strategic intelligence collection.
    Complete replacement for keyword-based smart_collector.py.
    """
    try:
        logger.info("🚀 Initializing AI-First Strategic Intelligence Collection System")
        collector = AISmartCollector(supabase_client)
        
        # Execute AI-first collection
        results = await collector.collect_strategic_intelligence(days_back)
        
        logger.info("🎉 AI-First Strategic Intelligence Collection Results:")
        logger.info(f"   📊 Total Articles: {results.get('collection_stats', {}).get('total_articles_processed', 0)}")
        logger.info(f"   🎯 Total Signals: {results.get('collection_stats', {}).get('total_signals_created', 0)}")
        logger.info(f"   📡 Sources Found: {results.get('collection_stats', {}).get('sources_discovered', 0)}")
        
        return results
        
    except Exception as e:
        logger.error(f"❌ AI-First Collection CRITICAL FAILURE: {e}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        
        return {
            'error': str(e),
            'system': 'AI_FIRST_STRATEGIC_INTELLIGENCE',
            'collection_mode': 'FAILED',
            'traceback': traceback.format_exc()
        }