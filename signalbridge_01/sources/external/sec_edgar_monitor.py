# signalbridge/sources/sec_edgar_monitor.py
"""
SEC/EDGAR Filing Monitor for SignalBridge

Monitors SEC EDGAR database for new filings from specified companies.
Integrates with existing AI evaluation pipeline.

PRINCIPLES:
- Uses SEC EDGAR RSS feeds for real-time monitoring
- Fetches full filing text for AI analysis
- Integrates seamlessly with existing signal creation pipeline
- Supports strategic company discovery via AI
"""

import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple
import aiohttp
import xml.etree.ElementTree as ET
from dataclasses import dataclass
import re
import os

logger = logging.getLogger(__name__)

@dataclass
class SECFiling:
    """Represents a SEC filing for AI analysis"""
    cik: str
    company_name: str
    form_type: str
    filing_date: str
    document_url: str
    title: str
    description: str
    full_text: str = ""
    filing_summary: str = ""

class SECEDGARMonitor:
    """
    Monitors SEC EDGAR filings for strategic intelligence.
    Integrates with SignalBridge's AI evaluation pipeline.
    """
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.monitored_companies: Dict[str, str] = {}  # CIK -> Company Name
        
        # SEC API configuration
        self.sec_base_url = "https://www.sec.gov"
        self.edgar_rss_url = "https://www.sec.gov/cgi-bin/browse-edgar"
        self.sec_headers = {
            'User-Agent': 'SignalBridge AI Intelligence (your-email@company.com)',
            'Accept-Encoding': 'gzip, deflate',
            'Host': 'www.sec.gov'
        }
        
        # Filing types of strategic interest
        self.strategic_filing_types = {
            '10-K': 'Annual Report',
            '10-Q': 'Quarterly Report', 
            '8-K': 'Current Report (Material Events)',
            'DEF 14A': 'Proxy Statement',
            '13F-HR': 'Institutional Holdings',
            'SC 13G': 'Beneficial Ownership Report',
            'SC 13D': 'Beneficial Ownership Report (>5%)',
            '424B': 'Prospectus',
            'S-1': 'Registration Statement'
        }
        
        logger.info("📊 SEC/EDGAR Monitor initialized")
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            headers=self.sec_headers,
            timeout=aiohttp.ClientTimeout(total=30)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def discover_companies_for_pirs(self, pirs: List[Dict], strategic_context: Dict) -> Dict[str, str]:
        """
        AI discovers relevant companies to monitor based on PIRs.
        Returns dict of CIK -> Company Name
        """
        try:
            logger.info("🔍 AI Company Discovery: Finding companies relevant to strategic objectives")
            
            # Extract company names and tickers from PIRs and strategic context
            companies = await self._ai_extract_companies_from_strategic_context(
                pirs, strategic_context
            )
            
            # Convert company names/tickers to CIK numbers
            company_ciks = {}
            for company_identifier in companies:
                cik = await self._lookup_company_cik(company_identifier)
                if cik:
                    company_ciks[cik] = company_identifier
                    logger.info(f"📊 Found CIK {cik} for {company_identifier}")
            
            self.monitored_companies = company_ciks
            logger.info(f"✅ Company Discovery: Monitoring {len(company_ciks)} companies")
            
            return company_ciks
            
        except Exception as e:
            logger.error(f"❌ Company discovery failed: {e}")
            return {}
    
    async def _ai_extract_companies_from_strategic_context(self, pirs: List[Dict], 
                                                         strategic_context: Dict) -> List[str]:
        """
        Extract company names/tickers from PIRs using AI or regex patterns.
        """
        companies = set()
        
        # Extract from strategic goal and context
        strategic_text = f"{strategic_context.get('strategic_goal', '')} {strategic_context.get('strategic_context', '')}"
        
        # Extract from PIR indicator texts
        pir_texts = [pir.get('indicator_text', '') for pir in pirs]
        all_text = f"{strategic_text} {' '.join(pir_texts)}"
        
        # Simple regex patterns for common company formats
        patterns = [
            r'\b[A-Z]{2,5}\b(?:\s+Inc\.?|\s+Corp\.?|\s+LLC|\s+Co\.?)?',  # Ticker symbols
            r'\b[A-Z][a-z]+ Inc\.?\b',  # Company Inc.
            r'\b[A-Z][a-z]+ Corp\.?\b',  # Company Corp.
            r'\b[A-Z][a-z]+ Co\.?\b',   # Company Co.
            r'\b[A-Z][a-z]+ LLC\b',     # Company LLC
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, all_text)
            companies.update(matches)
        
        # Common company name patterns
        company_keywords = ['Apple', 'Microsoft', 'Tesla', 'Amazon', 'Google', 'Meta', 'Netflix', 'Nvidia']
        for keyword in company_keywords:
            if keyword.lower() in all_text.lower():
                companies.add(keyword)
        
        return list(companies)
    
    async def _lookup_company_cik(self, company_identifier: str) -> Optional[str]:
        """
        Look up CIK number for company name or ticker.
        """
        try:
            # SEC Company Tickers JSON endpoint
            tickers_url = "https://www.sec.gov/files/company_tickers.json"
            
            async with self.session.get(tickers_url) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Search through company data
                    for entry in data.values():
                        ticker = entry.get('ticker', '').upper()
                        title = entry.get('title', '').upper()
                        cik = str(entry.get('cik_str', '')).zfill(10)
                        
                        identifier_upper = company_identifier.upper()
                        
                        if (identifier_upper == ticker or 
                            identifier_upper in title or
                            company_identifier.lower() in title.lower()):
                            return cik
            
            logger.warning(f"Could not find CIK for: {company_identifier}")
            return None
            
        except Exception as e:
            logger.error(f"Error looking up CIK for {company_identifier}: {e}")
            return None
    
    async def get_recent_filings(self, days_back: int = 7) -> List[SECFiling]:
        """
        Get recent SEC filings for monitored companies.
        """
        try:
            logger.info(f"📊 Fetching recent SEC filings ({days_back} days)")
            
            if not self.monitored_companies:
                logger.warning("No companies configured for monitoring")
                return []
            
            all_filings = []
            
            for cik, company_name in self.monitored_companies.items():
                try:
                    company_filings = await self._get_company_filings(cik, company_name, days_back)
                    all_filings.extend(company_filings)
                    logger.info(f"📄 {company_name}: {len(company_filings)} recent filings")
                    
                except Exception as e:
                    logger.error(f"Error fetching filings for {company_name}: {e}")
            
            # Sort by filing date (newest first)
            all_filings.sort(key=lambda f: f.filing_date, reverse=True)
            
            logger.info(f"✅ Total recent filings: {len(all_filings)}")
            return all_filings
            
        except Exception as e:
            logger.error(f"❌ Error fetching recent filings: {e}")
            return []
    
    async def _get_company_filings(self, cik: str, company_name: str, days_back: int) -> List[SECFiling]:
        """
        Get recent filings for a specific company.
        FIXED: Now properly uses days_back parameter and increases count limit.
        """
        try:
            # Calculate the date range for the search
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            
            # Format dates for SEC API (YYYYMMDD format)
            dateb = end_date.strftime('%Y%m%d')  # End date (before this date)
            
            # Build strategic filing types string for URL
            filing_types = '&'.join([f'type={form_type}' for form_type in ['10-K', '10-Q', '8-K']])
            
            # SEC EDGAR RSS feed for company with proper date range and higher count
            # Note: dateb means "before this date", so we use current date
            # The system will return filings going back from this date
            rss_url = f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&dateb={dateb}&count=100&output=atom"
            
            logger.debug(f"🔍 Fetching from URL: {rss_url}")
            
            async with self.session.get(rss_url) as response:
                if response.status != 200:
                    logger.warning(f"SEC RSS request failed for {company_name}: {response.status}")
                    return []
                
                rss_content = await response.text()
                
                # Debug: Log if we got content
                if rss_content:
                    logger.debug(f"📄 Received {len(rss_content)} characters of RSS content for {company_name}")
                else:
                    logger.warning(f"📄 Empty RSS response for {company_name}")
                
                return await self._parse_sec_rss_feed(rss_content, cik, company_name, days_back)
                
        except Exception as e:
            logger.error(f"Error fetching company filings for {company_name}: {e}")
            return []
    
    async def _parse_sec_rss_feed(self, rss_content: str, cik: str, 
                                 company_name: str, days_back: int) -> List[SECFiling]:
        """
        Parse SEC RSS feed and extract filing information.
        FIXED: Better error handling and date filtering.
        """
        try:
            if not rss_content.strip():
                logger.warning(f"Empty RSS content for {company_name}")
                return []
            
            # Debug: Log first 500 chars of RSS content
            logger.debug(f"RSS content preview for {company_name}: {rss_content[:500]}...")
            
            root = ET.fromstring(rss_content)
            
            # Find all entry elements (filings)
            entries = root.findall('.//{http://www.w3.org/2005/Atom}entry')
            logger.debug(f"Found {len(entries)} entries in RSS feed for {company_name}")
            
            filings = []
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_back)
            
            for entry in entries:
                try:
                    # Extract filing information
                    title_elem = entry.find('.//{http://www.w3.org/2005/Atom}title')
                    link_elem = entry.find('.//{http://www.w3.org/2005/Atom}link')
                    updated_elem = entry.find('.//{http://www.w3.org/2005/Atom}updated')
                    summary_elem = entry.find('.//{http://www.w3.org/2005/Atom}summary')
                    
                    if not all([title_elem, link_elem, updated_elem]):
                        logger.debug("Skipping entry - missing required elements")
                        continue
                    
                    title = title_elem.text or ""
                    filing_url = link_elem.get('href', '')
                    filing_date_str = updated_elem.text or ""
                    summary = summary_elem.text if summary_elem is not None else ""
                    
                    # Parse filing date
                    try:
                        filing_date = datetime.fromisoformat(filing_date_str.replace('Z', '+00:00'))
                    except ValueError:
                        logger.debug(f"Could not parse date: {filing_date_str}")
                        continue
                    
                    # Check if filing is within date range
                    if filing_date < cutoff_date:
                        logger.debug(f"Filing {title} is outside date range ({filing_date} < {cutoff_date})")
                        continue
                    
                    # Extract form type from title
                    form_type = self._extract_form_type(title)
                    
                    # For now, include ALL filings to see what we're getting
                    # Later we can filter by strategic types
                    # if form_type not in self.strategic_filing_types:
                    #     continue
                    
                    filing = SECFiling(
                        cik=cik,
                        company_name=company_name,
                        form_type=form_type,
                        filing_date=filing_date.isoformat(),
                        document_url=filing_url,
                        title=title,
                        description=f"{self.strategic_filing_types.get(form_type, 'Other Filing')} - {summary}",
                        filing_summary=summary
                    )
                    
                    filings.append(filing)
                    logger.debug(f"Added filing: {form_type} - {title}")
                    
                except Exception as e:
                    logger.warning(f"Error parsing SEC filing entry: {e}")
                    continue
            
            logger.info(f"Parsed {len(filings)} filings for {company_name} within {days_back} days")
            return filings
            
        except ET.ParseError as e:
            logger.error(f"XML parsing error for {company_name}: {e}")
            logger.debug(f"Raw RSS content: {rss_content[:1000]}...")
            return []
        except Exception as e:
            logger.error(f"Error parsing SEC RSS feed for {company_name}: {e}")
            return []
    
    def _extract_form_type(self, title: str) -> str:
        """Extract form type from SEC filing title."""
        # Common patterns in SEC titles
        for form_type in self.strategic_filing_types.keys():
            if form_type in title.upper():
                return form_type
        
        # Try to extract from pattern like "8-K - Current report"
        match = re.search(r'(\d+[-/][A-Z]+|\w+\s\d+[A-Z]*)', title.upper())
        if match:
            return match.group(1)
        
        return "OTHER"
    
    async def fetch_filing_content(self, filing: SECFiling) -> str:
        """
        Fetch and extract text content from SEC filing for AI analysis.
        """
        try:
            logger.debug(f"📄 Fetching content for {filing.form_type}: {filing.title}")
            
            # Get the filing page first
            async with self.session.get(filing.document_url) as response:
                if response.status != 200:
                    logger.warning(f"Failed to fetch filing page: {response.status}")
                    return filing.description
                
                page_content = await response.text()
                
                # Extract the actual document URL (usually a .htm or .txt file)
                document_links = re.findall(r'href="([^"]*\.(?:htm|txt))"', page_content)
                
                if not document_links:
                    logger.warning("No document links found in filing page")
                    return filing.description
                
                # Get the primary document (usually first .htm file)
                doc_url = f"{self.sec_base_url}{document_links[0]}"
                
                # Fetch document content
                async with self.session.get(doc_url) as doc_response:
                    if doc_response.status == 200:
                        content = await doc_response.text()
                        
                        # Extract text from HTML/XML content
                        clean_text = self._extract_text_from_sec_document(content)
                        
                        # Limit content size for AI processing (first 5000 chars)
                        return clean_text[:5000] if clean_text else filing.description
                    else:
                        logger.warning(f"Failed to fetch document content: {doc_response.status}")
                        return filing.description
                        
        except Exception as e:
            logger.error(f"Error fetching filing content: {e}")
            return filing.description
    
    def _extract_text_from_sec_document(self, content: str) -> str:
        """
        Extract clean text from SEC document HTML/XML.
        """
        try:
            # Remove HTML/XML tags
            text = re.sub(r'<[^>]+>', ' ', content)
            
            # Remove extra whitespace
            text = re.sub(r'\s+', ' ', text)
            
            # Remove common SEC boilerplate
            text = re.sub(r'UNITED STATES.*?SECURITIES AND EXCHANGE COMMISSION.*?Washington.*?D\.C\. 20549', '', text, flags=re.DOTALL)
            
            # Clean up
            text = text.strip()
            
            return text
            
        except Exception as e:
            logger.error(f"Error extracting text from SEC document: {e}")
            return content[:1000]  # Fallback to first 1000 chars
    
    def convert_filing_to_article_format(self, filing: SECFiling) -> Dict:
        """
        Convert SEC filing to article format for AI evaluation pipeline.
        """
        return {
            'title': f"{filing.company_name} - {filing.form_type}: {filing.title}",
            'description': filing.full_text or filing.description,
            'url': filing.document_url,
            'source': f"SEC EDGAR - {filing.company_name}",
            'published_date': filing.filing_date,
            'form_type': filing.form_type,
            'company_name': filing.company_name,
            'cik': filing.cik
        }
    
    async def get_filings_for_ai_evaluation(self, days_back: int = 7) -> List[Dict]:
        """
        Get SEC filings formatted for AI evaluation pipeline.
        """
        try:
            logger.info("📊 Preparing SEC filings for AI evaluation")
            
            # Get recent filings
            filings = await self.get_recent_filings(days_back)
            
            if not filings:
                logger.info("No recent SEC filings found")
                return []
            
            # Fetch content and convert to article format
            articles = []
            for filing in filings[:50]:  # Increased limit from 20 to 50 for 40 years of data
                try:
                    # For now, skip fetching full content to debug the basic filing retrieval
                    # We can add this back once we confirm filings are being found
                    # filing.full_text = await self.fetch_filing_content(filing)
                    
                    # Convert to article format
                    article = self.convert_filing_to_article_format(filing)
                    articles.append(article)
                    
                except Exception as e:
                    logger.error(f"Error processing filing {filing.title}: {e}")
                    continue
            
            logger.info(f"✅ Prepared {len(articles)} SEC filings for AI evaluation")
            return articles
            
        except Exception as e:
            logger.error(f"❌ Error preparing SEC filings for AI evaluation: {e}")
            return []


# Example usage and testing
async def test_sec_monitor():
    """Test SEC monitor functionality"""
    async with SECEDGARMonitor() as monitor:
        # Test company discovery
        test_pirs = [
            {'indicator_text': 'Apple Inc financial performance and strategic initiatives'},
            {'indicator_text': 'Tesla TSLA quarterly results and guidance'}
        ]
        test_context = {
            'strategic_goal': 'Monitor technology companies for investment opportunities',
            'strategic_context': 'Focus on Apple and Tesla strategic developments'
        }
        
        companies = await monitor.discover_companies_for_pirs(test_pirs, test_context)
        print(f"Discovered companies: {companies}")
        
        if companies:
            filings = await monitor.get_recent_filings(days_back=30)
            print(f"Recent filings: {len(filings)}")
            
            if filings:
                articles = await monitor.get_filings_for_ai_evaluation(days_back=30)
                print(f"Articles for AI: {len(articles)}")


if __name__ == "__main__":
    asyncio.run(test_sec_monitor())