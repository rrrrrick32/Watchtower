# signalbridge/api/database.py
import os
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from supabase import create_client, Client
import asyncio
from functools import wraps

logger = logging.getLogger(__name__)

class SupabaseManager:
    """
    Manages all database operations for SignalBridge using Supabase
    """
    
    def __init__(self):
        self.client: Optional[Client] = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client"""
        try:
            supabase_url = os.getenv('SUPABASE_URL')
            supabase_service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
            
            if not supabase_url or not supabase_service_role_key:
                logger.error("Supabase credentials not found in environment variables")
                return
            
            self.client = create_client(supabase_url, supabase_service_role_key)
            logger.info("✅ Supabase client initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {e}")
    
    # =============================================================================
    # SIGNALS OPERATIONS
    # =============================================================================
    
    def create_signal(self, signal_data: Dict[str, Any]) -> bool:
        """Create a new signal in the database"""
        try:
            if not self.client:
                logger.error("Supabase client not initialized")
                return False
            
            # Prepare signal data for insertion - match exact table schema
            insert_data = {
                'indicator_id': signal_data.get('indicator_id'),
                'source_id': signal_data.get('source_id'),
                'raw_signal_text': signal_data.get('content', signal_data.get('raw_signal_text', '')),
                'match_score': signal_data.get('relevance_score', signal_data.get('match_score', 0.0)),
                'observed_at': signal_data.get('detected_at', datetime.utcnow().isoformat()),
                'session_id': signal_data.get('session_id'),
                'status': signal_data.get('status', 'detected')
            }
            
            # Remove None values
            insert_data = {k: v for k, v in insert_data.items() if v is not None}
            
            result = self.client.table('signals').insert(insert_data).execute()
            
            if result.data:
                logger.info(f"✅ Signal created successfully: {result.data[0]['id']}")
                return True
            else:
                logger.error("❌ Failed to create signal - no data returned")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error creating signal: {e}")
            return False
    
    def get_recent_signals(self, hours: int = 24) -> List[Dict]:
        """Get signals from the last N hours"""
        try:
            if not self.client:
                return []
            
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            result = self.client.table('signals')\
                .select('*')\
                .gte('observed_at', cutoff_time.isoformat())\
                .order('observed_at', desc=True)\
                .limit(100)\
                .execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"❌ Error getting recent signals: {e}")
            return []
    
    def get_signals_today(self) -> int:
        """Get count of signals detected today"""
        try:
            if not self.client:
                return 0
            
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            
            result = self.client.table('signals')\
                .select('id', count='exact')\
                .gte('observed_at', today_start.isoformat())\
                .execute()
            
            return result.count if result.count else 0
            
        except Exception as e:
            logger.error(f"❌ Error getting today's signal count: {e}")
            return 0
    
    # =============================================================================
    # SIGNAL SOURCES OPERATIONS - USING EXACT SCHEMA ONLY
    # =============================================================================
    
    def create_or_update_source(self, source_data: Dict[str, Any]) -> bool:
        """Create or update a signal source using ONLY the exact schema columns"""
        try:
            if not self.client:
                return False
            
            source_name = source_data.get('name', source_data.get('url', 'Unknown'))
            source_url = source_data.get('url', '')
            last_checked = source_data.get('timestamptz', '')
            source_type = source_data.get('type', 'RSS')
            
            # Check if source exists by URL (most reliable identifier)
            existing = None
            if source_url:
                existing_result = self.client.table('signal_sources')\
                    .select('*')\
                    .eq('source_url', source_url)\
                    .execute()
                existing = existing_result.data[0] if existing_result.data else None
            
            # Prepare data using ONLY the exact columns that exist
            # signal_sources columns: id, source_name, source_type, source_url
            data = {
                'source_name': source_name,
                'source_type': source_type,
                'source_url': source_url
            }
            
            if existing:
                # Update existing source
                result = self.client.table('signal_sources')\
                    .update(data)\
                    .eq('id', existing['id'])\
                    .execute()
                logger.info(f"✅ Updated existing source: {source_name}")
            else:
                # Create new source
                result = self.client.table('signal_sources')\
                    .insert(data)\
                    .execute()
                logger.info(f"✅ Created new source: {source_name}")
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"❌ Error creating/updating source: {e}")
            logger.error(f"   Source data attempted: {source_data}")
            return False
    
    def add_rss_feed(self, feed_url: str, feed_name: str = None) -> bool:
        """Add a new RSS feed using exact schema"""
        try:
            if not self.client:
                return False
            
            # Use provided name or generate from URL
            if not feed_name:
                from urllib.parse import urlparse
                parsed = urlparse(feed_url)
                feed_name = f"RSS Feed - {parsed.netloc}"
            
            # Check if feed already exists
            existing = self.client.table('signal_sources')\
                .select('*')\
                .eq('source_url', feed_url)\
                .execute()
            
            if existing.data:
                logger.warning(f"RSS feed already exists: {feed_url}")
                return True  # Consider it successful since feed exists
            
            # Insert using exact schema: source_name, source_type, source_url
            data = {
                'source_name': feed_name,
                'source_type': 'RSS',
                'source_url': feed_url
            }
            
            result = self.client.table('signal_sources')\
                .insert(data)\
                .execute()
            
            if result.data:
                logger.info(f"✅ RSS feed added: {feed_name} ({feed_url})")
                return True
            else:
                logger.error(f"❌ Failed to add RSS feed: {feed_url}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error adding RSS feed: {e}")
            return False
    
    def get_active_sources(self) -> List[Dict]:
        """Get all signal sources"""
        try:
            if not self.client:
                return []
            
            result = self.client.table('signal_sources')\
                .select('*')\
                .order('source_name')\
                .execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"❌ Error getting sources: {e}")
            return []
    
    def get_source_count(self) -> int:
        """Get count of signal sources"""
        try:
            if not self.client:
                return 0
            
            result = self.client.table('signal_sources')\
                .select('id', count='exact')\
                .execute()
            
            return result.count if result.count else 0
            
        except Exception as e:
            logger.error(f"❌ Error getting source count: {e}")
            return 0
    
    # =============================================================================
    # INDICATORS OPERATIONS (Updated for your schema)
    # =============================================================================
    
    def get_active_indicators(self) -> Dict[str, int]:
        """Get count of active PIR indicators"""
        try:
            if not self.client:
                return {'pir': 0}
            
            # Get PIR count - using your indicators table
            pir_result = self.client.table('indicators')\
                .select('id', count='exact')\
                .not_.is_('pir_id', 'null')\
                .execute()
            
            return {
                'pir': pir_result.count if pir_result.count else 0,
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting indicator counts: {e}")
            return {'pir': 0}
    
    def get_all_indicators(self) -> List[Dict]:
        """Get all PIR indicators for signal matching"""
        try:
            if not self.client:
                return []
            
            indicators = []
            
            # Get PIR indicators from indicators table
            pir_result = self.client.table('indicators')\
                .select('*')\
                .not_.is_('pir_id', 'null')\
                .execute()
            
            if pir_result.data:
                for pir in pir_result.data:
                    indicators.append({
                        'id': pir['id'],
                        'text': pir.get('indicator_text', ''),
                        'type': 'PIR',
                        'priority': 'Medium'
                    })
            
            return indicators
            
        except Exception as e:
            logger.error(f"❌ Error getting all indicators: {e}")
            return []
    
    # =============================================================================
    # MONITORING STATUS OPERATIONS
    # =============================================================================
    
    def update_monitoring_status(self, is_active: bool, feed_count: int = 0) -> bool:
        """Update the monitoring status"""
        try:
            if not self.client:
                return False
            
            # Just log the status since we don't have a monitoring table
            logger.info(f"📊 Monitoring status: {'Active' if is_active else 'Inactive'}, Feeds: {feed_count}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error updating monitoring status: {e}")
            return False
    
    # =============================================================================
    # CLEANUP OPERATIONS
    # =============================================================================
    
    def cleanup_old_signals(self, days: int = 30) -> int:
        """Clean up signals older than specified days"""
        try:
            if not self.client:
                return 0
            
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Get count first
            count_result = self.client.table('signals')\
                .select('id', count='exact')\
                .lt('observed_at', cutoff_date.isoformat())\
                .execute()
            
            old_count = count_result.count if count_result.count else 0
            
            if old_count > 0:
                # Delete old signals
                delete_result = self.client.table('signals')\
                    .delete()\
                    .lt('observed_at', cutoff_date.isoformat())\
                    .execute()
                
                logger.info(f"🧹 Cleaned up {old_count} old signals")
                return old_count
            
            return 0
            
        except Exception as e:
            logger.error(f"❌ Error cleaning up old signals: {e}")
            return 0
    
    # =============================================================================
    # HEALTH CHECK
    # =============================================================================
    
    def health_check(self) -> Dict[str, Any]:
        """Check database connectivity and return status"""
        try:
            if not self.client:
                return {
                    'status': 'error',
                    'message': 'Supabase client not initialized',
                    'connected': False
                }
            
            # Simple query to test connection
            result = self.client.table('signals')\
                .select('id', count='exact')\
                .limit(1)\
                .execute()
            
            return {
                'status': 'healthy',
                'message': 'Database connection successful',
                'connected': True,
                'total_signals': result.count if result.count else 0
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Database connection failed: {str(e)}',
                'connected': False
            }

# Global database manager instance
db_manager = SupabaseManager()