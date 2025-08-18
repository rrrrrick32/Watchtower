# signalbridge/sources/ai_rss_discovery.py
"""
AI RSS Discovery - Fast Discovery with No Time-Wasting Crawling

OPTIMIZED for speed - keeps only the endpoint testing that actually works.
Eliminates all crawling phases that have 0% success rate and take 25 minutes.

PERFORMANCE TARGETS:
- 30 seconds max for any domain discovery
- 8-12 domains tested in parallel
- Total discovery time: under 2 minutes

STRATEGY:
- Only test common RSS endpoints (this is what works)
- No HTML crawling, no BeautifulSoup, no subdirectory checking
- Fast parallel processing with AI-suggested domains
- Fail fast on non-responsive domains
"""

import asyncio
import logging
from typing import Dict, List, Optional
import aiohttp
from datetime import datetime
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

class AIRSSDiscovery:
    """
    Lightning-fast RSS feed discovery that only does what actually works.
    No time-wasting crawling phases - just fast endpoint testing.
    """
    
    def __init__(self):
        # Only the endpoint patterns that actually work (from your experience)
        self.WORKING_ENDPOINTS = [
            '/rss',
            '/rss.xml', 
            '/feed',
            '/feed.xml',
            '/feeds/all.xml',
            '/news/rss',
            '/news/feed',
            '/news/rss.xml',
            '/api/rss',
            '/feeds/news.xml',
            '/atom.xml',
            '/feeds.xml'
        ]
        
        # Performance limits - aggressive timeouts
        self.DOMAIN_TIMEOUT = 25  # seconds per domain (was causing 25min waits)
        self.ENDPOINT_TIMEOUT = 6  # seconds per endpoint test
        self.MAX_PARALLEL_DOMAINS = 10
        self.MAX_PARALLEL_ENDPOINTS = 5

        self.logger = logging.getLogger(__name__)  
        
        self.logger.info("⚡ AI RSS Discovery initialized (endpoint testing only - no crawling)")
    
    async def discover_feeds_from_ai_recommendations(self, ai_sources: List[Dict]) -> tuple:
        """
        Fast feed discovery from AI source recommendations.
        Tests direct URLs first, then does fast endpoint testing.
        """
        start_time = datetime.now()
        validated_feeds = []
        
        try:
            self.logger.info(f"⚡ AI RSS Discovery: Validating {len(ai_sources)} AI-recommended sources")
            
            # Phase 1: Test direct RSS URLs from AI (fastest)
            self.failed_feed_names = []
            direct_url_feeds = await self._test_direct_rss_urls(ai_sources)
            validated_feeds.extend(direct_url_feeds)

            # Capture names of sources that fail direct URL testing
            for source in ai_sources:
                if isinstance(source, dict):
                    source_name = source.get('name', 'Unknown Source')
                    if not any(source_name in str(feed) for feed in direct_url_feeds):
                        self.failed_feed_names.append(source_name)
                elif isinstance(source, list):
                    # Handle case where source is a list of sources
                    for sub_source in source:
                        if isinstance(sub_source, dict):
                            sub_name = sub_source.get('name', 'Unknown Source')
                            if not any(sub_name in str(feed) for feed in direct_url_feeds):
                                self.failed_feed_names.append(sub_name)
            
            # Phase 2: Extract domains for endpoint testing (only if needed)
            if len(validated_feeds) < len(ai_sources) * 0.5:  # If less than 50% success rate
                remaining_domains = self._extract_domains_for_testing(ai_sources, validated_feeds)
                
                if remaining_domains:
                    domain_feeds = await self._fast_domain_endpoint_testing(remaining_domains)
                    validated_feeds.extend(domain_feeds)
            
            total_time = (datetime.now() - start_time).total_seconds()
            # Calculate stats for logging
            total_sources = len(ai_sources) if ai_sources else 0
            validated_count = len(validated_feeds)
            success_rate = (validated_count / total_sources * 100) if total_sources > 0 else 0
            
            self.logger.info(f"⚡ AI RSS Discovery Complete: {total_time:.1f}s")
            self.logger.info(f"   📡 Validated: {validated_count}/{total_sources} sources")
            self.logger.info(f"   📊 Success Rate: {success_rate:.1f}%")

            # Add failed feed names
            if hasattr(self, 'failed_feed_names') and self.failed_feed_names:
                self.logger.info("    Failed to validate (consider manual addition):")
                for name in self.failed_feed_names:
                    self.logger.info(f"    • {name}")
            
            return validated_feeds, getattr(self, 'failed_feed_names', [])
            
        except Exception as e:
            total_time = (datetime.now() - start_time).total_seconds()
            self.logger.error(f"❌ AI RSS Discovery failed after {total_time:.1f}s: {e}")
            return [], []
    
    async def _test_direct_rss_urls(self, ai_sources: List) -> List[Dict]:
        """
        Test direct RSS URLs provided by AI (fastest method).
        """
        try:
            direct_urls = []
            
            # Flatten and normalize ai_sources
            flattened_sources = []
            for source in ai_sources:
                if isinstance(source, list):
                    flattened_sources.extend(source)
                else:
                    flattened_sources.append(source)
            
            for source in flattened_sources:
                if isinstance(source, dict):
                    rss_url = source.get('rss_url', '')
                    if rss_url and rss_url.startswith('http'):
                        direct_urls.append((rss_url, source))
            
            if not direct_urls:
                return []
            
            self.logger.info(f"🔗 Testing {len(direct_urls)} direct RSS URLs from AI")
            
            # Test URLs in parallel
            tasks = [
                self._validate_single_rss_url(url, source_info)
                for url, source_info in direct_urls
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            validated_feeds = []
            for result in results:
                if isinstance(result, dict) and result.get('valid'):
                    validated_feeds.append(result)
                elif isinstance(result, Exception):
                    self.logger.debug(f"Direct URL test failed: {result}")
            
            self.logger.info(f"✅ Direct URL Testing: {len(validated_feeds)}/{len(direct_urls)} URLs validated")
            return validated_feeds
            
        except Exception as e:
            self.logger.error(f"❌ Direct URL testing failed: {e}")
            return []
    
    async def _fast_domain_endpoint_testing(self, domains: List[str]) -> List[Dict]:
        """
        Fast endpoint testing for domains (no crawling).
        """
        try:
            self.logger.info(f"🔍 Fast endpoint testing for {len(domains)} domains")
            
            # Process domains in parallel batches
            validated_feeds = []
            
            # Limit parallel domains to prevent overwhelming
            domain_batches = [domains[i:i + self.MAX_PARALLEL_DOMAINS] 
                             for i in range(0, len(domains), self.MAX_PARALLEL_DOMAINS)]
            
            for batch in domain_batches:
                batch_tasks = [self._test_domain_endpoints(domain) for domain in batch]
                batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                
                for result in batch_results:
                    if isinstance(result, list):
                        validated_feeds.extend(result)
                    elif isinstance(result, Exception):
                        self.logger.debug(f"Domain batch failed: {result}")
            
            self.logger.info(f"✅ Domain Endpoint Testing: {len(validated_feeds)} feeds found")
            return validated_feeds
            
        except Exception as e:
            self.logger.error(f"❌ Domain endpoint testing failed: {e}")
            return []
    
    async def _test_domain_endpoints(self, domain: str) -> List[Dict]:
        """
        Test common RSS endpoints for a single domain (no crawling).
        """
        domain_start = datetime.now()
        feeds = []
        
        try:
            # Normalize domain
            clean_domain = domain.strip()
            if clean_domain.startswith('http'):
                base_url = clean_domain
                domain_name = urlparse(clean_domain).netloc
            else:
                base_url = f"https://{clean_domain}"
                domain_name = clean_domain
            
            self.logger.debug(f"🔍 Testing {domain_name} - endpoint testing only")
            
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.DOMAIN_TIMEOUT),
                headers={'User-Agent': 'SignalBridge/2.0 (AI RSS Discovery)'}
            ) as session:
                
                # Test endpoints in small parallel batches for speed
                endpoint_batches = [self.WORKING_ENDPOINTS[i:i + self.MAX_PARALLEL_ENDPOINTS]
                                   for i in range(0, len(self.WORKING_ENDPOINTS), self.MAX_PARALLEL_ENDPOINTS)]
                
                for batch in endpoint_batches:
                    batch_tasks = [
                        self._test_single_endpoint(session, base_url, endpoint, domain_name)
                        for endpoint in batch
                    ]
                    
                    batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                    
                    for result in batch_results:
                        if isinstance(result, dict) and result.get('valid'):
                            feeds.append(result)
                            # Stop after finding first working feed for speed
                            break
                    
                    # Break out of batch loop if we found feeds
                    if feeds:
                        break
            
            domain_time = (datetime.now() - domain_start).total_seconds()
            
            if feeds:
                self.logger.info(f"✅ {domain_name}: Found {len(feeds)} feeds in {domain_time:.1f}s")
            else:
                self.logger.debug(f"❌ {domain_name}: No feeds found in {domain_time:.1f}s")
            
            return feeds
            
        except asyncio.TimeoutError:
            domain_time = (datetime.now() - domain_start).total_seconds()
            self.logger.warning(f"⏰ {domain}: Timeout after {domain_time:.1f}s")
            return []
        except Exception as e:
            domain_time = (datetime.now() - domain_start).total_seconds()
            self.logger.debug(f"❌ {domain}: Error after {domain_time:.1f}s - {e}")
            return []
    
    async def _test_single_endpoint(self, session: aiohttp.ClientSession, base_url: str, 
                                   endpoint: str, domain_name: str) -> Dict:
        """
        Fast test of single RSS endpoint.
        """
        try:
            feed_url = f"{base_url}{endpoint}"
            
            async with session.get(feed_url) as response:
                if response.status == 200:
                    # Quick content check - just read first 1KB for speed
                    content_chunk = await response.content.read(1024)
                    content_str = content_chunk.decode('utf-8', errors='ignore').lower()
                    
                    # Fast RSS detection
                    rss_indicators = ['<rss', '<feed', '<channel>', '<item>', '<entry>']
                    if any(indicator in content_str for indicator in rss_indicators):
                        
                        # Extract title if possible (quick scan)
                        title = f"{domain_name.title()} RSS Feed"
                        if '<title>' in content_str:
                            try:
                                title_start = content_str.find('<title>') + 7
                                title_end = content_str.find('</title>', title_start)
                                if title_end > title_start:
                                    extracted_title = content_str[title_start:title_end].strip()[:100]
                                    if extracted_title:
                                        title = extracted_title
                            except:
                                pass
                        
                        return {
                            'valid': True,
                            'url': feed_url,
                            'domain': domain_name,
                            'endpoint': endpoint,
                            'title': title,
                            'discovery_method': 'fast_endpoint_test',
                            'source_type': 'RSS'
                        }
            
            return {'valid': False, 'url': feed_url, 'reason': f'HTTP {response.status}'}
            
        except asyncio.TimeoutError:
            return {'valid': False, 'url': f"{base_url}{endpoint}", 'reason': 'timeout'}
        except Exception as e:
            return {'valid': False, 'url': f"{base_url}{endpoint}", 'reason': str(e)}
    
    async def _validate_single_rss_url(self, rss_url: str, source_info: Dict) -> Dict:
        """
        Fast validation of single RSS URL from AI recommendations.
        """
        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.ENDPOINT_TIMEOUT),
                headers={'User-Agent': 'SignalBridge/2.0 (AI RSS Validator)'}
            ) as session:
                
                async with session.get(rss_url) as response:
                    if response.status == 200:
                        # Quick validation - read first 2KB for speed
                        content_chunk = await response.content.read(2048)
                        content_str = content_chunk.decode('utf-8', errors='ignore').lower()
                        
                        # Check for RSS/Atom indicators
                        rss_indicators = [
                            '<rss', '<feed', '<channel>', '<item>', '<entry>',
                            'application/rss+xml', 'application/atom+xml'
                        ]
                        
                        if any(indicator in content_str for indicator in rss_indicators):
                            return {
                                'valid': True,
                                'url': rss_url,
                                'title': source_info.get('name', 'AI Recommended Feed'),
                                'domain': source_info.get('domain', urlparse(rss_url).netloc),
                                'source_type': source_info.get('source_type', 'RSS'),
                                'discovery_method': 'ai_direct_url',
                                'ai_confidence': source_info.get('confidence', 0.8),
                                'relevance_reasoning': source_info.get('relevance_reasoning', '')
                            }
            
            return {'valid': False, 'url': rss_url, 'reason': f'HTTP {response.status}'}
            
        except asyncio.TimeoutError:
            return {'valid': False, 'url': rss_url, 'reason': 'timeout'}
        except Exception as e:
            return {'valid': False, 'url': rss_url, 'reason': str(e)}
    
    def _extract_domains_for_testing(self, ai_sources: List, validated_feeds: List[Dict]) -> List[str]:
        """
        Extract domains from AI sources that haven't been validated yet.
        """
        validated_urls = {feed['url'] for feed in validated_feeds}
        domains = []
        
        # Flatten ai_sources in case it contains nested lists
        flattened_sources = []
        for source in ai_sources:
            if isinstance(source, list):
                flattened_sources.extend(source)
            else:
                flattened_sources.append(source)
        
        for source in flattened_sources:
            if not isinstance(source, dict):
                continue
                
            # Skip if we already validated this source
            rss_url = source.get('rss_url', '')
            if rss_url in validated_urls:
                continue
            
            # Extract domain for endpoint testing
            domain = source.get('domain', '')
            if not domain and rss_url:
                try:
                    parsed = urlparse(rss_url)
                    if parsed.netloc:
                        domain = parsed.netloc
                except:
                    continue
            
            if domain and domain not in domains:
                domains.append(domain)
        
        self.logger.info(f"📡 Extracted {len(domains)} domains for endpoint testing")
        return domains
    
    async def validate_existing_rss_urls(self, rss_urls: List[str]) -> List[Dict]:
        """
        Fast validation of existing RSS URLs (for database feeds, etc.).
        """
        start_time = datetime.now()
        
        try:
            self.logger.info(f"⚡ Validating {len(rss_urls)} existing RSS URLs")
            
            # Test URLs in parallel with aggressive timeout
            tasks = [self._quick_validate_url(url) for url in rss_urls]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            validated_feeds = []
            for result in results:
                if isinstance(result, dict) and result.get('valid'):
                    validated_feeds.append(result)
            
            total_time = (datetime.now() - start_time).total_seconds()
            success_rate = (len(validated_feeds) / len(rss_urls) * 100) if rss_urls else 0
            
            self.logger.info(f"⚡ URL Validation Complete: {total_time:.1f}s")
            self.logger.info(f"   📡 Validated: {len(validated_feeds)}/{len(rss_urls)} URLs")
            self.logger.info(f"   📊 Success Rate: {success_rate:.1f}%")
            
            return validated_feeds
            
        except Exception as e:
            total_time = (datetime.now() - start_time).total_seconds()
            self.logger.error(f"❌ URL validation failed after {total_time:.1f}s: {e}")
            return []
    
    async def _quick_validate_url(self, rss_url: str) -> Dict:
        """
        Ultra-fast validation of RSS URL (4 second timeout).
        """
        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=4)  # Very aggressive timeout
            ) as session:
                
                async with session.get(rss_url, headers={'User-Agent': 'SignalBridge/2.0'}) as response:
                    if response.status == 200:
                        # Minimal content check - just first 512 bytes
                        content_chunk = await response.content.read(512)
                        content_str = content_chunk.decode('utf-8', errors='ignore').lower()
                        
                        if any(indicator in content_str for indicator in ['<rss', '<feed', '<channel>']):
                            return {
                                'valid': True,
                                'url': rss_url,
                                'title': f"RSS Feed - {urlparse(rss_url).netloc}",
                                'discovery_method': 'quick_validation'
                            }
            
            return {'valid': False, 'url': rss_url, 'reason': 'not_rss_feed'}
            
        except asyncio.TimeoutError:
            return {'valid': False, 'url': rss_url, 'reason': 'timeout'}
        except Exception as e:
            return {'valid': False, 'url': rss_url, 'reason': str(e)}
    
    def extract_domains_from_urls(self, urls: List[str]) -> List[str]:
        """
        Extract unique domains from list of URLs.
        """
        domains = []
        for url in urls:
            try:
                parsed = urlparse(url)
                if parsed.netloc:
                    domain = parsed.netloc
                    # Remove www. prefix
                    if domain.startswith('www.'):
                        domain = domain[4:]
                    if domain not in domains:
                        domains.append(domain)
            except:
                continue
        
        return domains
    
    def get_discovery_stats(self) -> Dict:
        """
        Get discovery performance statistics.
        """
        return {
            'working_endpoints': len(self.WORKING_ENDPOINTS),
            'domain_timeout': self.DOMAIN_TIMEOUT,
            'endpoint_timeout': self.ENDPOINT_TIMEOUT,
            'max_parallel_domains': self.MAX_PARALLEL_DOMAINS,
            'discovery_method': 'endpoint_testing_only',
            'crawling_enabled': False,
            'performance_optimized': True
        }