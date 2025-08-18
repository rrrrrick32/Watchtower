# config/settings.py
import os
from typing import List, Dict

# Monitoring Configuration
MONITORING_INTERVAL = int(os.getenv('MONITORING_INTERVAL', '300'))  # 5 minutes default
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Database Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# RSS Configuration
RSS_REQUEST_TIMEOUT = int(os.getenv('RSS_REQUEST_TIMEOUT', '30'))
MAX_ENTRIES_PER_FEED = int(os.getenv('MAX_ENTRIES_PER_FEED', '100'))
FEED_UPDATE_INTERVAL = int(os.getenv('FEED_UPDATE_INTERVAL', '1800'))  # 30 minutes

# Matching Configuration
DEFAULT_CONFIDENCE_THRESHOLD = float(os.getenv('DEFAULT_CONFIDENCE_THRESHOLD', '0.7'))
MIN_MATCH_CONFIDENCE = float(os.getenv('MIN_MATCH_CONFIDENCE', '0.3'))

# Data Retention
SIGNAL_RETENTION_DAYS = int(os.getenv('SIGNAL_RETENTION_DAYS', '30'))
ENTRY_RETENTION_DAYS = int(os.getenv('ENTRY_RETENTION_DAYS', '7'))

# Default RSS Feeds for different domains
DEFAULT_FEEDS: Dict[str, List[str]] = {
    'business': [
        'https://feeds.bloomberg.com/markets/news.rss',
        'https://feeds.reuters.com/reuters/businessNews',
        'https://www.wsj.com/xml/rss/3_7014.xml',
        'https://rss.cnn.com/rss/money_latest.rss'
    ],
    'technology': [
        'https://feeds.reuters.com/reuters/technologyNews',
        'https://techcrunch.com/feed/',
        'https://www.wired.com/feed/rss',
        'https://feeds.arstechnica.com/arstechnica/index'
    ],
    'regulatory': [
        'https://www.sec.gov/news/pressreleases.xml',
        'https://www.federalregister.gov/articles.rss',
        'https://feeds.reuters.com/reuters/governmentFilingsNews'
    ],
    'finance': [
        'https://feeds.reuters.com/news/wealth',
        'https://feeds.bloomberg.com/wealth/news.rss',
        'https://www.ft.com/rss/home/us'
    ]
}

# signalbridge/utils/signal_dispatcher.py
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json

logger = logging.getLogger(__name__)

class SignalDispatcher:
    """
    Handles dispatching detected signals back to Watchtower via Supabase.
    Manages signal deduplication, prioritization, and delivery confirmation.
    """
    
    def __init__(self, supabase_client):
        self.supabase = supabase_client
        self.pending_signals = []
        self.dispatched_signals = set()
        
    async def send_signal(self, signal_data: Dict) -> bool:
        """Send a signal to Watchtower"""
        try:
            # Check for duplicate signals
            signal_hash = self._generate_signal_hash(signal_data)
            if signal_hash in self.dispatched_signals:
                logger.debug(f"Duplicate signal detected, skipping: {signal_hash}")
                return False
            
            # Enrich signal data
            enriched_signal = await self._enrich_signal(signal_data)
            
            # Create signal in database
            signal_id = await self.supabase.create_signal(enriched_signal)
            
            if signal_id:
                self.dispatched_signals.add(signal_hash)
                
                # Update indicator last_checked timestamp
                await self.supabase.update_indicator_last_checked(
                    signal_data['indicator_id'],
                    signal_data['indicator_type']
                )
                
                logger.info(f"Signal dispatched successfully: {signal_id}")
                return True
            else:
                logger.error("Failed to create signal in database")
                return False
                
        except Exception as e:
            logger.error(f"Error dispatching signal: {e}")
            return False
    
    async def _enrich_signal(self, signal_data: Dict) -> Dict:
        """Enrich signal with additional context and metadata"""
        try:
            enriched = signal_data.copy()
            
            # Add context from decision
            if signal_data.get('decision_id'):
                decision_context = await self.supabase.get_decision_context(
                    signal_data['decision_id']
                )
                if decision_context:
                    enriched['decision_context'] = {
                        'decision_text': decision_context.get('decision_text'),
                        'strategic_intent': decision_context.get('strategic_intents', {}).get('intent_text')
                    }
            
            # Add signal priority based on confidence and indicator type
            enriched['priority'] = self._calculate_priority(signal_data)
            
            # Add timestamp metadata
            enriched['processing_metadata'] = {
                'processed_at': datetime.utcnow().isoformat(),
                'signalbridge_version': '1.0',
                'enrichment_applied': True
            }
            
            return enriched
            
        except Exception as e:
            logger.error(f"Error enriching signal: {e}")
            return signal_data
    
    def _generate_signal_hash(self, signal_data: Dict) -> str:
        """Generate a hash for signal deduplication"""
        import hashlib
        
        # Use indicator, source URL, and date for deduplication
        hash_components = [
            signal_data.get('indicator_id', ''),
            signal_data.get('source_url', ''),
            signal_data.get('detected_at', '')[:10]  # Date only
        ]
        
        hash_string = '|'.join(hash_components)
        return hashlib.md5(hash_string.encode('utf-8')).hexdigest()
    
    def _calculate_priority(self, signal_data: Dict) -> str:
        """Calculate signal priority based on confidence and type"""
        confidence = signal_data.get('confidence_score', 0.0)
        indicator_type = signal_data.get('indicator_type', 'PIR')
        
        # PIR signals are generally higher priority (external intelligence)
        base_priority = 0.1 if indicator_type == 'PIR' else 0.0
        
        total_score = confidence + base_priority
        
        if total_score >= 0.9:
            return 'critical'
        elif total_score >= 0.7:
            return 'high'
        elif total_score >= 0.5:
            return 'medium'
        else:
            return 'low'
    
    async def archive_old_signals(self, cutoff_date: datetime):
        """Archive old signals to maintain performance"""
        try:
            await self.supabase.archive_old_signals(cutoff_date)
            
            # Clean up local tracking of dispatched signals
            # Note: This is a simplified approach - in production you might want
            # to persist this data or use a more sophisticated cleanup strategy
            if len(self.dispatched_signals) > 10000:
                # Keep only recent hashes (this is a rough cleanup)
                self.dispatched_signals = set(list(self.dispatched_signals)[-5000:])
                logger.info("Cleaned up dispatched signals tracking")
                
        except Exception as e:
            logger.error(f"Error archiving old signals: {e}")

# signalbridge/sources/feed_matcher.py
import logging
from typing import List, Dict, Set
import re
from config.settings import DEFAULT_FEEDS

logger = logging.getLogger(__name__)

class FeedMatcher:
    """
    Determines which RSS feeds are most likely to contain indicators
    for given intelligence requirements.
    """
    
    def __init__(self):
        self.domain_keywords = {
            'business': ['market', 'business', 'financial', 'economic', 'corporate', 'company', 'industry'],
            'technology': ['technology', 'tech', 'digital', 'software', 'hardware', 'innovation', 'startup'],
            'regulatory': ['regulatory', 'compliance', 'legal', 'government', 'policy', 'regulation', 'law'],
            'finance': ['financial', 'finance', 'investment', 'banking', 'capital', 'funding', 'revenue'],
            'security': ['security', 'cyber', 'threat', 'risk', 'breach', 'attack', 'vulnerability'],
            'geopolitical': ['political', 'international', 'diplomatic', 'trade', 'sanctions', 'global']
        }
    
    async def get_feeds_for_indicators(self, indicators: List[Dict]) -> Set[str]:
        """Determine optimal RSS feeds for a set of indicators"""
        try:
            recommended_feeds = set()
            
            for indicator in indicators:
                indicator_text = indicator.get('text', '').lower()
                source_hint = indicator.get('source_hint', '').lower()
                
                # Determine relevant domains
                relevant_domains = self._classify_indicator_domains(indicator_text, source_hint)
                
                # Add feeds for each relevant domain
                for domain in relevant_domains:
                    if domain in DEFAULT_FEEDS:
                        recommended_feeds.update(DEFAULT_FEEDS[domain])
                
                # Check for specific source hints
                specific_feeds = self._get_specific_feeds(source_hint)
                recommended_feeds.update(specific_feeds)
            
            logger.info(f"Recommended {len(recommended_feeds)} feeds for {len(indicators)} indicators")
            return recommended_feeds
            
        except Exception as e:
            logger.error(f"Error matching feeds to indicators: {e}")
            return set(DEFAULT_FEEDS['business'])  # Fallback to business feeds
    
    def _classify_indicator_domains(self, indicator_text: str, source_hint: str = '') -> List[str]:
        """Classify an indicator into relevant domains"""
        combined_text = f"{indicator_text} {source_hint}"
        relevant_domains = []
        
        for domain, keywords in self.domain_keywords.items():
            if any(keyword in combined_text for keyword in keywords):
                relevant_domains.append(domain)
        
        # If no specific domains identified, default to business
        if not relevant_domains:
            relevant_domains = ['business']
        
        return relevant_domains
    
    def _get_specific_feeds(self, source_hint: str) -> Set[str]:
        """Get specific feeds based on source hints"""
        specific_feeds = set()
        
        # Map common source hints to specific feeds
        source_mappings = {
            'reuters': ['https://feeds.reuters.com/reuters/businessNews'],
            'bloomberg': ['https://feeds.bloomberg.com/markets/news.rss'],
            'wsj': ['https://www.wsj.com/xml/rss/3_7014.xml'],
            'sec': ['https://www.sec.gov/news/pressreleases.xml'],
            'federal register': ['https://www.federalregister.gov/articles.rss'],
            'techcrunch': ['https://techcrunch.com/feed/']
        }
        
        for source, feeds in source_mappings.items():
            if source in source_hint.lower():
                specific_feeds.update(feeds)
        
        return specific_feeds

# signalbridge/.env.example
# Supabase Configuration
SUPABASE_URL = os.getenv ('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Monitoring Configuration
MONITORING_INTERVAL=300
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# RSS Configuration
RSS_REQUEST_TIMEOUT=30
MAX_ENTRIES_PER_FEED=100
FEED_UPDATE_INTERVAL=1800

# Matching Configuration
DEFAULT_CONFIDENCE_THRESHOLD=0.7
MIN_MATCH_CONFIDENCE=0.3

# Data Retention
SIGNAL_RETENTION_DAYS=30
ENTRY_RETENTION_DAYS=7