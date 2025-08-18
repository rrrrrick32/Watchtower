# signalbridge/api/__init__.py
"""
SignalBridge API Module

Provides REST API endpoints for:
- Signal creation and retrieval
- RSS feed monitoring status
- Indicator management
- Dashboard statistics
- Monitoring control

This API serves as the bridge between the SignalBridge RSS monitoring
backend and the Watchtower frontend dashboard.
"""

from .database import db_manager, SupabaseManager
from .routes import app

__all__ = ['db_manager', 'SupabaseManager', 'app']