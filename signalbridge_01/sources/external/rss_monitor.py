# signalbridge/sources/external/rss_monitor.py
"""
Updated RSS Monitor with AI Integration

Enhanced RSS monitoring that integrates with AI-discovered feeds and AI evaluation.
Maintains core RSS functionality while adding AI-first intelligence capabilities.

UPDATES:
- Integration with AI-discovered RSS sources
- AI-driven content evaluation for real-time monitoring
- Strategic context awareness for feed prioritization
- Performance optimizations for AI workflow
- Enhanced feed validation and management
"""

import asyncio
import logging
import os
import aiohttp
import json
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Set, Optional
import feedparser
import hashlib
from urllib.parse import urljoin, urlparse

# Import AI components for real-time evaluation
from core.ai_evaluator import AIEvaluator

logger = logging.getLogger(__name__)

class RSSMonitor:
    """
    Enhanced RSS feed monitor with AI integration.
    Handles feed subscriptions, monitoring, and AI-powered real-time evaluation.
    """
    
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self.ai_evaluator = AIEvaluator(supabase_client) if supabase_client else None
        
        # Feed management
        self.active_feeds: Dict[str, Dict] = {}
        self.feed_entries: Dict[str, List[Dict]] = {}
        self.entry_hashes: Set[str] = set()
        self.session: Optional[aiohttp.ClientSession] = None
        
        # AI integration state
        self.strategic_context: Optional[Dict] = None
        self.active_pirs: List[Dict] = []
        self.ai_evaluation_enabled = bool(supabase_client)
        
        # Performance tracking
        self.monitoring_stats = {
            'feeds_monitored': 0,
            'entries_processed': 0,
            'ai_evaluations': 0,
            'signals_created': 0,
            'last_ai_evaluation': None
        }
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'User-Agent': 'SignalBridge/2.0 (AI-Enhanced RSS Monitor)'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def set_strategic_context(self, strategic_context: Dict, pirs: List[Dict]):
        """
        Set strategic context for AI-powered real-time evaluation.
        """
        try:
            self.strategic_context = strategic_context
            self.active_pirs = pirs
            
            logger.info("📋 Strategic context set for RSS monitoring")
            logger.info(f"   🎯 Strategic Approach: {strategic_context.get('strategic_approach', 'Unknown')}")
            logger.info(f"   📊 Active PIRs: {len(pirs)}")
            
            if self.ai_evaluator and strategic_context:
                logger.info("🤖 AI real-time evaluation enabled for RSS feeds")
            
        except Exception as e:
            logger.error(f"❌ Error setting strategic context: {e}")
    
    async def subscribe_feed(self, feed_url: str, feed_name: str = None) -> bool:
        """Subscribe to an RSS feed with AI-enhanced monitoring"""
        try:
            # Validate and normalize feed URL
            normalized_url = self._normalize_url(feed_url)
            
            # Test feed accessibility
            feed_info = await self._test_feed(normalized_url)
            if not feed_info:
                logger.warning(f"Failed to access feed: {feed_url}")
                return False
            
            # Add to active feeds with AI integration metadata
            self.active_feeds[normalized_url] = {
                'url': normalized_url,
                'name': feed_name or feed_info.get('title', 'Unknown Feed'),
                'title': feed_info.get('title'),
                'description': feed_info.get('description'),
                'last_updated': None,
                'last_checked': None,
                'entry_count': 0,
                'error_count': 0,
                'reliability_score': 1.0,
                'subscribed_at': datetime.now(timezone.utc),
                # AI integration fields
                'ai_evaluation_enabled': self.ai_evaluation_enabled,
                'strategic_relevance_score': 0.0,
                'last_ai_evaluation': None,
                'signals_created': 0
            }
            
            # Initialize entry storage
            self.feed_entries[normalized_url] = []
            
            # Perform initial fetch with historical data
            await self._fetch_feed_entries_with_ai_evaluation(normalized_url, days_back=90)
            
            self.monitoring_stats['feeds_monitored'] += 1
            
            logger.info(f"📡 RSS feed subscribed: {feed_name or normalized_url}")
            logger.info(f"   🤖 AI evaluation: {'Enabled' if self.ai_evaluation_enabled else 'Disabled'}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error subscribing to feed {feed_url}: {e}")
            return False
    
    async def _fetch_feed_entries_with_ai_evaluation(self, feed_url: str, days_back: int = 90):
        """
        Fetch feed entries with optional AI evaluation for strategic relevance.
        """
        try:
            if not self.session:
                await self.__aenter__()
            
            # Fetch feed content
            async with self.session.get(feed_url) as response:
                if response.status != 200:
                    logger.warning(f"HTTP {response.status} for feed {feed_url}")
                    self._increment_error_count(feed_url)
                    return
                
                content = await response.text()
            
            # Parse feed
            feed = feedparser.parse(content)
            
            if feed.bozo:
                logger.warning(f"Feed parsing issues for {feed_url}: {feed.bozo_exception}")
            
            # Calculate cutoff date for historical entries
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_back)
            
            # Process entries with AI evaluation
            new_entries = []
            ai_evaluated_entries = []
            
            for entry in feed.entries:
                processed_entry = self._process_feed_entry(entry, feed_url)
                if processed_entry and self._is_new_entry(processed_entry):
                    entry_time = processed_entry.get('_parsed_time', datetime.now(timezone.utc))
                    
                    if entry_time >= cutoff_date:
                        new_entries.append(processed_entry)
                        
                        # AI evaluation for strategic relevance (if enabled and context available)
                        if (self.ai_evaluation_enabled and self.strategic_context and 
                            self.active_pirs and len(ai_evaluated_entries) < 20):  # Limit AI evaluations
                            
                            ai_evaluated_entries.append(processed_entry)
            
            # Perform AI evaluation on selected entries
            if ai_evaluated_entries:
                await self._ai_evaluate_entries_for_strategic_relevance(
                    ai_evaluated_entries, feed_url
                )
            
            # Update feed info
            self.active_feeds[feed_url].update({
                'last_checked': datetime.now(timezone.utc),
                'last_updated': datetime.now(timezone.utc) if new_entries else self.active_feeds[feed_url].get('last_updated'),
                'entry_count': self.active_feeds[feed_url]['entry_count'] + len(new_entries),
                'error_count': 0,  # Reset error count on successful fetch
                'last_ai_evaluation': datetime.now(timezone.utc) if ai_evaluated_entries else None
            })
            
            # Store entries
            if feed_url not in self.feed_entries:
                self.feed_entries[feed_url] = []
            
            self.feed_entries[feed_url].extend(new_entries)
            
            # Limit stored entries per feed
            if len(self.feed_entries[feed_url]) > 500:
                oldest_entries = self.feed_entries[feed_url][:-500]
                for old_entry in oldest_entries:
                    old_hash = old_entry.get('_hash')
                    if old_hash in self.entry_hashes:
                        self.entry_hashes.remove(old_hash)
                
                self.feed_entries[feed_url] = self.feed_entries[feed_url][-500:]
            
            self.monitoring_stats['entries_processed'] += len(new_entries)
            
            if new_entries:
                logger.info(f"📰 Feed updated: {len(new_entries)} new entries from {feed_url}")
                if ai_evaluated_entries:
                    logger.info(f"   🤖 AI evaluated: {len(ai_evaluated_entries)} entries for strategic relevance")
            
        except Exception as e:
            logger.error(f"❌ Error fetching feed {feed_url}: {e}")
            self._increment_error_count(feed_url)
    
    async def _ai_evaluate_entries_for_strategic_relevance(self, entries: List[Dict], feed_url: str):
        """
        AI evaluation of RSS entries for strategic relevance and signal creation.
        """
        try:
            if not self.ai_evaluator or not self.strategic_context or not self.active_pirs:
                return
            
            logger.debug(f"🤖 AI evaluating {len(entries)} entries from {feed_url}")
            
            eval_start = datetime.now()
            signals_created = 0
            
            # Evaluate entries against each PIR
            for pir in self.active_pirs:
                for entry in entries:
                    try:
                        # Prepare content for AI evaluation
                        content_for_ai = {
                            'title': entry.get('title', ''),
                            'description': entry.get('description', ''),
                            'source': entry.get('feed_title', 'RSS Feed'),
                            'url': entry.get('link', '')
                        }
                        
                        # AI evaluation with strategic context
                        ai_result = await self.ai_evaluator._ai_evaluate_single_article(
                            content_for_ai, pir, self.strategic_context, 0.3
                        )
                        
                        self.monitoring_stats['ai_evaluations'] += 1
                        
                        # Create signal if AI recommends it
                        if ai_result.get('should_create_signal', False):
                            signal_saved = await self._save_rss_signal(entry, pir, ai_result, feed_url)
                            if signal_saved:
                                signals_created += 1
                                self.monitoring_stats['signals_created'] += 1
                        
                    except Exception as e:
                        logger.debug(f"AI evaluation error for entry: {e}")
                        continue
            
            eval_time = (datetime.now() - eval_start).total_seconds()
            
            # Update feed AI metrics
            if feed_url in self.active_feeds:
                self.active_feeds[feed_url]['signals_created'] += signals_created
                self.active_feeds[feed_url]['last_ai_evaluation'] = datetime.now(timezone.utc)
                
                # Calculate strategic relevance score
                total_evaluations = self.monitoring_stats['ai_evaluations']
                if total_evaluations > 0:
                    relevance_score = signals_created / len(entries) if entries else 0
                    self.active_feeds[feed_url]['strategic_relevance_score'] = relevance_score
            
            self.monitoring_stats['last_ai_evaluation'] = datetime.now(timezone.utc)
            
            if signals_created > 0:
                logger.info(f"✅ AI RSS Evaluation: {signals_created} signals created from {len(entries)} entries ({eval_time:.1f}s)")
            
        except Exception as e:
            logger.error(f"❌ AI evaluation of RSS entries failed: {e}")
    
    async def _save_rss_signal(self, entry: Dict, pir: Dict, ai_result: Dict, feed_url: str) -> bool:
        """
        Save RSS signal with AI evaluation results.
        """
        try:
            if not self.supabase:
                return False
            
            # Create or get source
            source_name = entry.get('feed_title', f"RSS Feed - {urlparse(feed_url).netloc}")
            source_id = await self.supabase.create_or_get_signal_source(
                source_name=source_name,
                source_url=feed_url,
                source_type='RSS'
            )
            
            if not source_id:
                return False
            
            # Prepare AI metadata for signal
            ai_metadata = {
                'ai_reasoning': ai_result.get('reasoning', ''),
                'strategic_connections': ai_result.get('strategic_connections', []),
                'decision_support_value': ai_result.get('decision_support_value', 'medium'),
                'intelligence_type': ai_result.get('intelligence_type', 'general'),
                'evaluation_source': 'rss_monitor',
                'feed_url': feed_url,
                'evaluation_timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            # Create signal using existing schema
            signal_data = {
                'indicator_id': pir['id'],
                'source_id': source_id,
                'raw_signal_text': json.dumps(ai_metadata),  # Store AI reasoning
                'match_score': float(ai_result.get('relevance_score', 0.0)),  # AI confidence
                'observed_at': datetime.now(timezone.utc).isoformat(),
                'session_id': pir.get('session_id'),
                'status': 'rss_ai_evaluated',
                'article_url': entry.get('link', '')
            }
            
            signal_id = await self.supabase.create_signal(signal_data)
            
            if signal_id:
                logger.debug(f"📡 RSS Signal created: {signal_id} (confidence: {ai_result.get('relevance_score', 0):.3f})")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ RSS signal save failed: {e}")
            return False
    
    async def unsubscribe_feed(self, feed_url: str):
        """Unsubscribe from an RSS feed"""
        try:
            normalized_url = self._normalize_url(feed_url)
            
            if normalized_url in self.active_feeds:
                del self.active_feeds[normalized_url]
                self.monitoring_stats['feeds_monitored'] -= 1
                
            if normalized_url in self.feed_entries:
                # Remove entry hashes for this feed
                for entry in self.feed_entries[normalized_url]:
                    entry_hash = entry.get('_hash')
                    if entry_hash in self.entry_hashes:
                        self.entry_hashes.remove(entry_hash)
                
                del self.feed_entries[normalized_url]
            
            logger.info(f"📡 Unsubscribed from feed: {feed_url}")
            
        except Exception as e:
            logger.error(f"❌ Error unsubscribing from feed {feed_url}: {e}")
    
    def get_active_feeds(self) -> Set[str]:
        """Get set of currently active feed URLs"""
        return set(self.active_feeds.keys())
    
    async def get_recent_entries(self, since_time: datetime) -> List[Dict]:
        """Get all feed entries since the specified time"""
        recent_entries = []
        
        for feed_url, entries in self.feed_entries.items():
            for entry in entries:
                entry_time = entry.get('_parsed_time')
                if entry_time and entry_time >= since_time:
                    recent_entries.append(entry)
        
        # Sort by publication time, newest first
        recent_entries.sort(
            key=lambda x: x.get('_parsed_time', datetime.min), 
            reverse=True
        )
        
        return recent_entries
    
    async def get_historical_entries(self, days_back: int = 90) -> List[Dict]:
        """Get all entries within the specified historical window"""
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_back)
        return await self.get_recent_entries(cutoff_date)
    
    async def update_all_feeds(self):
        """Update all subscribed feeds with AI evaluation"""
        tasks = []
        for feed_url in self.active_feeds.keys():
            tasks.append(self._fetch_feed_entries_with_ai_evaluation(feed_url))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
            logger.info(f"📡 Updated {len(tasks)} RSS feeds")
    
    async def start_real_time_monitoring(self, check_interval: int = 300):
        """
        Start real-time RSS monitoring with AI evaluation.
        """
        try:
            logger.info(f"🔄 Starting real-time RSS monitoring (interval: {check_interval}s)")
            logger.info(f"   📡 Monitoring {len(self.active_feeds)} feeds")
            logger.info(f"   🤖 AI evaluation: {'Enabled' if self.ai_evaluation_enabled else 'Disabled'}")
            
            while True:
                await self.update_all_feeds()
                await asyncio.sleep(check_interval)
                
        except asyncio.CancelledError:
            logger.info("🔄 Real-time RSS monitoring stopped")
        except Exception as e:
            logger.error(f"❌ Real-time monitoring error: {e}")
    
    def _process_feed_entry(self, entry, feed_url: str) -> Optional[Dict]:
        """Process a single feed entry into standardized format"""
        try:
            # Extract publication time
            published_time = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                try:
                    published_time = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                except (ValueError, TypeError):
                    pass
            
            if not published_time and hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                try:
                    published_time = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
                except (ValueError, TypeError):
                    pass
            
            # Create entry hash for deduplication
            entry_text = f"{entry.get('title', '')}{entry.get('link', '')}"
            entry_hash = hashlib.md5(entry_text.encode('utf-8')).hexdigest()
            
            processed = {
                'title': entry.get('title', '').strip(),
                'link': entry.get('link', '').strip(),
                'description': entry.get('description', '').strip(),
                'published': entry.get('published', ''),
                'updated': entry.get('updated', ''),
                'author': entry.get('author', ''),
                'tags': [tag.get('term', '') for tag in entry.get('tags', [])],
                'feed_url': feed_url,
                'feed_title': self.active_feeds.get(feed_url, {}).get('title', ''),
                '_hash': entry_hash,
                '_parsed_time': published_time or datetime.now(timezone.utc),
                '_processed_at': datetime.now(timezone.utc),
                # AI integration fields
                '_ai_evaluated': False,
                '_strategic_relevance': 0.0
            }
            
            return processed
            
        except Exception as e:
            logger.error(f"❌ Error processing entry from {feed_url}: {e}")
            return None
    
    def _is_new_entry(self, entry: Dict) -> bool:
        """Check if entry is new (not already processed)"""
        entry_hash = entry.get('_hash')
        if entry_hash in self.entry_hashes:
            return False
        
        self.entry_hashes.add(entry_hash)
        return True
    
    async def _test_feed(self, feed_url: str) -> Optional[Dict]:
        """Test if a feed URL is accessible and valid"""
        try:
            if not self.session:
                await self.__aenter__()
            
            async with self.session.get(feed_url) as response:
                if response.status != 200:
                    return None
                
                content = await response.text()
            
            feed = feedparser.parse(content)
            
            if feed.bozo and not feed.entries:
                return None
            
            return {
                'title': feed.feed.get('title', ''),
                'description': feed.feed.get('description', ''),
                'link': feed.feed.get('link', ''),
                'entry_count': len(feed.entries)
            }
            
        except Exception as e:
            logger.debug(f"Feed test error for {feed_url}: {e}")
            return None
    
    def _normalize_url(self, url: str) -> str:
        """Normalize URL for consistent storage"""
        url = url.strip()
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        return url
    
    def _increment_error_count(self, feed_url: str):
        """Increment error count for a feed"""
        if feed_url in self.active_feeds:
            self.active_feeds[feed_url]['error_count'] += 1
            
            # Reduce reliability score based on errors
            error_count = self.active_feeds[feed_url]['error_count']
            if error_count > 5:
                self.active_feeds[feed_url]['reliability_score'] = max(0.1, 1.0 - (error_count * 0.1))
    
    async def cleanup_old_entries(self, cutoff_date: datetime):
        """Remove entries older than cutoff_date"""
        try:
            total_removed = 0
            
            for feed_url in list(self.feed_entries.keys()):
                entries = self.feed_entries[feed_url]
                old_entries = [e for e in entries if e.get('_parsed_time', datetime.max) < cutoff_date]
                new_entries = [e for e in entries if e.get('_parsed_time', datetime.max) >= cutoff_date]
                
                # Remove hashes for old entries
                for old_entry in old_entries:
                    old_hash = old_entry.get('_hash')
                    if old_hash in self.entry_hashes:
                        self.entry_hashes.remove(old_hash)
                
                self.feed_entries[feed_url] = new_entries
                total_removed += len(old_entries)
            
            if total_removed > 0:
                logger.info(f"🧹 Cleaned up {total_removed} old feed entries")
            
        except Exception as e:
            logger.error(f"❌ Error cleaning up old entries: {e}")
    
    def get_feed_stats(self) -> Dict:
        """Get comprehensive statistics about monitored feeds"""
        total_entries = sum(len(entries) for entries in self.feed_entries.values())
        active_count = len(self.active_feeds)
        
        # Calculate AI integration stats
        ai_enabled_feeds = sum(1 for feed in self.active_feeds.values() 
                              if feed.get('ai_evaluation_enabled', False))
        
        avg_relevance = 0.0
        if ai_enabled_feeds > 0:
            relevance_scores = [feed.get('strategic_relevance_score', 0) 
                              for feed in self.active_feeds.values() 
                              if feed.get('ai_evaluation_enabled', False)]
            avg_relevance = sum(relevance_scores) / len(relevance_scores) if relevance_scores else 0
        
        return {
            'active_feeds': active_count,
            'total_entries': total_entries,
            'unique_hashes': len(self.entry_hashes),
            'ai_integration': {
                'enabled': self.ai_evaluation_enabled,
                'ai_enabled_feeds': ai_enabled_feeds,
                'total_ai_evaluations': self.monitoring_stats['ai_evaluations'],
                'signals_created': self.monitoring_stats['signals_created'],
                'avg_strategic_relevance': avg_relevance,
                'last_ai_evaluation': self.monitoring_stats['last_ai_evaluation']
            },
            'performance_metrics': self.monitoring_stats,
            'feeds': [
                {
                    'url': url,
                    'name': info['name'],
                    'entry_count': info['entry_count'],
                    'error_count': info['error_count'],
                    'reliability_score': info['reliability_score'],
                    'last_checked': info['last_checked'],
                    'ai_evaluation_enabled': info.get('ai_evaluation_enabled', False),
                    'strategic_relevance_score': info.get('strategic_relevance_score', 0.0),
                    'signals_created': info.get('signals_created', 0),
                    'last_ai_evaluation': info.get('last_ai_evaluation')
                }
                for url, info in self.active_feeds.items()
            ]
        }
    
    def get_ai_performance_metrics(self) -> Dict:
        """Get AI-specific performance metrics"""
        return {
            'ai_evaluation_enabled': self.ai_evaluation_enabled,
            'strategic_context_set': bool(self.strategic_context),
            'active_pirs': len(self.active_pirs),
            'monitoring_stats': self.monitoring_stats,
            'feed_ai_metrics': {
                url: {
                    'strategic_relevance_score': feed.get('strategic_relevance_score', 0.0),
                    'signals_created': feed.get('signals_created', 0),
                    'last_ai_evaluation': feed.get('last_ai_evaluation')
                }
                for url, feed in self.active_feeds.items()
                if feed.get('ai_evaluation_enabled', False)
            }
        }