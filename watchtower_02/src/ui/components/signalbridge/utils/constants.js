// ==========================================
// CONSTANTS
// Application-wide constants and configuration
// ==========================================

// ==========================================
// API CONFIGURATION
// ==========================================
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export const API_ENDPOINTS = {
  DASHBOARD_STATS: '/dashboard/stats',
  INDICATORS: '/indicators',
  SIGNALS: '/signals',
  FEEDS: '/feeds',
  MONITORING: {
    START: '/monitoring/start',
    STOP: '/monitoring/stop',
    STATUS: '/monitoring/status'
  },
  RSS: {
    DISCOVER: '/rss/discover',
    VALIDATE: '/rss/validate'
  }
};

// ==========================================
// POLLING INTERVALS
// ==========================================
export const POLLING_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  SIGNALS: 60000, // 1 minute
  FEEDS: 120000, // 2 minutes
  API_STATUS: 15000 // 15 seconds
};

// ==========================================
// UI CONSTANTS
// ==========================================
export const UI_CONSTANTS = {
  TOOLTIP_DELAY: 500,
  NOTIFICATION_DURATION: 3000,
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  MAX_RETRY_ATTEMPTS: 3
};

export const COLORS = {
  // Status colors
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  
  // Signal status colors
  SIGNAL_RELEVANT: '#10b981',
  SIGNAL_FALSE_POSITIVE: '#ef4444',
  SIGNAL_PENDING: '#f59e0b',
  SIGNAL_REVIEWED: '#6366f1',
  SIGNAL_ARCHIVED: '#6b7280',
  
  // Feed health colors
  FEED_HEALTHY: '#10b981',
  FEED_WARNING: '#f59e0b',
  FEED_ERROR: '#ef4444',
  FEED_UNKNOWN: '#6b7280',
  
  // Background colors
  BACKGROUND_PRIMARY: '#1e1e1e',
  BACKGROUND_SECONDARY: '#2a2a2a',
  BACKGROUND_TERTIARY: '#1a1a1a',
  
  // Text colors
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: '#cccccc',
  TEXT_MUTED: '#888888',
  
  // Border colors
  BORDER_PRIMARY: '#444444',
  BORDER_SECONDARY: '#333333'
};

// ==========================================
// SIGNAL CONSTANTS
// ==========================================
export const SIGNAL_STATUS = {
  PENDING: 'pending',
  RELEVANT: 'relevant',
  FALSE_POSITIVE: 'false_positive',
  REVIEWED: 'reviewed',
  ARCHIVED: 'archived'
};

export const SIGNAL_STATUS_LABELS = {
  [SIGNAL_STATUS.PENDING]: 'Pending Review',
  [SIGNAL_STATUS.RELEVANT]: 'Relevant',
  [SIGNAL_STATUS.FALSE_POSITIVE]: 'False Positive',
  [SIGNAL_STATUS.REVIEWED]: 'Reviewed',
  [SIGNAL_STATUS.ARCHIVED]: 'Archived'
};

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
  LOW: 0.3
};

export const CONFIDENCE_LABELS = {
  HIGH: 'High Confidence',
  MEDIUM: 'Medium Confidence',
  LOW: 'Low Confidence'
};

// ==========================================
// FEED CONSTANTS
// ==========================================
export const FEED_TYPES = {
  RSS: 'RSS',
  ATOM: 'ATOM',
  API: 'API',
  WEB: 'WEB',
  NEWS: 'NEWS'
};

export const FEED_TYPE_LABELS = {
  [FEED_TYPES.RSS]: 'RSS Feed',
  [FEED_TYPES.ATOM]: 'Atom Feed',
  [FEED_TYPES.API]: 'API Source',
  [FEED_TYPES.WEB]: 'Web Scraper',
  [FEED_TYPES.NEWS]: 'News Feed'
};

export const FEED_HEALTH_STATUS = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  ERROR: 'error',
  UNKNOWN: 'unknown'
};

export const FEED_HEALTH_LABELS = {
  [FEED_HEALTH_STATUS.HEALTHY]: 'Healthy',
  [FEED_HEALTH_STATUS.WARNING]: 'Warning',
  [FEED_HEALTH_STATUS.ERROR]: 'Error',
  [FEED_HEALTH_STATUS.UNKNOWN]: 'Unknown'
};

// ==========================================
// VALIDATION CONSTANTS
// ==========================================
export const VALIDATION_LIMITS = {
  FEED_NAME_MAX_LENGTH: 100,
  FEED_NAME_MIN_LENGTH: 2,
  INDICATOR_NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  KEYWORD_MAX_LENGTH: 50,
  SEARCH_QUERY_MAX_LENGTH: 200,
  SEARCH_QUERY_MIN_LENGTH: 2,
  NOTES_MAX_LENGTH: 500,
  BATCH_SIZE_MAX: 100
};

export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.,!?()[\]{}:;"'@#$%&*+=<>\/\\|`~]*$/,
  SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i
};

// ==========================================
// RSS FEED CONSTANTS
// ==========================================
export const RSS_PATTERNS = {
  VALID_PROTOCOLS: ['http:', 'https:'],
  FEED_EXTENSIONS: ['.xml', '.rss', '.atom'],
  FEED_PATHS: [
    '/rss', '/feed', '/feeds', '/atom', '/rss.xml', '/feed.xml',
    '/atom.xml', '/index.xml', '/news.xml', '/blog.xml'
  ]
};

// ==========================================
// ERROR MESSAGES
// ==========================================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  API_UNAVAILABLE: 'SignalBridge API is unavailable. Please try again later.',
  INVALID_RESPONSE: 'Received invalid response from server.',
  PERMISSION_DENIED: 'Permission denied. Please check your access rights.',
  RATE_LIMITED: 'Too many requests. Please wait before trying again.',
  
  // Form validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_EMAIL: 'Please enter a valid email address',
  FIELD_TOO_LONG: 'This field is too long',
  FIELD_TOO_SHORT: 'This field is too short',
  
  // Feed errors
  FEED_ALREADY_EXISTS: 'This feed URL has already been added',
  FEED_INVALID: 'Unable to validate RSS feed at this URL',
  FEED_NOT_FOUND: 'RSS feed not found at the specified URL',
  
  // Signal errors
  SIGNAL_NOT_FOUND: 'Signal not found',
  SIGNAL_ALREADY_REVIEWED: 'Signal has already been reviewed',
  
  // System errors
  DATABASE_ERROR: 'Database connection error',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred'
};

// ==========================================
// SUCCESS MESSAGES
// ==========================================
export const SUCCESS_MESSAGES = {
  FEED_ADDED: 'RSS feed added successfully',
  FEED_UPDATED: 'RSS feed updated successfully',
  FEED_DELETED: 'RSS feed deleted successfully',
  SIGNAL_REVIEWED: 'Signal reviewed successfully',
  MONITORING_STARTED: 'Monitoring started successfully',
  MONITORING_STOPPED: 'Monitoring stopped successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  DATA_REFRESHED: 'Data refreshed successfully'
};

// ==========================================
// TIME CONSTANTS
// ==========================================
export const TIME_PERIODS = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month'
};

export const TIME_RANGES = {
  LAST_HOUR: { hours: 1 },
  LAST_6_HOURS: { hours: 6 },
  LAST_24_HOURS: { hours: 24 },
  LAST_7_DAYS: { days: 7 },
  LAST_30_DAYS: { days: 30 }
};

// ==========================================
// SYSTEM HEALTH CONSTANTS
// ==========================================
export const SYSTEM_HEALTH = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  CRITICAL: 'critical',
  UNKNOWN: 'unknown'
};

export const SYSTEM_HEALTH_LABELS = {
  [SYSTEM_HEALTH.HEALTHY]: 'System Healthy',
  [SYSTEM_HEALTH.WARNING]: 'System Warning',
  [SYSTEM_HEALTH.CRITICAL]: 'System Critical',
  [SYSTEM_HEALTH.UNKNOWN]: 'System Unknown'
};

// ==========================================
// COMPONENT DEFAULTS
// ==========================================
export const COMPONENT_DEFAULTS = {
  SIGNAL_LIST_PAGE_SIZE: 25,
  FEED_LIST_PAGE_SIZE: 20,
  CHART_ANIMATION_DURATION: 750,
  TOOLTIP_OFFSET: 10,
  CARD_HOVER_DELAY: 200,
  NOTIFICATION_AUTO_DISMISS: true
};

// ==========================================
// EXPORT ALL AS DEFAULT
// ==========================================
export default {
  API_CONFIG,
  API_ENDPOINTS,
  POLLING_INTERVALS,
  UI_CONSTANTS,
  COLORS,
  SIGNAL_STATUS,
  SIGNAL_STATUS_LABELS,
  CONFIDENCE_THRESHOLDS,
  CONFIDENCE_LABELS,
  FEED_TYPES,
  FEED_TYPE_LABELS,
  FEED_HEALTH_STATUS,
  FEED_HEALTH_LABELS,
  VALIDATION_LIMITS,
  VALIDATION_PATTERNS,
  RSS_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TIME_PERIODS,
  TIME_RANGES,
  SYSTEM_HEALTH,
  SYSTEM_HEALTH_LABELS,
  COMPONENT_DEFAULTS
};