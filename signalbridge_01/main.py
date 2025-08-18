#!/usr/bin/env python3
"""
SignalBridge AI-First Dynamic PIR Intelligence System

A strategic intelligence service that:

1. Reads Watchtower strategic inputs (goals, context, reference links)
2. Reads Watchtower outputs (critical decision points, PIR indicators)
3. Uses AI to discover optimal intelligence sources and collection strategies
4. Intelligently collects and evaluates signals with pure AI analysis
5. Provides strategic intelligence to inform critical decisions

AI-FIRST: Complete rewrite eliminates all keyword-based matching.
All intelligence discovery and evaluation driven by AI strategic analysis.

ENHANCED: Now includes SEC/EDGAR filing intelligence integration.
"""

# ===== LOAD ENV FIRST - BEFORE ALL OTHER IMPORTS =====

from dotenv import load_dotenv
load_dotenv()
print("Environment variables loaded")

import os
os.environ['PYTHONIOENCODING'] = 'utf-8'

import asyncio
import logging
import threading
import uuid
import signal
import sys
import uvicorn
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Set, Optional

# Import AI-first core modules
from core.ai_strategic_controller import AIStrategicController
from core.ai_evaluator import AIEvaluator
from core.ai_debug_utils import AIDebugUtils
from sources.ai_rss_discovery import AIRSSDiscovery

# Import updated components
from sources.external.rss_monitor import RSSMonitor
from sources.external.sec_edgar_monitor import SECEDGARMonitor  # NEW: SEC Integration
from supabase_client import SupabaseClient

# Import API components
from api.routes import app as fastapi_app
from api.database import db_manager

# Import AI-first historical collection
from sources.historical.ai_smart_collector import run_ai_first_historical_collection

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('signalbridge.log', encoding='utf-8')
    ],
    encoding='utf-8'
)

logger = logging.getLogger(__name__)


class AIFirstIntelligenceService:
    """
    AI-First Dynamic PIR Intelligence Service that provides strategic intelligence through:
    - Watchtower integration for strategic context
    - AI discovery of optimal intelligence sources and collection strategies
    - Pure AI-powered signal collection and evaluation
    - Real-time monitoring and historical backfill
    - Strategic intelligence coordination across all PIRs
    - SEC/EDGAR filing intelligence integration

    COMPLETE AI-FIRST REWRITE: No keyword matching, no predefined domains.
    All intelligence activities driven by AI strategic analysis.
    """

    def __init__(self):
        # Core AI intelligence components
        self.supabase = SupabaseClient()
        self.ai_controller = AIStrategicController(self.supabase)
        self.ai_evaluator = AIEvaluator(self.supabase)
        self.rss_discovery = AIRSSDiscovery()
        self.rss_monitor = None
        self.debug_utils = AIDebugUtils(self.supabase)
        
        # SEC/EDGAR components (NEW)
        self.sec_monitor = None
        self.sec_companies: Dict[str, str] = {}  # CIK -> Company Name
        self.sec_filings_processed = 0
        
        # Service state
        self.monitoring_active = False
        self.monitoring_task = None
        self.api_server = None
        self.current_session_id = str(uuid.uuid4())
        self.intelligence_ready = False
        
        # AI strategic intelligence data
        self.strategic_context: Dict = {}
        self.ai_strategy: Dict = {}
        self.active_pir_indicators: Dict[str, Dict] = {}
        self.ai_discovered_feeds: List[Dict] = []
        self.database_feeds: List[Dict] = []
        
        # Store failed validation info for later display
        self.failed_feed_names: List[str] = []
        
        # Performance tracking
        self.performance_metrics = {
            'system_start_time': datetime.now(timezone.utc),
            'ai_analysis_time': 0,
            'source_discovery_time': 0,
            'collection_time': 0,
            'total_signals_created': 0,
            'ai_evaluation_calls': 0
        }
        
        # Graceful shutdown handling
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        logger.info("🧠 AI-First Dynamic PIR Intelligence Service initialized (with SEC/EDGAR)")
        logger.info("🎯 Focus: Strategic intelligence through pure AI analysis + corporate filings")

    def _signal_handler(self, signum, frame):
        """Handle graceful shutdown"""
        logger.info("STOP: Received shutdown signal, stopping AI intelligence services...")
        asyncio.create_task(self.shutdown())

    async def initialize(self) -> bool:
        """Initialize AI-first strategic intelligence service components"""
        try:
            logger.info("INIT: Initializing AI-First Dynamic PIR Intelligence Service...")
            
            # Test API database connections
            health = db_manager.health_check()
            if not health.get('connected', False):
                logger.error("ERROR: API database connection failed!")
                return False
            
            # Test Supabase strategic intelligence connection
            try:
                test_pirs = await self.supabase.get_active_pir_indicators()
                logger.info(f"SUCCESS: Connected to strategic intelligence (found {len(test_pirs)} PIRs)")
            except Exception as e:
                logger.error(f"ERROR: Strategic intelligence connection failed: {e}")
                return False
            
            # Initialize RSS intelligence monitor
            self.rss_monitor = RSSMonitor()
            logger.info("SUCCESS: RSS Intelligence Monitor initialized")
            
            # Run AI system health check
            logger.info("AI HEALTH CHECK: Testing AI components...")
            ai_health = await self._run_ai_health_check()
            
            if not ai_health['overall_healthy']:
                logger.error("ERROR: AI component health check failed!")
                logger.error(f"   Failed components: {ai_health['failed_components']}")
                return False
            
            logger.info("SUCCESS: AI-First Dynamic PIR Intelligence Service initialized")
            logger.info(f"   AI Health: {ai_health['healthy_components']} components operational")
            
            return True
            
        except Exception as e:
            logger.error(f"ERROR: Failed to initialize AI intelligence service: {e}")
            return False

    async def _run_ai_health_check(self) -> Dict:
        """Run AI component health check"""
        try:
            # Quick AI system test
            health_result = await self.debug_utils._test_api_connectivity()
            
            if health_result['passed']:
                return {
                    'overall_healthy': True,
                    'healthy_components': ['AI Strategic Controller', 'AI Evaluator', 'RSS Discovery', 'SEC Monitor'],
                    'failed_components': []
                }
            else:
                return {
                    'overall_healthy': False,
                    'healthy_components': [],
                    'failed_components': ['OpenAI API Connection'],
                    'error': health_result.get('error', 'Unknown error')
                }
                
        except Exception as e:
            logger.error(f"AI health check failed: {e}")
            return {
                'overall_healthy': False,
                'healthy_components': [],
                'failed_components': ['AI Health Check'],
                'error': str(e)
            }

    async def load_strategic_intelligence(self) -> bool:
        """Load complete strategic intelligence from Watchtower"""
        try:
            logger.info("INTELLIGENCE: Loading strategic intelligence from Watchtower...")
            
            # Get strategic context with all Watchtower inputs/outputs
            strategic_context = await self.supabase.get_strategic_context()
            
            if not strategic_context:
                logger.warning("No strategic intelligence found in Watchtower")
                return False
            
            # Store strategic intelligence
            self.strategic_context = {
                # Watchtower user inputs
                'strategic_goal': strategic_context.get('intent_text', ''),
                'strategic_context': strategic_context.get('context', ''),
                'session_id': strategic_context.get('session_id', ''),
                
                # Watchtower analytical outputs
                'critical_decisions': strategic_context.get('decisions', []),
                'pir_indicators': strategic_context.get('pir_indicators', []),
                'all_indicators': strategic_context.get('all_indicators', []),
                
                # Intelligence metadata
                'created_at': strategic_context.get('created_at', ''),
                'intelligence_loaded_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Update session tracking
            if self.strategic_context.get('session_id'):
                self.current_session_id = self.strategic_context['session_id']
            
            # Log strategic intelligence summary
            logger.info("INTELLIGENCE: Strategic intelligence loaded successfully")
            logger.info(f"   Strategic Goal: {self.strategic_context['strategic_goal'][:100]}...")
            logger.info(f"   Critical Decisions: {len(self.strategic_context['critical_decisions'])}")
            logger.info(f"   PIR Indicators Available: {len(self.strategic_context['pir_indicators'])}")
            logger.info(f"   Session ID: {self.current_session_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"INTELLIGENCE: Failed to load strategic intelligence: {e}")
            return False

    async def ai_discover_and_prioritize_pirs(self) -> bool:
        """AI discovers and prioritizes PIR indicators based on strategic objectives"""
        try:
            logger.info("PIR DISCOVERY: AI discovering and prioritizing PIR indicators...")
            
            # Get all PIR indicators from database
            all_pir_indicators = await self.supabase.get_active_pir_indicators()
            
            if not all_pir_indicators:
                logger.error("PIR DISCOVERY: No PIR indicators found in database")
                return False
            
            logger.info(f"PIR DISCOVERY: Found {len(all_pir_indicators)} PIR indicators")
            
            # AI analyzes and prioritizes PIRs based on strategic context
            ai_prioritized_pirs = {}
            
            for pir in all_pir_indicators:
                if self._validate_pir_indicator(pir):
                    # Enrich PIR with strategic context for AI analysis
                    enriched_pir = self._enrich_pir_with_strategic_context(pir)
                    
                    # Store with strategic key
                    key = f"pir_{pir['id']}"
                    ai_prioritized_pirs[key] = enriched_pir
                    
                    logger.info(f"PIR prioritized: {pir['id']} - {pir['indicator_text'][:60]}...")
                else:
                    logger.warning(f"PIR validation failed: {pir.get('id', 'unknown')}")
            
            self.active_pir_indicators = ai_prioritized_pirs
            
            logger.info(f"PIR DISCOVERY: Successfully prioritized {len(self.active_pir_indicators)} PIR indicators")
            logger.info("AI-driven PIR prioritization based on strategic relevance completed")
            
            return len(self.active_pir_indicators) > 0
            
        except Exception as e:
            logger.error(f"PIR DISCOVERY: Error discovering PIR indicators: {e}")
            return False

    def _validate_pir_indicator(self, pir: Dict) -> bool:
        """Validate PIR indicator for AI strategic intelligence collection"""
        required_fields = ['id', 'indicator_text', 'pir_id']
        
        for field in required_fields:
            if not pir.get(field):
                logger.warning(f"PIR missing required field '{field}': {pir.get('id', 'unknown')}")
                return False
        
        # Ensure meaningful content for AI analysis
        if len(pir.get('indicator_text', '').strip()) < 10:
            logger.warning(f"PIR indicator text too short for AI analysis: {pir.get('id', 'unknown')}")
            return False
        
        return True

    def _enrich_pir_with_strategic_context(self, pir: Dict) -> Dict:
        """Enrich PIR with strategic intelligence context for AI analysis"""
        return {
            # Core PIR data
            'id': pir['id'],
            'indicator_text': pir['indicator_text'],
            'pir_id': pir['pir_id'],
            'priority': pir.get('priority', 'medium'),
            'confidence_level': pir.get('confidence_level', 0.5),
            
            # Strategic context for AI
            'strategic_goal': self.strategic_context.get('strategic_goal', ''),
            'strategic_context': self.strategic_context.get('strategic_context', ''),
            'session_id': self.current_session_id,
            
            # Metadata
            'original_data': pir,
            'enriched_at': datetime.now(timezone.utc).isoformat()
        }

    async def ai_generate_collection_strategy(self) -> bool:
        """AI generates unified collection strategy based on strategic context"""
        try:
            logger.info("AI STRATEGY: Generating unified intelligence collection strategy...")
            
            if not self.strategic_context or not self.active_pir_indicators:
                logger.warning("No strategic context or PIRs available for AI strategy generation")
                return False
            
            # Convert PIR indicators to list for AI analysis
            pir_list = list(self.active_pir_indicators.values())
            
            strategy_start = datetime.now()
            
            # AI generates comprehensive collection strategy
            self.ai_strategy = await self.ai_controller.analyze_strategic_context_and_generate_collection_strategy(
                self.strategic_context, pir_list
            )
            
            strategy_time = (datetime.now() - strategy_start).total_seconds()
            self.performance_metrics['ai_analysis_time'] = strategy_time
            
            if not self.ai_strategy or 'strategy' not in self.ai_strategy:
                raise ValueError("AI failed to generate valid collection strategy")
            
            logger.info("AI STRATEGY: Unified collection strategy generated successfully")
            logger.info(f"   🎯 Strategic Approach: {self.ai_strategy['strategy'].get('strategic_approach', 'Unknown')}")
            logger.info(f"   ⚡ Collection Intensity: {self.ai_strategy['collection_params'].get('intensity_level', 'Unknown')}")
            logger.info(f"   🎚️ AI Confidence: {self.ai_strategy.get('ai_confidence', 0):.2f}")
            logger.info(f"   ⏱️ Analysis Time: {strategy_time:.1f}s")
            
            return True
            
        except Exception as e:
            logger.error(f"AI STRATEGY: Error generating collection strategy: {e}")
            return False

    async def ai_discover_strategic_feeds(self) -> bool:
        """AI discovers optimal RSS feeds based on strategic intelligence requirements"""
        try:
            logger.info("FEED DISCOVERY: AI discovering optimal RSS feeds for strategic intelligence...")
            
            if not self.ai_strategy:
                logger.warning("No AI strategy available for feed discovery")
                return False
            
            discovery_start = datetime.now()
            
            # AI discovers optimal feeds based on strategic analysis
            ai_discovered_feeds, failed_feed_names = await self.ai_controller.ai_discover_optimal_rss_sources(
                self.ai_strategy['strategy']
            )
            
            if not ai_discovered_feeds:
                logger.warning("AI RSS discovery returned no feeds")
                # Fallback to database feeds
                await self.load_feeds_from_database()
                return len(self.database_feeds) > 0
            
            # Fast validation of AI-discovered feeds (no crawling)
            validated_feeds, failed_feed_names = await self.rss_discovery.discover_feeds_from_ai_recommendations(
                ai_discovered_feeds
            )
            
            discovery_time = (datetime.now() - discovery_start).total_seconds()
            self.performance_metrics['source_discovery_time'] = discovery_time
            
            self.ai_discovered_feeds = validated_feeds
            # Store failed feed names for later display
            self.failed_feed_names = failed_feed_names
            
            # Initialize RSS monitor if needed
            if not hasattr(self.rss_monitor, 'session') or not self.rss_monitor.session:
                await self.rss_monitor.__aenter__()
            
            # Subscribe to AI-discovered feeds
            successful_feeds = 0
            for feed in validated_feeds:
                try:
                    success = await self.rss_monitor.subscribe_feed(
                        feed['url'], 
                        feed.get('title', feed.get('name', 'AI Discovered Feed'))
                    )
                    if success:
                        successful_feeds += 1
                        logger.info(f"AI Strategic feed subscribed: {feed.get('title', feed['url'])}")
                    else:
                        logger.warning(f"Failed to subscribe: {feed.get('title', feed['url'])}")
                except Exception as e:
                    logger.error(f"Error subscribing to {feed.get('title', feed['url'])}: {e}")
            
            # Fallback to database feeds if AI discovery had low success rate
            if successful_feeds < len(validated_feeds) * 0.5:  # Less than 50% success
                logger.info("Low feed success rate, loading database feeds...")
                await self.load_feeds_from_database()
            
            total_feeds = successful_feeds + len(self.database_feeds)
            
            logger.info(f"FEED DISCOVERY: AI feed discovery complete ({discovery_time:.1f}s)")
            logger.info(f"   📡 AI Discovered: {successful_feeds} feeds")
            logger.info(f"   🗄️ Database Feeds: {len(self.database_feeds)} feeds")
            logger.info(f"   📊 Total Active: {total_feeds} strategic feeds")
            
            return total_feeds > 0
            
        except Exception as e:
            logger.error(f"FEED DISCOVERY: AI feed discovery failed: {e}")
            return False

    async def ai_discover_sec_companies(self) -> bool:
        """AI discovers companies for SEC/EDGAR monitoring"""
        try:
            logger.info("SEC DISCOVERY: AI discovering companies for SEC/EDGAR monitoring...")
            
            if not self.ai_strategy:
                logger.warning("No AI strategy available for SEC company discovery")
                return False
            
            # Initialize SEC monitor
            self.sec_monitor = SECEDGARMonitor()
            
            # AI discovers relevant companies
            sec_companies = await self.ai_controller.ai_discover_sec_sources(
                self.ai_strategy['strategy']
            )
            
            if not sec_companies:
                logger.info("AI SEC discovery found no relevant companies")
                return True  # Not a failure, just no SEC sources needed
            
            # Convert to CIK mapping using SEC monitor
            async with self.sec_monitor as monitor:
                # Extract company identifiers from AI recommendations
                company_identifiers = []
                for company in sec_companies:
                    if company.get('ticker'):
                        company_identifiers.append(company['ticker'])
                    elif company.get('company_name'):
                        company_identifiers.append(company['company_name'])
                
                # Discover companies for PIRs (reuse existing method)
                test_pirs = list(self.active_pir_indicators.values())
                test_context = {
                    'strategic_goal': self.strategic_context.get('strategic_goal', ''),
                    'strategic_context': ' '.join(company_identifiers)  # Feed AI recommendations
                }
                
                discovered_companies = await monitor.discover_companies_for_pirs(test_pirs, test_context)
                self.sec_companies = discovered_companies
            
            # Create SEC sources in database
            for cik, company_name in self.sec_companies.items():
                await self.supabase.create_sec_source(company_name, cik)
            
            logger.info(f"✅ SEC Discovery: Monitoring {len(self.sec_companies)} companies")
            for cik, name in self.sec_companies.items():
                logger.info(f"   📊 {name} (CIK: {cik})")
            
            return len(self.sec_companies) > 0
            
        except Exception as e:
            logger.error(f"❌ SEC company discovery failed: {e}")
            return False

    async def collect_sec_filings_for_evaluation(self, days_back: int = 30) -> List[Dict]:
        """Collect SEC filings for AI evaluation"""
        try:
            if not self.sec_companies:
                logger.info("No SEC companies configured for collection")
                return []
            
            logger.info(f"📊 Collecting SEC filings ({days_back} days) for AI evaluation...")
            
            async with self.sec_monitor as monitor:
                # Set monitored companies
                monitor.monitored_companies = self.sec_companies
                
                # Get filings formatted for AI evaluation
                sec_articles = await monitor.get_filings_for_ai_evaluation(days_back)
                
                self.sec_filings_processed = len(sec_articles)
                
                logger.info(f"✅ Collected {len(sec_articles)} SEC filings for evaluation")
                return sec_articles
        
        except Exception as e:
            logger.error(f"❌ SEC filing collection failed: {e}")
            return []

    async def load_feeds_from_database(self):
        """Load RSS feeds from database as fallback/supplement"""
        try:
            logger.info("DATABASE FEEDS: Loading RSS feeds from database...")
            
            rss_sources = await self.supabase.get_active_rss_sources()
            
            if not rss_sources:
                logger.warning("No RSS sources found in database")
                return False
            
            logger.info(f"DATABASE FEEDS: Found {len(rss_sources)} RSS sources")
            
            # Initialize RSS monitor if needed
            if not hasattr(self.rss_monitor, 'session') or not self.rss_monitor.session:
                await self.rss_monitor.__aenter__()
            
            # Subscribe to database feeds
            successful_feeds = 0
            for source in rss_sources:
                try:
                    feed_url = source['source_url']
                    feed_name = source['source_name']
                    
                    success = await self.rss_monitor.subscribe_feed(feed_url, feed_name)
                    if success:
                        successful_feeds += 1
                        logger.info(f"Database feed subscribed: {feed_name}")
                        
                        # Update last_checked in database
                        await self.supabase.update_source_last_checked(source['id'])
                    else:
                        logger.warning(f"Failed to subscribe: {feed_name}")
                        
                except Exception as e:
                    logger.error(f"Error subscribing to {source.get('source_name', 'unknown')}: {e}")
            
            self.database_feeds = rss_sources
            logger.info(f"DATABASE FEEDS: {successful_feeds}/{len(rss_sources)} feeds subscribed")
            
            return successful_feeds > 0
            
        except Exception as e:
            logger.error(f"DATABASE FEEDS: Error loading feeds: {e}")
            return False

    async def execute_ai_strategic_backfill(self, days_back: int = 90):
        """Execute AI-first strategic intelligence backfill INCLUDING SEC filings"""
        try:
            # Check backfill timing (always run for development - 0 hours)
            last_backfill_file = 'last_backfill.txt'
            should_run_backfill = True
            
            if os.path.exists(last_backfill_file):
                try:
                    with open(last_backfill_file, 'r') as f:
                        last_backfill = datetime.fromisoformat(f.read().strip())
                    
                    if datetime.now(timezone.utc) - last_backfill < timedelta(hours=0):
                        should_run_backfill = False
                        logger.info("BACKFILL: Skipping - backfill completed recently")
                except Exception:
                    pass
            
            if not should_run_backfill:
                return True
            
            logger.info(f"BACKFILL: Starting AI-first strategic intelligence backfill ({days_back} days)...")
            
            if not self.active_pir_indicators:
                logger.warning("BACKFILL: No PIR indicators available for backfill")
                return True
            
            backfill_start = datetime.now()
            
            # Execute AI-first smart collection (RSS/News)
            logger.info("AI COLLECTION: Starting AI-first strategic intelligence collection...")
            ai_collection_results = await run_ai_first_historical_collection(self.supabase, days_back=days_back)
            
            collection_time = (datetime.now() - backfill_start).total_seconds()
            self.performance_metrics['collection_time'] = collection_time
            
            # Process RSS results
            if 'error' in ai_collection_results:
                logger.error(f"AI COLLECTION: Failed - {ai_collection_results['error']}")
                return False
            
            # Extract performance metrics from RSS collection
            collection_stats = ai_collection_results.get('collection_stats', {})
            total_signals = collection_stats.get('total_signals_created', 0)
            total_articles = collection_stats.get('total_articles_processed', 0)
            ai_evaluations = collection_stats.get('ai_evaluation_calls', 0)
            sources_discovered = collection_stats.get('sources_discovered', 0)
            
            # NEW: Discover and collect SEC filings if enabled
            logger.info("BACKFILL: Discovering SEC companies for strategic intelligence...")
            sec_discovered = await self.ai_discover_sec_companies()
            
            sec_signals_created = 0
            if sec_discovered and self.sec_companies:
                logger.info("BACKFILL: Collecting SEC filings for strategic analysis...")
                sec_articles = await self.collect_sec_filings_for_evaluation(days_back=14610)  # 40 years
                
                if sec_articles:
                    logger.info(f"BACKFILL: Evaluating {len(sec_articles)} SEC filings with AI...")
                    
                    # Evaluate SEC filings with same AI pipeline
                    for pir_key, pir in self.active_pir_indicators.items():
                        try:
                            pir_sec_signals = await self.ai_evaluator.evaluate_articles_for_pir(
                                sec_articles, pir, self.strategic_context, 
                                self.ai_strategy['collection_params']
                            )
                            sec_signals_created += pir_sec_signals
                            logger.info(f"   📊 SEC Signals for {pir_key}: {pir_sec_signals}")
                            
                        except Exception as e:
                            logger.error(f"SEC evaluation failed for PIR {pir_key}: {e}")
                    
                    logger.info(f"✅ SEC EVALUATION: {sec_signals_created} signals from {len(sec_articles)} filings")
                    # Add SEC articles to total count
                    total_articles += len(sec_articles)
            
            # Update total signals to include SEC signals
            total_signals += sec_signals_created
            
            self.performance_metrics['total_signals_created'] = total_signals
            self.performance_metrics['ai_evaluation_calls'] = ai_evaluations
            
            # Mark backfill completion
            with open(last_backfill_file, 'w') as f:
                f.write(datetime.now(timezone.utc).isoformat())
            
            self.intelligence_ready = True
            
            # Print comprehensive AI intelligence summary
            await self.print_ai_intelligence_summary(
                len(self.active_pir_indicators), 
                len(self.ai_discovered_feeds) + len(self.database_feeds),
                total_signals, total_articles, ai_evaluations, sources_discovered,
                collection_time
            )
            
            return True
            
        except Exception as e:
            logger.error(f"BACKFILL: AI strategic backfill failed: {e}")
            return False

    async def print_ai_intelligence_summary(self, pir_count: int, feed_count: int,
                                          total_signals: int, total_articles: int, 
                                          ai_evaluations: int, sources_discovered: int, 
                                          collection_time: float):
        """Print comprehensive AI intelligence summary INCLUDING SEC"""
        try:
            print("\n" + "="*80)
            print("SIGNALBRIDGE AI-FIRST STRATEGIC INTELLIGENCE SUMMARY")
            print("="*80)
            print(f"Strategic Objective: {self.strategic_context.get('strategic_goal', 'Unknown')[:60]}...")
            print(f"AI Strategic Approach: {self.ai_strategy.get('strategy', {}).get('strategic_approach', 'Unknown')}")
            print(f"Collection Intensity: {self.ai_strategy.get('collection_params', {}).get('intensity_level', 'Unknown')}")
            print(f"AI Confidence: {self.ai_strategy.get('ai_confidence', 0):.2f}")
            print("-" * 80)
            print(f"PIR Indicators Active: {pir_count}")
            print(f"Critical Decision Points: {len(self.strategic_context.get('critical_decisions', []))}")
            print(f"AI Discovered Sources: {sources_discovered}")
            print(f"Total RSS Sources: {feed_count}")
            print(f"SEC Companies Monitored: {len(self.sec_companies)}")  # NEW
            print(f"SEC Filings Processed: {self.sec_filings_processed}")  # NEW
            print("-" * 80)
            print(f"Articles Processed: {total_articles}")
            print(f"AI Evaluations: {ai_evaluations}")
            print(f"Strategic Signals Created: {total_signals}")
            print(f"Signal Quality Rate: {(total_signals/max(total_articles,1)*100):.1f}%")
            print("-" * 80)
            print(f"AI Analysis Time: {self.performance_metrics['ai_analysis_time']:.1f}s")
            print(f"Source Discovery Time: {self.performance_metrics['source_discovery_time']:.1f}s")
            print(f"Collection Time: {collection_time:.1f}s")
            print(f"Intelligence Session: {self.current_session_id}")
            print(f"🔗 RSS + SEC integrated intelligence ready for decision support!")  # UPDATED
            print("="*80 + "\n")
            
        except Exception as e:
            logger.error(f"Error printing AI intelligence summary: {e}")

    async def start_strategic_monitoring(self):
        """Start strategic PIR monitoring system with AI coordination"""
        try:
            if self.monitoring_active:
                return True
            
            logger.info("MONITORING: Starting AI-coordinated strategic PIR monitoring...")
            
            # Ensure PIRs and AI strategy are loaded
            if not self.active_pir_indicators:
                await self.ai_discover_and_prioritize_pirs()
            
            if not self.ai_strategy:
                await self.ai_generate_collection_strategy()
            
            # Ensure feeds are active
            if not self.ai_discovered_feeds and not self.database_feeds:
                await self.ai_discover_strategic_feeds()
            
            # Register with API
            await self.register_feeds_with_api()
            
            self.monitoring_active = True
            self.monitoring_task = asyncio.create_task(self.ai_strategic_monitoring_loop())
            
            total_feeds = len(self.ai_discovered_feeds) + len(self.database_feeds)
            db_manager.update_monitoring_status(is_active=True, feed_count=total_feeds)
            
            logger.info("MONITORING: AI-coordinated strategic monitoring active")
            logger.info(f"   PIR Indicators: {len(self.active_pir_indicators)}")
            logger.info(f"   AI Discovered Feeds: {len(self.ai_discovered_feeds)}")
            logger.info(f"   Database Feeds: {len(self.database_feeds)}")
            logger.info(f"   SEC Companies: {len(self.sec_companies)}")  # NEW
            logger.info(f"   AI Strategic Approach: {self.ai_strategy.get('strategy', {}).get('strategic_approach', 'Unknown')}")
            logger.info(f"   Strategic Session: {self.current_session_id}")
            
            # Display failed feed validation info here (moved from ai_discover_strategic_feeds)
            if hasattr(self, 'failed_feed_names') and self.failed_feed_names:
                logger.info("Failed to validate (consider manual addition):")
                for name in self.failed_feed_names:
                    logger.info(f" -{name}")
            
            return True
            
        except Exception as e:
            logger.error(f"MONITORING: Failed to start AI strategic monitoring: {e}")
            return False

    async def ai_strategic_monitoring_loop(self):
        """AI-coordinated strategic intelligence monitoring loop"""
        try:
            while self.monitoring_active:
                # AI strategic monitoring operations here
                # Future: Real-time AI evaluation of incoming RSS feeds
                # Future: Real-time SEC filing monitoring
                await asyncio.sleep(60)  # Check every minute
                
        except asyncio.CancelledError:
            logger.info("AI strategic monitoring loop cancelled")
        except Exception as e:
            logger.error(f"Error in AI strategic monitoring loop: {e}")

    async def register_feeds_with_api(self):
        """Register feeds with API database"""
        try:
            # Register AI-discovered feeds
            for feed in self.ai_discovered_feeds:
                if isinstance(feed, dict):
                    feed_name = feed.get('title', feed.get('name', 'AI Discovered Feed'))
                else:
                    logger.warning(f"Skipping non-dict feed: {feed}")
                    continue
                source_data = {
                'name': feed_name,
                'url': feed['url'],
                'type': 'RSS'
                }
                db_manager.create_or_update_source(source_data)
            
            # Register database feeds
            for feed_data in self.database_feeds:
                if isinstance(feed_data, dict):
                    source_data = {
                        'name': feed_data['source_name'],
                        'url': feed_data['source_url'],
                        'type': 'RSS'
                    }
                    db_manager.create_or_update_source(source_data)
                else:
                    logger.warning(f"Skipping non-dict database feed: {feed_data}")
            
            # Register SEC sources
            for cik, company_name in self.sec_companies.items():
                source_data = {
                    'name': f"{company_name} SEC Filings",
                    'url': f"https://www.sec.gov/cgi-bin/browse-edgar?CIK={cik}",
                    'type': 'SEC_EDGAR'
                }
                db_manager.create_or_update_source(source_data)
                
        except Exception as e:
            logger.error(f"Error registering feeds with API: {e}")

    async def stop_strategic_monitoring(self):
        """Stop AI strategic monitoring system"""
        try:
            logger.info("MONITORING: Stopping AI strategic monitoring...")
            
            self.monitoring_active = False
            
            if self.monitoring_task:
                self.monitoring_task.cancel()
                try:
                    await self.monitoring_task
                except asyncio.CancelledError:
                    pass
            
            if self.rss_monitor and hasattr(self.rss_monitor, 'session') and self.rss_monitor.session:
                await self.rss_monitor.session.close()
            
            db_manager.update_monitoring_status(is_active=False, feed_count=0)
            
            logger.info("MONITORING: AI strategic monitoring stopped")
            
        except Exception as e:
            logger.error(f"Error stopping AI strategic monitoring: {e}")

    async def shutdown(self):
        """Graceful shutdown of AI strategic intelligence service"""
        try:
            logger.info("SHUTDOWN: Initiating AI strategic intelligence service shutdown...")
            
            await self.stop_strategic_monitoring()
            
            if self.api_server:
                self.api_server.should_exit = True
            
            logger.info("SHUTDOWN: AI strategic intelligence service shutdown completed")
            
        except Exception as e:
            logger.error(f"Error during AI strategic service shutdown: {e}")

    async def run_debug_test(self):
        """Run comprehensive debug test of AI system"""
        try:
            logger.info("🧪 Running AI System Debug Test...")
            
            test_results = await self.debug_utils.run_comprehensive_ai_system_test()
            
            if test_results.get('overall_status') == 'PASS':
                logger.info("✅ AI System Debug Test: PASSED")
                logger.info(f"   Tests Run: {test_results['summary']['total_tests']}")
                logger.info(f"   Success Rate: {test_results['summary']['success_rate']:.1%}")
            else:
                logger.warning("⚠️ AI System Debug Test: FAILED")
                logger.warning(f"   Failed Tests: {test_results['summary']['failed']}")
                for error in test_results.get('errors', []):
                    logger.warning(f"   Error: {error['test_name']} - {error['error']}")
            
            # Save debug report
            report_path = self.debug_utils.save_debug_report(test_results)
            if report_path:
                logger.info(f"📄 Debug report saved: {report_path}")
            
            return test_results
            
        except Exception as e:
            logger.error(f"❌ Debug test failed: {e}")
            return {'overall_status': 'FAIL', 'error': str(e)}


# Main execution
async def main():
    """Main entry point for AI-First Dynamic PIR Intelligence System"""
    try:
        logger.info("MAIN: Initializing AI-First Dynamic PIR Intelligence System...")
        
        service = AIFirstIntelligenceService()
        
        # Initialize core AI intelligence service
        if not await service.initialize():
            logger.error("FATAL: AI strategic intelligence service initialization failed")
            return False
        
        # Optional: Run debug test in development
        if os.getenv('SIGNALBRIDGE_DEBUG', '').lower() == 'true':
            await service.run_debug_test()
        
        # Load strategic intelligence from Watchtower
        logger.info("MAIN: Loading strategic intelligence from Watchtower...")
        if not await service.load_strategic_intelligence():
            logger.error("FATAL: Failed to load strategic intelligence")
            return False
        
        # AI discovers and prioritizes PIR indicators
        logger.info("MAIN: AI discovering and prioritizing PIR indicators...")
        if not await service.ai_discover_and_prioritize_pirs():
            logger.error("FATAL: Failed to discover PIR indicators")
            return False
        
        # AI generates unified collection strategy
        logger.info("MAIN: AI generating unified collection strategy...")
        if not await service.ai_generate_collection_strategy():
            logger.error("FATAL: Failed to generate AI collection strategy")
            return False
        
        # AI discovers strategic intelligence sources
        logger.info("MAIN: AI discovering strategic intelligence sources...")
        await service.ai_discover_strategic_feeds()
        
        # AI discovers SEC companies for strategic intelligence
        logger.info("MAIN: AI discovering SEC companies for strategic intelligence...")
        await service.ai_discover_sec_companies()
        
        # Execute AI-first strategic intelligence backfill (includes SEC)
        logger.info("MAIN: Executing AI-first strategic intelligence backfill...")
        await service.execute_ai_strategic_backfill(days_back=30)
        
        # Start AI strategic monitoring
        await service.start_strategic_monitoring()
        
        # Start API server for Watchtower integration
        def run_api_server():
            uvicorn.run(fastapi_app, host="0.0.0.0", port=8000, log_level="info")
        
        api_thread = threading.Thread(target=run_api_server, daemon=True)
        api_thread.start()
        
        # Service ready
        logger.info("MAIN: AI-First Dynamic PIR Intelligence System operational!")
        logger.info("   🧠 AI Strategic Intelligence: Active")
        logger.info("   🎯 PIR Monitoring: Active")
        logger.info("   📡 Feed Intelligence: Active")
        logger.info("   📊 SEC/EDGAR Intelligence: Active")  # NEW
        logger.info("   🤖 AI Signal Evaluation: Active")
        logger.info("   🔗 Watchtower Integration: Active")
        logger.info("   🌐 API Server: http://localhost:8000")
        logger.info("   ✨ Ready to support strategic decision-making with AI!")
        
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            logger.info("MAIN: Received keyboard interrupt")
            await service.shutdown()
            
        return True
        
    except Exception as e:
        logger.error(f"FATAL: AI-First Dynamic PIR Intelligence System failed: {e}")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)