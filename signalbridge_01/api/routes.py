# signalbridge/api/routes.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import asyncio

from .database import db_manager

logger = logging.getLogger(__name__)

# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class SignalCreate(BaseModel):
    content: str
    indicator_id: Optional[int] = None
    source_id: Optional[int] = None
    relevance_score: float = 0.0
    detected_at: Optional[datetime] = None
    session_id: Optional[str] = None
    status: str = "detected"

class SourceCreate(BaseModel):
    name: str
    url: str
    type: str = "RSS"
    status: str = "active"

class MonitoringStatus(BaseModel):
    is_active: bool
    feed_count: int
    started_at: Optional[datetime] = None

class DashboardStats(BaseModel):
    active_indicators: int
    total_indicators: int
    active_feeds: int
    signals_today: int
    signals_total: int
    monitoring_active: bool

# =============================================================================
# FASTAPI APP SETUP
# =============================================================================

app = FastAPI(
    title="SignalBridge API",
    description="API for AI-powered business intelligence signal monitoring",
    version="1.0.0"
)

# Enable CORS for Watchtower frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# SIGNAL ENDPOINTS
# =============================================================================

@app.post("/api/signals")
async def create_signal(signal: SignalCreate):
    """Create a new signal"""
    try:
        signal_data = {
            'content': signal.content,
            'indicator_id': signal.indicator_id,
            'source_id': signal.source_id,
            'relevance_score': signal.relevance_score,
            'detected_at': signal.detected_at or datetime.utcnow(),
            'session_id': signal.session_id,
            'status': signal.status
        }
        
        success = db_manager.create_signal(signal_data)
        
        if success:
            logger.info(f"📡 Signal created: {signal.content[:50]}...")
            return {"status": "success", "message": "Signal created successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to create signal")
            
    except Exception as e:
        logger.error(f"❌ Error creating signal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/signals")
async def get_recent_signals(hours: int = 24):
    """Get recent signals"""
    try:
        signals = db_manager.get_recent_signals(hours=hours)
        
        return {
            "status": "success",
            "signals": signals,
            "count": len(signals)
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting signals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/signals/today")
async def get_signals_today():
    """Get count of signals detected today"""
    try:
        count = db_manager.get_signals_today()
        
        return {
            "status": "success",
            "signals_today": count
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting today's signals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# SOURCE/FEED ENDPOINTS
# =============================================================================

@app.post("/api/sources")
async def create_source(source: SourceCreate):
    """Create or update a signal source"""
    try:
        source_data = {
            'name': source.name,
            'url': source.url,
            'type': source.type
        }
        
        success = db_manager.create_or_update_source(source_data)
        
        if success:
            logger.info(f"📡 Source updated: {source.name}")
            return {"status": "success", "message": "Source created/updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to create/update source")
            
    except Exception as e:
        logger.error(f"❌ Error creating/updating source: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sources")
async def get_sources():
    """Get all active sources"""
    try:
        sources = db_manager.get_active_sources()
        
        return {
            "status": "success",
            "sources": sources,
            "count": len(sources)
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting sources: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/feeds/status")
async def get_feed_status():
    """Get RSS feed monitoring status"""
    try:
        sources = db_manager.get_active_sources()
        source_count = db_manager.get_source_count()
        
        return {
            "status": "success",
            "active_feeds": source_count,
            "feeds": sources,
            "monitoring_active": source_count > 0
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting feed status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# INDICATOR ENDPOINTS
# =============================================================================

@app.get("/api/indicators/status")
async def get_indicator_status():
    """Get indicator counts and status"""
    try:
        indicators = db_manager.get_active_indicators()
        
        return {
            "status": "success",
            "pir_indicators": indicators['pir'],
            "total_indicators": indicators['pir']
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting indicator status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/indicators")
async def get_all_indicators():
    """Get all indicators for signal matching"""
    try:
        indicators = db_manager.get_all_indicators()
        
        return {
            "status": "success",
            "indicators": indicators,
            "count": len(indicators)
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting all indicators: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# MONITORING CONTROL ENDPOINTS
# =============================================================================

@app.post("/api/monitoring/start")
async def start_monitoring():
    """Start RSS monitoring"""
    try:
        # This endpoint will be called by Watchtower to start monitoring
        # The actual monitoring logic is handled by the RSS monitor
        
        db_manager.update_monitoring_status(is_active=True)
        
        return {
            "status": "success",
            "message": "Monitoring started successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Error starting monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/monitoring/stop")
async def stop_monitoring():
    """Stop RSS monitoring"""
    try:
        db_manager.update_monitoring_status(is_active=False)
        
        return {
            "status": "success",
            "message": "Monitoring stopped successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Error stopping monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/monitoring/status")
async def get_monitoring_status():
    """Get current monitoring status"""
    try:
        source_count = db_manager.get_source_count()
        signals_today = db_manager.get_signals_today()
        indicators = db_manager.get_active_indicators()
        
        return {
            "status": "success",
            "monitoring_active": source_count > 0,
            "active_feeds": source_count,
            "signals_today": signals_today,
            "active_indicators": indicators['pir']
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting monitoring status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# DASHBOARD ENDPOINTS
# =============================================================================

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get comprehensive dashboard statistics for Watchtower"""
    try:
        # Get all stats in parallel-ish
        indicators = db_manager.get_active_indicators()
        source_count = db_manager.get_source_count()
        signals_today = db_manager.get_signals_today()
        recent_signals = db_manager.get_recent_signals(hours=24)
        
        total_indicators = indicators['pir']
        
        stats = {
            "status": "success",
            "dashboard": {
                "active_indicators": total_indicators,
                "pir_indicators": indicators['pir'],
                "active_feeds": source_count,
                "signals_today": signals_today,
                "signals_total": len(recent_signals),
                "monitoring_active": source_count > 0,
                "last_updated": datetime.utcnow().isoformat()
            }
        }
        
        logger.info(f"📊 Dashboard stats: {total_indicators} indicators, {source_count} feeds, {signals_today} signals today")
        
        return stats
        
    except Exception as e:
        logger.error(f"❌ Error getting dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# UTILITY ENDPOINTS
# =============================================================================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        db_health = db_manager.health_check()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": db_health
        }
        
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/health")
async def health_check_root():
    """Health check endpoint for Docker"""
    try:
        db_health = db_manager.health_check()

        return {
            "status": "healthy",
            "service": "signalbridge",
            "timestamp": datetime.utcnow().isoformat(),
            "database": db_health
        }
    
    except Exception as e:
        logger.error(f"Health Check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cleanup")
async def cleanup_old_data(days: int = 30):
    """Clean up old signals"""
    try:
        cleaned_count = db_manager.cleanup_old_signals(days=days)
        
        return {
            "status": "success",
            "message": f"Cleaned up {cleaned_count} old signals",
            "cleaned_count": cleaned_count
        }
        
    except Exception as e:
        logger.error(f"❌ Error during cleanup: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# ROOT ENDPOINT
# =============================================================================

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "SignalBridge API",
        "version": "1.0.0",
        "description": "AI-powered business intelligence signal monitoring",
        "status": "operational"
    }