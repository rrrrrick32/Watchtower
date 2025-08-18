# signalbridge/supabase_client.py
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import os
from supabase import create_client, Client
import json
logger = logging.getLogger(__name__)

class SupabaseClient:
    """
    Handles all interactions with Supabase for SignalBridge.
    Manages reading indicators and writing signals back to the database.
    FIXED to match actual Supabase table schemas.
    """
    
    def __init__(self):
        self.url = os.getenv('SUPABASE_URL')
        self.key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        
        self.client: Client = create_client(self.url, self.key)
        logger.info("Connected to Supabase")
    
    async def get_active_pir_indicators(self) -> List[Dict]:
        """Fetch all active PIR indicators that need monitoring"""
        try:
            # Get indicators that have pir_id (not null)
            response = self.client.table('indicators')\
                .select('*')\
                .not_.is_('pir_id', 'null')\
                .execute()
            
            indicators = []
            for row in response.data:
                indicator = {
                    'id': row['id'],                                    # uuid
                    'pir_id': row['pir_id'],                           # uuid
                    'indicator_text': row['indicator_text'],           # text
                    'source': row.get('source'),                      # text
                    'confidence_level': row.get('confidence_level', 0.5),  # float4
                    'status': row.get('status'),                      # varchar
                    'created_at': row.get('created_at'),              # timestamptz
                    'updated_at': row.get('updated_at'),              # timestamptz
                    'session_id': row.get('session_id'),              # uuid
                    'collection_frequency': row.get('collection_frequency'),  # text
                    'type': 'PIR'
                }
                indicators.append(indicator)
            
            logger.debug(f"Retrieved {len(indicators)} PIR indicators")
            return indicators
            
        except Exception as e:
            logger.error(f"Error fetching PIR indicators: {e}")
            return []
    
    async def get_active_ffir_indicators(self) -> List[Dict]:
        """Fetch all active FFIR indicators that need monitoring"""
        try:
            # Get ffir_indicators that have ffir_id (not null)
            response = self.client.table('ffir_indicators')\
                .select('*')\
                .not_.is_('ffir_id', 'null')\
                .execute()
            
            indicators = []
            for row in response.data:
                indicator = {
                    'id': row['id'],                                    # uuid
                    'ffir_id': row['ffir_id'],                         # uuid
                    'indicator_text': row['indicator_text'],           # text
                    'source': row.get('source'),                      # text
                    'confidence_level': row.get('confidence_level', 0.5),  # float8
                    'status': row.get('status'),                      # varchar
                    'created_at': row.get('created_at'),              # timestamptz
                    'updated_at': row.get('updated_at'),              # timestamptz
                    'session_id': row.get('session_id'),              # uuid
                    'collection_frequency': row.get('collection_frequency'),  # text
                    'type': 'FFIR'
                }
                indicators.append(indicator)
            
            logger.debug(f"Retrieved {len(indicators)} FFIR indicators")
            return indicators
            
        except Exception as e:
            logger.error(f"Error fetching FFIR indicators: {e}")
            return []
    
    async def get_active_rss_sources(self) -> List[Dict]:
        """Get active RSS sources with URLs for monitoring"""
        try:
            response = self.client.table('signal_sources')\
                .select('*')\
                .eq('source_type', 'RSS')\
                .not_.is_('source_url', 'null')\
                .execute()
            
            sources = []
            for row in response.data:
                if row.get('source_url'):  # Double-check URL exists
                    sources.append({
                        'id': row['id'],                        # uuid
                        'source_name': row['source_name'],      # text
                        'source_type': row['source_type'],      # text
                        'last_checked': row.get('last_checked'), # timestamptz
                        'source_url': row['source_url']         # text
                    })
            
            logger.info(f"Retrieved {len(sources)} active RSS sources")
            return sources
            
        except Exception as e:
            logger.error(f"Error fetching active RSS sources: {e}")
            return []
    
    async def create_or_get_signal_source(self, source_name: str, source_url: str, source_type: str = 'RSS') -> Optional[str]:
        """Create or get existing signal source, return source_id"""
        try:
            # First, try to find existing source
            existing_response = self.client.table('signal_sources')\
                .select('*')\
                .eq('source_name', source_name)\
                .execute()
            
            if existing_response.data:
                source_id = existing_response.data[0]['id']
                logger.debug(f"Found existing signal source: {source_id}")
                
                # Update last_checked
                self.client.table('signal_sources')\
                    .update({'last_checked': datetime.utcnow().isoformat()})\
                    .eq('id', source_id)\
                    .execute()
                
                return source_id
            
            # Create new source
            insert_data = {
                'source_name': source_name,        # text
                'source_type': source_type,        # text
                'last_checked': datetime.utcnow().isoformat(),  # timestamptz
                'source_url': source_url           # text
            }
            
            response = self.client.table('signal_sources').insert(insert_data).execute()
            
            if response.data:
                source_id = response.data[0]['id']
                logger.info(f"✅ Created new signal source: {source_id}")
                return source_id
            else:
                logger.error("❌ Failed to create signal source")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error creating/getting signal source: {e}")
            return None
    
    async def create_signal(self, signal_data: Dict) -> Optional[str]:
        """Create a new signal record - UPDATED to include ALL new article fields"""
        try:
            # Validate required fields
            required_fields = ['indicator_id', 'source_id']
            for field in required_fields:
                if field not in signal_data:
                    logger.error(f"❌ Missing required field: {field}")
                    return None
    
            # Map to ACTUAL table columns including ALL new fields
            insert_data = {
                # EXISTING FIELDS
                'indicator_id': signal_data['indicator_id'],                    # uuid - REQUIRED
                'source_id': signal_data['source_id'],                          # uuid - REQUIRED  
                'raw_signal_text': signal_data.get('raw_signal_text', '')[:500], # text
                'match_score': float(signal_data.get('match_score', 0.0)),     # float4
                'observed_at': signal_data.get('observed_at', datetime.utcnow().isoformat()), # timestamptz
                'session_id': signal_data.get('session_id'),                   # uuid
                'status': signal_data.get('status', 'new'),                    # text
                'article_url': signal_data.get('article_url'),                  # text
            
                # NEW FIELDS - These were missing!
                'article_title': signal_data.get('article_title'),              # text - ARTICLE HEADLINE
                'article_content': signal_data.get('article_content'),          # text - ARTICLE CONTENT
                'published_date': signal_data.get('published_date'),           # timestamptz - ORIGINAL DATE
                'ai_reasoning': signal_data.get('ai_reasoning')                 # text - AI REASONING SEPARATE
            }
    
            response = self.client.table('signals').insert(insert_data).execute()
    
            if response.data:
                signal_id = response.data[0]['id']
                logger.info(f"✅ Created signal {signal_id} for indicator {signal_data['indicator_id']}")
            
                # Enhanced logging to show what was saved
                if signal_data.get('article_title'):
                    logger.debug(f"   📰 Article: {signal_data['article_title'][:50]}")
                if signal_data.get('article_url'):
                    logger.debug(f"   🔗 URL: {signal_data['article_url']}")
                
                return signal_id
            else:
                logger.warning(f"⚠️ No data returned from signal insert")
                return None
    
        except Exception as e:
            logger.error(f"❌ Error creating signal: {e}")
            logger.error(f"Signal data attempted: {signal_data}")
            return None
    
    async def update_source_last_checked(self, source_id: str):
        """Update the last_checked timestamp for a source"""
        try:
            self.client.table('signal_sources')\
                .update({'last_checked': datetime.utcnow().isoformat()})\
                .eq('id', source_id)\
                .execute()
                
        except Exception as e:
            logger.error(f"Error updating source last_checked: {e}")
    
    async def get_strategic_context(self, session_id: str = None) -> Dict:
        """Get strategic context from strategic_intents table"""
        try:
            if session_id:
                response = self.client.table('strategic_intents')\
                    .select('*')\
                    .eq('session_id', session_id)\
                    .order('created_at', desc=True)\
                    .limit(1)\
                    .execute()
            else:
                response = self.client.table('strategic_intents')\
                    .select('*')\
                    .order('created_at', desc=True)\
                    .limit(1)\
                    .execute()
            
            if not response.data:
                return {}
            
            intent = response.data[0]
            
            # Get related decisions
            decisions_response = self.client.table('decisions')\
                .select('*')\
                .eq('intent_id', intent['id'])\
                .execute()
            
            # Get PIR and FFIR indicators
            pir_indicators = await self.get_active_pir_indicators()
            ffir_indicators = await self.get_active_ffir_indicators()
            
            return {
                'intent_id': intent['id'],                          # uuid
                'intent_text': intent.get('intent_text', ''),       # text
                'context': intent.get('context', ''),              # text
                'created_at': intent.get('created_at'),             # timestamptz
                'owner_user_id': intent.get('owner_user_id'),       # timestamptz (seems wrong type?)
                'session_id': intent.get('session_id'),            # uuid
                'decisions': [d.get('decision_text', '') for d in decisions_response.data],
                'pir_indicators': [ind['indicator_text'] for ind in pir_indicators],
                'ffir_indicators': [ind['indicator_text'] for ind in ffir_indicators],
                'all_indicators': pir_indicators + ffir_indicators
            }
            
        except Exception as e:
            logger.error(f"Error fetching strategic context: {e}")
            return {}
    
    async def create_strategic_intent(self, intent_data: Dict) -> Optional[str]:
        """Create a new strategic intent"""
        try:
            insert_data = {
                'intent_text': intent_data.get('intent_text', ''),     # text
                'context': intent_data.get('context', ''),            # text
                'created_at': datetime.utcnow().isoformat(),          # timestamptz
                'owner_user_id': intent_data.get('owner_user_id'),    # timestamptz (type mismatch?)
                'session_id': intent_data.get('session_id')           # uuid
            }
            
            response = self.client.table('strategic_intents').insert(insert_data).execute()
            
            if response.data:
                return response.data[0]['id']
            return None
                
        except Exception as e:
            logger.error(f"Error creating strategic intent: {e}")
            return None
    
    async def create_decision(self, decision_data: Dict) -> Optional[str]:
        """Create a new decision"""
        try:
            insert_data = {
                'intent_id': decision_data.get('intent_id'),          # uuid
                'decision_text': decision_data.get('decision_text', ''), # text
                'status': decision_data.get('status', 'pending'),     # text
                'created_at': datetime.utcnow().isoformat(),          # timetz
                'session_id': decision_data.get('session_id')         # uuid
            }
            
            response = self.client.table('decisions').insert(insert_data).execute()
            
            if response.data:
                return response.data[0]['decision_id']  # Note: uses decision_id, not id
            return None
                
        except Exception as e:
            logger.error(f"Error creating decision: {e}")
            return None
    
    async def create_pir(self, pir_data: Dict) -> Optional[str]:
        """Create a new PIR"""
        try:
            insert_data = {
                'decision_id': pir_data.get('decision_id'),         # uuid
                'pir_text': pir_data.get('pir_text', ''),           # text
                'priority': pir_data.get('priority', 'medium'),     # varchar
                'created_at': datetime.utcnow().isoformat()         # timestamptz
            }
            
            response = self.client.table('pirs').insert(insert_data).execute()
            
            if response.data:
                return response.data[0]['id']
            return None
                
        except Exception as e:
            logger.error(f"Error creating PIR: {e}")
            return None
    
    async def create_ffir(self, ffir_data: Dict) -> Optional[str]:
        """Create a new FFIR"""
        try:
            insert_data = {
                'decision_id': ffir_data.get('decision_id'),        # uuid
                'ffir_text': ffir_data.get('ffir_text', ''),        # text
                'priority': ffir_data.get('priority', 'medium'),    # varchar
                'created_at': datetime.utcnow().isoformat()         # timestamptz
            }
            
            response = self.client.table('ffirs').insert(insert_data).execute()
            
            if response.data:
                return response.data[0]['id']
            return None
                
        except Exception as e:
            logger.error(f"Error creating FFIR: {e}")
            return None
    
    async def create_indicator(self, indicator_data: Dict, indicator_type: str = 'PIR') -> Optional[str]:
        """Create a new indicator (PIR or FFIR type)"""
        try:
            if indicator_type == 'PIR':
                insert_data = {
                    'pir_id': indicator_data.get('pir_id'),                    # uuid
                    'indicator_text': indicator_data.get('indicator_text', ''), # text
                    'source': indicator_data.get('source'),                   # text
                    'confidence_level': indicator_data.get('confidence_level', 0.5), # float4
                    'status': indicator_data.get('status', 'active'),         # varchar
                    'created_at': datetime.utcnow().isoformat(),              # timestamptz
                    'updated_at': datetime.utcnow().isoformat(),              # timestamptz
                    'session_id': indicator_data.get('session_id'),           # uuid
                    'collection_frequency': indicator_data.get('collection_frequency') # text
                }
                
                response = self.client.table('indicators').insert(insert_data).execute()
                
            else:  # FFIR
                insert_data = {
                    'ffir_id': indicator_data.get('ffir_id'),                 # uuid
                    'indicator_text': indicator_data.get('indicator_text', ''), # text
                    'source': indicator_data.get('source'),                  # text
                    'confidence_level': indicator_data.get('confidence_level', 0.5), # float8
                    'status': indicator_data.get('status', 'active'),        # varchar
                    'created_at': datetime.utcnow().isoformat(),             # timestamptz
                    'updated_at': datetime.utcnow().isoformat(),             # timestamptz
                    'session_id': indicator_data.get('session_id'),          # uuid
                    'collection_frequency': indicator_data.get('collection_frequency') # text
                }
                
                response = self.client.table('ffir_indicators').insert(insert_data).execute()
            
            if response.data:
                return response.data[0]['id']
            return None
                
        except Exception as e:
            logger.error(f"Error creating {indicator_type} indicator: {e}")
            return None
        
    async def get_active_sec_sources(self) -> List[Dict]:
        """Get active SEC/EDGAR sources for monitoring"""
        try:
            response = self.client.table('signal_sources')\
                .select('*')\
                .eq('source_type', 'SEC_EDGAR')\
                .not_.is_('source_url', 'null')\
                .execute()
            
            sources = []
            for row in response.data:
                if row.get('source_url'):
                    sources.append({
                        'id': row['id'],
                        'source_name': row['source_name'],
                        'source_type': row['source_type'],
                        'last_checked': row.get('last_checked'),
                        'source_url': row['source_url']
                    })
            
            logger.info(f"Retrieved {len(sources)} active SEC sources")
            return sources
            
        except Exception as e:
            logger.error(f"Error fetching active SEC sources: {e}")
            return []

    async def create_sec_source(self, company_name: str, cik: str) -> Optional[str]:
        """Create SEC source for a company"""
        try:
            source_name = f"{company_name} SEC Filings"
            source_url = f"https://www.sec.gov/cgi-bin/browse-edgar?CIK={cik}"
            
            # Check if source already exists
            existing_response = self.client.table('signal_sources')\
                .select('*')\
                .eq('source_name', source_name)\
                .execute()
            
            if existing_response.data:
                source_id = existing_response.data[0]['id']
                logger.debug(f"Found existing SEC source: {source_id}")
                return source_id
            
            # Create new SEC source
            insert_data = {
                'source_name': source_name,
                'source_type': 'SEC_EDGAR',
                'last_checked': datetime.utcnow().isoformat(),
                'source_url': source_url
            }
            
            response = self.client.table('signal_sources').insert(insert_data).execute()
            
            if response.data:
                source_id = response.data[0]['id']
                logger.info(f"✅ Created SEC source: {source_id} for {company_name}")
                return source_id
            else:
                logger.error("❌ Failed to create SEC source")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error creating SEC source: {e}")
            return None

    async def create_sec_signal(self, filing_data: Dict, pir: Dict, ai_result: Dict) -> Optional[str]:
        """Create signal from SEC filing using existing schema"""
        try:
            # Get or create SEC source
            source_id = await self.create_sec_source(
                filing_data.get('company_name', 'Unknown Company'),
                filing_data.get('cik', '')
            )
            
            if not source_id:
                logger.error("Failed to create/get SEC source")
                return None
            
            # Prepare signal data using existing schema
            signal_data = {
                # Required fields
                'indicator_id': pir['id'],
                'source_id': source_id,
                
                # Article-style fields for SEC filings
                'article_title': filing_data.get('title', ''),
                'article_content': filing_data.get('description', '')[:2000],  # Limit size
                'article_url': filing_data.get('url', ''),
                'published_date': filing_data.get('published_date'),
                
                # AI evaluation results
                'match_score': float(ai_result.get('relevance_score', 0.0)),
                'ai_reasoning': ai_result.get('reasoning', ''),
                
                # Metadata
                'raw_signal_text': json.dumps({
                    'form_type': filing_data.get('form_type', ''),
                    'company_name': filing_data.get('company_name', ''),
                    'cik': filing_data.get('cik', ''),
                    'ai_metadata': ai_result
                }),
                'observed_at': datetime.utcnow().isoformat(),
                'session_id': pir.get('session_id'),
                'status': 'sec_filing'
            }
            
            # Create signal using existing method
            signal_id = await self.create_signal(signal_data)
            
            if signal_id:
                logger.info(f"✅ SEC Signal created: {signal_id}")
                logger.debug(f"   📊 Filing: {filing_data.get('form_type', '')} - {filing_data.get('company_name', '')}")
                logger.debug(f"   📈 AI Score: {ai_result.get('relevance_score', 0):.3f}")
                return signal_id
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Error creating SEC signal: {e}")
            return None
    
    async def get_recent_signals(self, hours: int = 24) -> List[Dict]:
        """Get recent signals for monitoring and analysis"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            response = self.client.table('signals')\
                .select('*')\
                .gte('observed_at', cutoff_time.isoformat())\
                .order('observed_at', desc=True)\
                .execute()
            
            return response.data
            
        except Exception as e:
            logger.error(f"Error fetching recent signals: {e}")
            return []