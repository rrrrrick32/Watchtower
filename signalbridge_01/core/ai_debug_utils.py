# signalbridge/core/ai_debug_utils.py
"""
AI Debug Utils - Testing and Troubleshooting for AI-First System

Provides comprehensive debugging, testing, and performance analysis tools
for the AI-first strategic intelligence system.

FEATURES:
- AI component testing and validation
- Performance benchmarking and timing analysis
- Strategic context simulation and testing
- RSS discovery validation
- Signal quality analysis
- Failure point diagnosis
"""

import asyncio
import logging
import json
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
import aiohttp
import os
from pathlib import Path

# Import AI components for testing
from core.ai_strategic_controller import AIStrategicController
from core.ai_evaluator import AIEvaluator
from sources.ai_rss_discovery import AIRSSDiscovery

logger = logging.getLogger(__name__)

class AIDebugUtils:
    """
    Comprehensive debugging and testing utilities for AI-first system.
    """
    
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self.debug_session_id = f"debug_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Test results storage
        self.test_results = {
            'session_id': self.debug_session_id,
            'started_at': datetime.now(timezone.utc).isoformat(),
            'tests_run': [],
            'performance_metrics': {},
            'errors': [],
            'warnings': []
        }
        
        logger.info(f"🔧 AI Debug Utils initialized - Session: {self.debug_session_id}")
    
    async def run_comprehensive_ai_system_test(self) -> Dict:
        """
        Run comprehensive test of entire AI-first system.
        """
        try:
            logger.info("🧪 Starting Comprehensive AI System Test")
            
            test_start = time.time()
            
            # Test 1: API Connectivity
            api_test = await self._test_api_connectivity()
            self._record_test_result("api_connectivity", api_test)
            
            # Test 2: AI Strategic Controller
            if api_test['passed']:
                controller_test = await self._test_ai_strategic_controller()
                self._record_test_result("ai_strategic_controller", controller_test)
            
            # Test 3: AI Evaluator
            if api_test['passed']:
                evaluator_test = await self._test_ai_evaluator()
                self._record_test_result("ai_evaluator", evaluator_test)
            
            # Test 4: RSS Discovery
            rss_test = await self._test_rss_discovery()
            self._record_test_result("rss_discovery", rss_test)
            
            # Test 5: Database Integration
            if self.supabase:
                db_test = await self._test_database_integration()
                self._record_test_result("database_integration", db_test)
            
            # Test 6: End-to-End Workflow (if all components pass)
            if all(test['passed'] for test in [api_test, controller_test, evaluator_test, rss_test]):
                e2e_test = await self._test_end_to_end_workflow()
                self._record_test_result("end_to_end_workflow", e2e_test)
            
            total_time = time.time() - test_start
            
            # Generate comprehensive report
            test_report = self._generate_test_report(total_time)
            
            logger.info("✅ Comprehensive AI System Test Complete")
            logger.info(f"   📊 Tests Run: {len(self.test_results['tests_run'])}")
            logger.info(f"   ⏱️ Total Time: {total_time:.2f}s")
            logger.info(f"   🎯 Overall Status: {'PASS' if test_report['overall_status'] == 'PASS' else 'FAIL'}")
            
            return test_report
            
        except Exception as e:
            logger.error(f"❌ Comprehensive test failed: {e}")
            return {
                'overall_status': 'FAIL',
                'error': str(e),
                'session_id': self.debug_session_id
            }
    
    async def _test_api_connectivity(self) -> Dict:
        """Test OpenAI API connectivity"""
        try:
            logger.info("🔌 Testing OpenAI API connectivity...")
            
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                return {
                    'passed': False,
                    'error': 'OPENAI_API_KEY not found in environment',
                    'details': 'API key is required for AI-first operation'
                }
            
            # Simple API test
            async with aiohttp.ClientSession() as session:
                headers = {
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json'
                }
                
                payload = {
                    'model': 'gpt-4o-mini',
                    'messages': [{'role': 'user', 'content': 'Test'}],
                    'max_tokens': 10
                }
                
                start_time = time.time()
                async with session.post('https://api.openai.com/v1/chat/completions',
                                       headers=headers, json=payload) as response:
                    api_time = time.time() - start_time
                    
                    if response.status == 200:
                        return {
                            'passed': True,
                            'response_time': api_time,
                            'status_code': response.status,
                            'details': f'API responding in {api_time:.2f}s'
                        }
                    else:
                        error_text = await response.text()
                        return {
                            'passed': False,
                            'error': f'API error: {response.status}',
                            'details': error_text
                        }
            
        except Exception as e:
            return {
                'passed': False,
                'error': str(e),
                'details': 'Failed to connect to OpenAI API'
            }
    
    async def _test_ai_strategic_controller(self) -> Dict:
        """Test AI Strategic Controller functionality"""
        try:
            logger.info("🧠 Testing AI Strategic Controller...")
            
            if not self.supabase:
                return {
                    'passed': False,
                    'error': 'Supabase client required for controller test',
                    'details': 'Controller needs database access'
                }
            
            controller = AIStrategicController(self.supabase)
            
            # Create test strategic context
            test_context = {
                'intent_text': 'Analyze competitive landscape for hydraulic pump efficiency in oil and gas operations',
                'context': 'Strategic evaluation of pump technology market position',
                'decisions': [
                    'Should we invest in next-generation pump technology?',
                    'How should we position against competitors?'
                ]
            }
            
            # Create test PIR indicators
            test_pirs = [
                {
                    'id': 'test_pir_1',
                    'indicator_text': 'Monitor competitor pump efficiency ratings and market announcements',
                    'priority': 'high'
                },
                {
                    'id': 'test_pir_2', 
                    'indicator_text': 'Track energy consumption improvements in hydraulic pump systems',
                    'priority': 'medium'
                }
            ]
            
            start_time = time.time()
            
            # Test strategic analysis
            strategy_result = await controller.analyze_strategic_context_and_generate_collection_strategy(
                test_context, test_pirs
            )
            
            analysis_time = time.time() - start_time
            
            # Validate results
            required_fields = ['strategy', 'collection_params', 'ai_confidence']
            if all(field in strategy_result for field in required_fields):
                return {
                    'passed': True,
                    'analysis_time': analysis_time,
                    'ai_confidence': strategy_result.get('ai_confidence', 0),
                    'strategic_approach': strategy_result['strategy'].get('strategic_approach', ''),
                    'details': f'Strategic analysis completed in {analysis_time:.2f}s'
                }
            else:
                return {
                    'passed': False,
                    'error': 'Incomplete strategy result',
                    'details': f'Missing fields: {[f for f in required_fields if f not in strategy_result]}'
                }
                
        except Exception as e:
            return {
                'passed': False,
                'error': str(e),
                'details': 'AI Strategic Controller test failed'
            }
    
    async def _test_ai_evaluator(self) -> Dict:
        """Test AI Evaluator functionality"""
        try:
            logger.info("🤖 Testing AI Evaluator...")
            
            if not self.supabase:
                return {
                    'passed': False,
                    'error': 'Supabase client required for evaluator test',
                    'details': 'Evaluator needs database access'
                }
            
            evaluator = AIEvaluator(self.supabase)
            
            # Create test article
            test_article = {
                'title': 'New Hydraulic Pump Technology Increases Efficiency by 25%',
                'description': 'Revolutionary pump design reduces energy consumption in oil and gas operations through advanced fluid dynamics.',
                'url': 'https://example.com/test-article',
                'source': 'Industry Technology News'
            }
            
            # Create test PIR
            test_pir = {
                'id': 'test_pir_eval',
                'indicator_text': 'Monitor hydraulic pump efficiency improvements in oil and gas industry',
                'session_id': self.debug_session_id
            }
            
            # Create test strategic context
            test_strategic_context = {
                'strategic_approach': 'competitive technology analysis',
                'intelligence_domains': ['hydraulic systems', 'oil and gas technology'],
                'urgency_level': 'strategic',
                'cross_pir_analysis': 'Technology advancement monitoring'
            }
            
            start_time = time.time()
            
            # Test article evaluation
            eval_result = await evaluator._ai_evaluate_single_article(
                test_article, test_pir, test_strategic_context, 0.3
            )
            
            eval_time = time.time() - start_time
            
            # Test query generation
            query_start = time.time()
            queries = await evaluator.generate_ai_search_queries(test_pir, test_strategic_context)
            query_time = time.time() - query_start
            
            # Validate results
            if eval_result and 'relevance_score' in eval_result and queries:
                return {
                    'passed': True,
                    'evaluation_time': eval_time,
                    'query_generation_time': query_time,
                    'relevance_score': eval_result.get('relevance_score', 0),
                    'recommendation': eval_result.get('recommendation', 'unknown'),
                    'queries_generated': len(queries),
                    'details': f'Evaluation completed in {eval_time:.2f}s, {len(queries)} queries generated'
                }
            else:
                return {
                    'passed': False,
                    'error': 'Evaluation or query generation failed',
                    'details': f'Eval result: {bool(eval_result)}, Queries: {len(queries) if queries else 0}'
                }
                
        except Exception as e:
            return {
                'passed': False,
                'error': str(e),
                'details': 'AI Evaluator test failed'
            }
    
    async def _test_rss_discovery(self) -> Dict:
        """Test RSS discovery functionality"""
        try:
            logger.info("📡 Testing RSS Discovery...")
            
            discovery = AIRSSDiscovery()
            
            # Test AI source recommendations
            test_ai_sources = [
                {
                    'domain': 'energy.gov',
                    'name': 'Department of Energy',
                    'rss_url': 'https://energy.gov/rss.xml',
                    'source_type': 'government',
                    'confidence': 0.9
                },
                {
                    'domain': 'oilandgasjournal.com',
                    'name': 'Oil & Gas Journal',
                    'rss_url': 'https://oilandgasjournal.com/rss.xml',
                    'source_type': 'industry_publication',
                    'confidence': 0.8
                }
            ]
            
            start_time = time.time()
            
            # Test discovery
            discovered_feeds = await discovery.discover_feeds_from_ai_recommendations(test_ai_sources)
            
            discovery_time = time.time() - start_time
            
            # Test URL validation
            test_urls = ['https://feeds.reuters.com/reuters/businessNews']
            validation_start = time.time()
            validated_feeds = await discovery.validate_existing_rss_urls(test_urls)
            validation_time = time.time() - validation_start
            
            return {
                'passed': True,
                'discovery_time': discovery_time,
                'validation_time': validation_time,
                'feeds_discovered': len(discovered_feeds),
                'feeds_validated': len(validated_feeds),
                'details': f'Discovery: {len(discovered_feeds)} feeds in {discovery_time:.2f}s, Validation: {len(validated_feeds)} feeds in {validation_time:.2f}s'
            }
            
        except Exception as e:
            return {
                'passed': False,
                'error': str(e),
                'details': 'RSS Discovery test failed'
            }
    
    async def _test_database_integration(self) -> Dict:
        """Test database integration functionality"""
        try:
            logger.info("🗄️ Testing Database Integration...")
            
            # Test basic connectivity
            start_time = time.time()
            
            # Test PIR loading
            pirs = await self.supabase.get_active_pir_indicators()
            pir_time = time.time() - start_time
            
            # Test strategic context
            context_start = time.time()
            context = await self.supabase.get_strategic_context()
            context_time = time.time() - context_start
            
            # Test source creation
            source_start = time.time()
            test_source_id = await self.supabase.create_or_get_signal_source(
                source_name=f"Test Source {self.debug_session_id}",
                source_url=f"https://test.com/{self.debug_session_id}",
                source_type="DEBUG"
            )
            source_time = time.time() - source_start
            
            return {
                'passed': True,
                'pir_load_time': pir_time,
                'context_load_time': context_time,
                'source_creation_time': source_time,
                'pirs_found': len(pirs) if pirs else 0,
                'context_loaded': bool(context),
                'test_source_created': bool(test_source_id),
                'details': f'PIR: {len(pirs) if pirs else 0} loaded in {pir_time:.2f}s, Context: {bool(context)}, Source: {bool(test_source_id)}'
            }
            
        except Exception as e:
            return {
                'passed': False,
                'error': str(e),
                'details': 'Database integration test failed'
            }
    
    async def _test_end_to_end_workflow(self) -> Dict:
        """Test complete end-to-end AI workflow"""
        try:
            logger.info("🔄 Testing End-to-End AI Workflow...")
            
            from sources.historical.ai_smart_collector import AISmartCollector
            
            collector = AISmartCollector(self.supabase)
            
            start_time = time.time()
            
            # Run mini collection (1 day back for speed)
            results = await collector.collect_strategic_intelligence(days_back=1)
            
            workflow_time = time.time() - start_time
            
            # Check for errors
            if 'error' in results:
                return {
                    'passed': False,
                    'error': results['error'],
                    'details': f'End-to-end workflow failed: {results.get("failure_point", "unknown")}'
                }
            
            # Validate results structure
            expected_fields = ['collection_results', 'strategic_analysis', 'performance_metrics']
            if all(field in results for field in expected_fields):
                return {
                    'passed': True,
                    'workflow_time': workflow_time,
                    'articles_processed': results.get('collection_stats', {}).get('total_articles_processed', 0),
                    'signals_created': results.get('collection_stats', {}).get('total_signals_created', 0),
                    'sources_discovered': results.get('collection_stats', {}).get('sources_discovered', 0),
                    'details': f'Complete workflow executed in {workflow_time:.2f}s'
                }
            else:
                return {
                    'passed': False,
                    'error': 'Incomplete workflow results',
                    'details': f'Missing fields: {[f for f in expected_fields if f not in results]}'
                }
                
        except Exception as e:
            return {
                'passed': False,
                'error': str(e),
                'details': 'End-to-end workflow test failed'
            }
    
    def _record_test_result(self, test_name: str, result: Dict):
        """Record test result"""
        self.test_results['tests_run'].append({
            'test_name': test_name,
            'passed': result.get('passed', False),
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'result': result
        })
        
        if not result.get('passed', False):
            self.test_results['errors'].append({
                'test_name': test_name,
                'error': result.get('error', 'Unknown error'),
                'details': result.get('details', '')
            })
    
    def _generate_test_report(self, total_time: float) -> Dict:
        """Generate comprehensive test report"""
        tests_run = self.test_results['tests_run']
        passed_tests = [t for t in tests_run if t['passed']]
        failed_tests = [t for t in tests_run if not t['passed']]
        
        overall_status = 'PASS' if len(failed_tests) == 0 else 'FAIL'
        
        report = {
            'session_id': self.debug_session_id,
            'overall_status': overall_status,
            'summary': {
                'total_tests': len(tests_run),
                'passed': len(passed_tests),
                'failed': len(failed_tests),
                'total_time': total_time,
                'success_rate': len(passed_tests) / len(tests_run) if tests_run else 0
            },
            'test_details': tests_run,
            'errors': self.test_results['errors'],
            'performance_metrics': self._extract_performance_metrics(),
            'recommendations': self._generate_recommendations(),
            'completed_at': datetime.now(timezone.utc).isoformat()
        }
        
        return report
    
    def _extract_performance_metrics(self) -> Dict:
        """Extract performance metrics from test results"""
        metrics = {}
        
        for test in self.test_results['tests_run']:
            if test['passed']:
                result = test['result']
                test_name = test['test_name']
                
                # Extract timing metrics
                for key, value in result.items():
                    if 'time' in key and isinstance(value, (int, float)):
                        metrics[f"{test_name}_{key}"] = value
                
                # Extract other performance metrics
                performance_keys = ['response_time', 'analysis_time', 'evaluation_time', 
                                  'discovery_time', 'workflow_time']
                for key in performance_keys:
                    if key in result:
                        metrics[f"{test_name}_{key}"] = result[key]
        
        return metrics
    
    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations based on test results"""
        recommendations = []
        
        # Check for failed tests
        failed_tests = [t for t in self.test_results['tests_run'] if not t['passed']]
        
        if failed_tests:
            recommendations.append("❌ Address failed tests before production deployment")
            
            for test in failed_tests:
                test_name = test['test_name']
                error = test['result'].get('error', '')
                
                if 'api' in error.lower():
                    recommendations.append(f"🔑 Check OpenAI API key configuration for {test_name}")
                elif 'database' in error.lower():
                    recommendations.append(f"🗄️ Verify database connectivity for {test_name}")
                elif 'timeout' in error.lower():
                    recommendations.append(f"⏱️ Consider increasing timeout values for {test_name}")
        
        # Check performance metrics
        metrics = self._extract_performance_metrics()
        
        for metric_name, value in metrics.items():
            if 'time' in metric_name and value > 30:
                recommendations.append(f"⚡ Performance: {metric_name} is slow ({value:.2f}s)")
        
        if not recommendations:
            recommendations.append("✅ All tests passed - system ready for production")
        
        return recommendations
    
    async def benchmark_ai_performance(self, iterations: int = 5) -> Dict:
        """
        Benchmark AI component performance over multiple iterations.
        """
        try:
            logger.info(f"📊 Benchmarking AI Performance ({iterations} iterations)")
            
            if not self.supabase:
                return {'error': 'Supabase client required for benchmarking'}
            
            controller = AIStrategicController(self.supabase)
            evaluator = AIEvaluator(self.supabase)
            
            benchmark_results = {
                'iterations': iterations,
                'strategic_analysis_times': [],
                'evaluation_times': [],
                'query_generation_times': [],
                'total_benchmark_time': 0
            }
            
            benchmark_start = time.time()
            
            # Test data
            test_context = {
                'intent_text': 'Benchmark test for AI performance analysis',
                'context': 'Performance testing context',
                'decisions': ['Test decision 1', 'Test decision 2']
            }
            
            test_pirs = [
                {'id': f'bench_pir_{i}', 'indicator_text': f'Test PIR {i}', 'priority': 'medium'}
                for i in range(3)
            ]
            
            test_article = {
                'title': 'Test article for performance benchmarking',
                'description': 'This is a test article used for AI evaluation benchmarking.',
                'url': 'https://example.com/benchmark',
                'source': 'Benchmark Source'
            }
            
            test_strategic_context = {
                'strategic_approach': 'benchmark testing',
                'intelligence_domains': ['testing', 'performance'],
                'urgency_level': 'strategic'
            }
            
            for i in range(iterations):
                logger.info(f"📊 Benchmark iteration {i+1}/{iterations}")
                
                # Test strategic analysis
                try:
                    start_time = time.time()
                    await controller.analyze_strategic_context_and_generate_collection_strategy(
                        test_context, test_pirs
                    )
                    benchmark_results['strategic_analysis_times'].append(time.time() - start_time)
                except Exception as e:
                    logger.warning(f"Strategic analysis failed in iteration {i+1}: {e}")
                
                # Test evaluation
                try:
                    start_time = time.time()
                    await evaluator._ai_evaluate_single_article(
                        test_article, test_pirs[0], test_strategic_context, 0.3
                    )
                    benchmark_results['evaluation_times'].append(time.time() - start_time)
                except Exception as e:
                    logger.warning(f"Evaluation failed in iteration {i+1}: {e}")
                
                # Test query generation
                try:
                    start_time = time.time()
                    await evaluator.generate_ai_search_queries(test_pirs[0], test_strategic_context)
                    benchmark_results['query_generation_times'].append(time.time() - start_time)
                except Exception as e:
                    logger.warning(f"Query generation failed in iteration {i+1}: {e}")
                
                # Brief pause between iterations
                await asyncio.sleep(0.5)
            
            benchmark_results['total_benchmark_time'] = time.time() - benchmark_start
            
            # Calculate statistics
            benchmark_results['statistics'] = self._calculate_benchmark_statistics(benchmark_results)
            
            logger.info(f"📊 Benchmark Complete: {benchmark_results['total_benchmark_time']:.2f}s total")
            
            return benchmark_results
            
        except Exception as e:
            logger.error(f"❌ Benchmark failed: {e}")
            return {'error': str(e)}
    
    def _calculate_benchmark_statistics(self, results: Dict) -> Dict:
        """Calculate benchmark statistics"""
        stats = {}
        
        for metric_name in ['strategic_analysis_times', 'evaluation_times', 'query_generation_times']:
            times = results.get(metric_name, [])
            if times:
                stats[metric_name] = {
                    'mean': sum(times) / len(times),
                    'min': min(times),
                    'max': max(times),
                    'count': len(times)
                }
        
        return stats
    
    def save_debug_report(self, report: Dict, filename: Optional[str] = None) -> str:
        """Save debug report to file"""
        try:
            if not filename:
                filename = f"ai_debug_report_{self.debug_session_id}.json"
            
            # Create debug directory if it doesn't exist
            debug_dir = Path("debug_reports")
            debug_dir.mkdir(exist_ok=True)
            
            report_path = debug_dir / filename
            
            with open(report_path, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            
            logger.info(f"📄 Debug report saved: {report_path}")
            return str(report_path)
            
        except Exception as e:
            logger.error(f"❌ Failed to save debug report: {e}")
            return ""


# Standalone test functions for quick debugging
async def quick_ai_test(supabase_client=None) -> Dict:
    """Quick AI system test for rapid debugging"""
    debug_utils = AIDebugUtils(supabase_client)
    
    logger.info("🚀 Running Quick AI Test...")
    
    # Run essential tests only
    api_test = await debug_utils._test_api_connectivity()
    
    if api_test['passed'] and supabase_client:
        controller_test = await debug_utils._test_ai_strategic_controller()
        rss_test = await debug_utils._test_rss_discovery()
        
        return {
            'quick_test_status': 'PASS' if all([api_test['passed'], controller_test['passed'], rss_test['passed']]) else 'FAIL',
            'api_test': api_test,
            'controller_test': controller_test,
            'rss_test': rss_test
        }
    
    return {
        'quick_test_status': 'FAIL',
        'api_test': api_test,
        'error': 'API test failed or no Supabase client'
    }

async def test_single_component(component_name: str, supabase_client=None) -> Dict:
    """Test single AI component"""
    debug_utils = AIDebugUtils(supabase_client)
    
    test_map = {
        'controller': debug_utils._test_ai_strategic_controller,
        'evaluator': debug_utils._test_ai_evaluator,
        'rss': debug_utils._test_rss_discovery,
        'database': debug_utils._test_database_integration,
        'api': debug_utils._test_api_connectivity
    }
    
    if component_name in test_map:
        logger.info(f"🧪 Testing {component_name} component...")
        return await test_map[component_name]()
    else:
        return {
            'passed': False,
            'error': f'Unknown component: {component_name}',
            'available_components': list(test_map.keys())
        }