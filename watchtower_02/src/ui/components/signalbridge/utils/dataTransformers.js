// ==========================================
// DATA TRANSFORMERS
// Utility functions for transforming and formatting data
// ==========================================

/**
 * Transform raw signal data for display
 * @param {Array} signals - Raw signals from database
 * @returns {Array} Transformed signals with computed properties
 */
export const transformSignalsForDisplay = (signals = []) => {
  return signals.map(signal => ({
    ...signal,
    // Normalize confidence score
    confidence: signal.match_score || signal.confidence_score || 0,
    
    // Format timestamp
    formattedTime: signal.observed_at ? formatTimestamp(signal.observed_at) : 'Unknown',
    
    // Determine status color
    statusColor: getSignalStatusColor(signal.status),
    
    // Calculate relevance score (0-100)
    relevanceScore: Math.round((signal.match_score || signal.confidence_score || 0) * 100),
    
    // Extract domain from URL if available
    sourceDomain: signal.source_url ? extractDomain(signal.source_url) : 'Unknown',
    
    // Truncate content for preview
    preview: signal.content ? truncateText(signal.content, 150) : signal.title || 'No content',
    
    // Determine if signal is recent (within last 24 hours)
    isRecent: signal.observed_at ? isWithinHours(signal.observed_at, 24) : false
  }));
};

/**
 * Transform feed data for display
 * @param {Array} feeds - Raw feed data from database
 * @returns {Array} Transformed feeds with health indicators
 */
export const transformFeedsForDisplay = (feeds = []) => {
  return feeds.map(feed => ({
    ...feed,
    // Health status based on last check time
    healthStatus: getFeedHealthStatus(feed.last_checked),
    
    // Format last checked time
    lastCheckedFormatted: feed.last_checked ? formatTimestamp(feed.last_checked) : 'Never',
    
    // Extract domain for display
    domain: extractDomain(feed.source_url),
    
    // Determine status color
    statusColor: feed.active ? '#10b981' : '#6b7280',
    
    // Count recent signals from this feed
    recentSignalCount: 0, // This would be populated by parent component
    
    // Format feed type
    typeDisplay: formatFeedType(feed.source_type)
  }));
};

/**
 * Transform dashboard stats for display
 * @param {Object} rawStats - Raw stats from API/database
 * @returns {Object} Formatted stats with computed values
 */
export const transformDashboardStats = (rawStats = {}) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return {
    totalIndicators: rawStats.totalIndicators || 0,
    activeFeeds: rawStats.activeFeeds || 0,
    signalsToday: rawStats.signalsToday || 0,
    avgConfidence: rawStats.avgConfidence || 0,
    
    // Computed display values
    confidencePercent: Math.round((rawStats.avgConfidence || 0) * 100),
    feedHealthPercent: rawStats.activeFeeds > 0 ? 
      Math.round((rawStats.healthyFeeds || rawStats.activeFeeds) / rawStats.activeFeeds * 100) : 0,
    
    // Status indicators
    systemHealth: getSystemHealthStatus(rawStats),
    lastUpdated: rawStats.lastUpdated ? formatTimestamp(rawStats.lastUpdated) : 'Never'
  };
};

/**
 * Group signals by time period
 * @param {Array} signals - Array of signal objects
 * @param {string} period - 'hour', 'day', 'week', 'month'
 * @returns {Object} Grouped signals by time period
 */
export const groupSignalsByTimePeriod = (signals = [], period = 'day') => {
  const groups = {};
  
  signals.forEach(signal => {
    if (!signal.observed_at) return;
    
    const key = getTimePeriodKey(signal.observed_at, period);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(signal);
  });
  
  return groups;
};

/**
 * Calculate signal trends over time
 * @param {Array} signals - Array of signal objects
 * @param {number} days - Number of days to analyze
 * @returns {Object} Trend analysis
 */
export const calculateSignalTrends = (signals = [], days = 7) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  
  const recentSignals = signals.filter(signal => 
    signal.observed_at && new Date(signal.observed_at) >= startDate
  );
  
  const dailyGroups = groupSignalsByTimePeriod(recentSignals, 'day');
  const dailyCounts = Object.keys(dailyGroups).map(key => ({
    date: key,
    count: dailyGroups[key].length,
    avgConfidence: dailyGroups[key].reduce((sum, s) => sum + (s.confidence || 0), 0) / dailyGroups[key].length
  }));
  
  // Calculate trend direction
  const firstHalf = dailyCounts.slice(0, Math.floor(days / 2));
  const secondHalf = dailyCounts.slice(Math.floor(days / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.count, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.count, 0) / secondHalf.length;
  
  return {
    dailyCounts,
    trendDirection: secondHalfAvg > firstHalfAvg ? 'up' : secondHalfAvg < firstHalfAvg ? 'down' : 'stable',
    trendPercentage: firstHalfAvg > 0 ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) : 0,
    totalSignals: recentSignals.length,
    avgConfidence: recentSignals.reduce((sum, s) => sum + (s.confidence || 0), 0) / recentSignals.length
  };
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Format timestamp for display
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted time string
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

/**
 * Extract domain from URL
 * @param {string} url - Full URL
 * @returns {string} Domain name
 */
export const extractDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'Invalid URL';
  }
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Check if timestamp is within specified hours
 * @param {string} timestamp - ISO timestamp
 * @param {number} hours - Number of hours
 * @returns {boolean} True if within time period
 */
export const isWithinHours = (timestamp, hours) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  return diffMs <= (hours * 60 * 60 * 1000);
};

/**
 * Get signal status color
 * @param {string} status - Signal status
 * @returns {string} Color hex code
 */
export const getSignalStatusColor = (status) => {
  const statusColors = {
    'relevant': '#10b981',
    'false_positive': '#ef4444',
    'pending': '#f59e0b',
    'reviewed': '#6366f1',
    'archived': '#6b7280'
  };
  return statusColors[status] || '#6b7280';
};

/**
 * Get feed health status
 * @param {string} lastChecked - Last check timestamp
 * @returns {string} Health status
 */
export const getFeedHealthStatus = (lastChecked) => {
  if (!lastChecked) return 'unknown';
  
  const hoursSinceCheck = (new Date() - new Date(lastChecked)) / (1000 * 60 * 60);
  
  if (hoursSinceCheck < 2) return 'healthy';
  if (hoursSinceCheck < 24) return 'warning';
  return 'error';
};

/**
 * Format feed type for display
 * @param {string} type - Feed type
 * @returns {string} Formatted type
 */
export const formatFeedType = (type) => {
  const typeMap = {
    'RSS': 'RSS Feed',
    'API': 'API Source',
    'WEB': 'Web Scraper',
    'NEWS': 'News Feed'
  };
  return typeMap[type] || type || 'Unknown';
};

/**
 * Get system health status
 * @param {Object} stats - System stats
 * @returns {string} Health status
 */
export const getSystemHealthStatus = (stats) => {
  const { activeFeeds = 0, totalIndicators = 0, avgConfidence = 0 } = stats;
  
  if (activeFeeds === 0) return 'critical';
  if (totalIndicators === 0) return 'warning';
  if (avgConfidence < 0.3) return 'warning';
  
  return 'healthy';
};

/**
 * Get time period key for grouping
 * @param {string} timestamp - ISO timestamp
 * @param {string} period - Time period
 * @returns {string} Period key
 */
export const getTimePeriodKey = (timestamp, period) => {
  const date = new Date(timestamp);
  
  switch (period) {
    case 'hour':
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}`;
    case 'day':
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    case 'week':
      const week = Math.floor(date.getDate() / 7);
      return `${date.getFullYear()}-${date.getMonth() + 1}-W${week}`;
    case 'month':
      return `${date.getFullYear()}-${date.getMonth() + 1}`;
    default:
      return timestamp;
  }
};

/**
 * Calculate percentage change between two values
 * @param {number} oldValue - Previous value
 * @param {number} newValue - Current value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
};

/**
 * Get confidence level label
 * @param {number} confidence - Confidence score (0-1)
 * @returns {string} Confidence label
 */
export const getConfidenceLabel = (confidence) => {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  if (confidence >= 0.3) return 'Low';
  return 'Very Low';
};

/**
 * Format number with appropriate suffix (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

/**
 * Sort signals by relevance and recency
 * @param {Array} signals - Array of signals
 * @returns {Array} Sorted signals
 */
export const sortSignalsByRelevance = (signals = []) => {
  return signals.sort((a, b) => {
    // First sort by confidence/relevance
    const confidenceA = a.match_score || a.confidence_score || 0;
    const confidenceB = b.match_score || b.confidence_score || 0;
    
    if (confidenceB !== confidenceA) {
      return confidenceB - confidenceA;
    }
    
    // Then by recency
    const dateA = new Date(a.observed_at || 0);
    const dateB = new Date(b.observed_at || 0);
    return dateB - dateA;
  });
};