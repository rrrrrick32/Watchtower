// ==========================================
// VALIDATORS
// Validation functions for forms and data
// ==========================================

/**
 * Validate RSS feed URL
 * @param {string} url - URL to validate
 * @returns {Object} Validation result with valid boolean and error message
 */
export const validateRSSFeedUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  // Basic URL format validation
  try {
    const urlObj = new URL(trimmedUrl);
    
    // Check for valid protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    
    // Check for valid hostname
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return { valid: false, error: 'URL must have a valid hostname' };
    }
    
    // Check for common RSS/feed file extensions or paths
    const pathname = urlObj.pathname.toLowerCase();
    const validFeedPaths = [
      '/rss', '/feed', '/feeds', '/atom', '/rss.xml', '/feed.xml', 
      '/atom.xml', '/index.xml', '/news.xml', '/blog.xml'
    ];
    
    const hasValidExtension = pathname.endsWith('.xml') || 
                            pathname.endsWith('.rss') || 
                            pathname.endsWith('.atom');
    
    const hasValidPath = validFeedPaths.some(path => pathname.includes(path));
    
    // Warn if URL doesn't look like a typical feed
    if (!hasValidExtension && !hasValidPath && !pathname.includes('feed') && !pathname.includes('rss')) {
      return { 
        valid: true, 
        warning: 'URL does not appear to be a typical RSS feed. Please verify the URL is correct.' 
      };
    }
    
    return { valid: true };
    
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validate feed name
 * @param {string} name - Feed name to validate
 * @returns {Object} Validation result
 */
export const validateFeedName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: true }; // Name is optional
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length > 100) {
    return { valid: false, error: 'Feed name must be 100 characters or less' };
  }
  
  if (trimmedName.length > 0 && trimmedName.length < 2) {
    return { valid: false, error: 'Feed name must be at least 2 characters long' };
  }
  
  // Check for potentially problematic characters
  const invalidChars = /[<>\"'&]/;
  if (invalidChars.test(trimmedName)) {
    return { valid: false, error: 'Feed name contains invalid characters' };
  }
  
  return { valid: true };
};

/**
 * Validate signal review input
 * @param {Object} reviewData - Review data to validate
 * @returns {Object} Validation result
 */
export const validateSignalReview = (reviewData) => {
  const { signalId, relevant, notes = '' } = reviewData || {};
  
  if (!signalId) {
    return { valid: false, error: 'Signal ID is required' };
  }
  
  if (typeof relevant !== 'boolean') {
    return { valid: false, error: 'Relevance decision is required' };
  }
  
  if (notes && notes.length > 500) {
    return { valid: false, error: 'Notes must be 500 characters or less' };
  }
  
  return { valid: true };
};

/**
 * Validate API configuration
 * @param {Object} config - API configuration
 * @returns {Object} Validation result
 */
export const validateAPIConfig = (config) => {
  const { apiBase, timeout = 30000 } = config || {};
  
  if (!apiBase) {
    return { valid: false, error: 'API base URL is required' };
  }
  
  try {
    const url = new URL(apiBase);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'API URL must use HTTP or HTTPS' };
    }
  } catch (error) {
    return { valid: false, error: 'Invalid API URL format' };
  }
  
  if (timeout < 1000 || timeout > 300000) {
    return { valid: false, error: 'Timeout must be between 1 and 300 seconds' };
  }
  
  return { valid: true };
};

/**
 * Validate indicator configuration
 * @param {Object} indicator - Indicator data
 * @returns {Object} Validation result
 */
export const validateIndicator = (indicator) => {
  const { name, description, keywords = [], threshold = 0.5 } = indicator || {};
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { valid: false, error: 'Indicator name is required' };
  }
  
  if (name.trim().length > 100) {
    return { valid: false, error: 'Indicator name must be 100 characters or less' };
  }
  
  if (description && description.length > 500) {
    return { valid: false, error: 'Description must be 500 characters or less' };
  }
  
  if (!Array.isArray(keywords)) {
    return { valid: false, error: 'Keywords must be an array' };
  }
  
  if (keywords.length === 0) {
    return { valid: false, error: 'At least one keyword is required' };
  }
  
  // Validate each keyword
  for (const keyword of keywords) {
    if (typeof keyword !== 'string' || keyword.trim().length === 0) {
      return { valid: false, error: 'All keywords must be non-empty strings' };
    }
    if (keyword.length > 50) {
      return { valid: false, error: 'Keywords must be 50 characters or less' };
    }
  }
  
  if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
    return { valid: false, error: 'Threshold must be a number between 0 and 1' };
  }
  
  return { valid: true };
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }
  
  return { valid: true };
};

/**
 * Validate time range selection
 * @param {Object} timeRange - Time range object
 * @returns {Object} Validation result
 */
export const validateTimeRange = (timeRange) => {
  const { startDate, endDate } = timeRange || {};
  
  if (!startDate || !endDate) {
    return { valid: false, error: 'Start date and end date are required' };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  if (start >= end) {
    return { valid: false, error: 'Start date must be before end date' };
  }
  
  if (end > now) {
    return { valid: false, error: 'End date cannot be in the future' };
  }
  
  // Check for reasonable range (not more than 1 year)
  const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  if (end - start > maxRange) {
    return { valid: false, error: 'Date range cannot exceed 1 year' };
  }
  
  return { valid: true };
};

/**
 * Validate search query
 * @param {string} query - Search query
 * @returns {Object} Validation result
 */
export const validateSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Search query is required' };
  }
  
  const trimmedQuery = query.trim();
  
  if (trimmedQuery.length === 0) {
    return { valid: false, error: 'Search query cannot be empty' };
  }
  
  if (trimmedQuery.length < 2) {
    return { valid: false, error: 'Search query must be at least 2 characters' };
  }
  
  if (trimmedQuery.length > 200) {
    return { valid: false, error: 'Search query must be 200 characters or less' };
  }
  
  // Check for SQL injection patterns (basic protection)
  const sqlInjectionPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i;
  if (sqlInjectionPatterns.test(trimmedQuery)) {
    return { valid: false, error: 'Invalid characters in search query' };
  }
  
  return { valid: true };
};

/**
 * Validate confidence threshold
 * @param {number} threshold - Confidence threshold (0-1)
 * @returns {Object} Validation result
 */
export const validateConfidenceThreshold = (threshold) => {
  if (typeof threshold !== 'number') {
    return { valid: false, error: 'Threshold must be a number' };
  }
  
  if (threshold < 0 || threshold > 1) {
    return { valid: false, error: 'Threshold must be between 0 and 1' };
  }
  
  return { valid: true };
};

/**
 * Validate batch operation
 * @param {Array} items - Items to validate
 * @param {Function} itemValidator - Validator function for individual items
 * @returns {Object} Validation result with details for each item
 */
export const validateBatch = (items, itemValidator) => {
  if (!Array.isArray(items)) {
    return { valid: false, error: 'Items must be an array' };
  }
  
  if (items.length === 0) {
    return { valid: false, error: 'At least one item is required' };
  }
  
  if (items.length > 100) {
    return { valid: false, error: 'Cannot process more than 100 items at once' };
  }
  
  const results = items.map((item, index) => ({
    index,
    item,
    validation: itemValidator(item)
  }));
  
  const invalidItems = results.filter(result => !result.validation.valid);
  
  if (invalidItems.length > 0) {
    return {
      valid: false,
      error: `${invalidItems.length} items failed validation`,
      details: invalidItems
    };
  }
  
  return { valid: true, results };
};

// ==========================================
// UTILITY VALIDATION FUNCTIONS
// ==========================================

/**
 * Check if string contains only alphanumeric characters and common symbols
 * @param {string} str - String to check
 * @returns {boolean} True if safe
 */
export const isSafeString = (str) => {
  const safePattern = /^[a-zA-Z0-9\s\-_.,!?()[\]{}:;"'@#$%&*+=<>\/\\|`~]*$/;
  return safePattern.test(str);
};

/**
 * Sanitize string for safe display
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate required fields in an object
 * @param {Object} obj - Object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
export const validateRequiredFields = (obj, requiredFields) => {
  const missing = requiredFields.filter(field => 
    !obj || obj[field] === undefined || obj[field] === null || obj[field] === ''
  );
  
  if (missing.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missing.join(', ')}` 
    };
  }
  
  return { valid: true };
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['text/plain', 'application/json', 'text/csv'],
    allowedExtensions = ['.txt', '.json', '.csv']
  } = options;
  
  if (!file) {
    return { valid: false, error: 'File is required' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }
  
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    return { valid: false, error: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}` };
  }
  
  return { valid: true };
};

/**
 * Validate numeric range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {Object} Validation result
 */
export const validateNumericRange = (value, min, max) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: 'Value must be a number' };
  }
  
  if (value < min) {
    return { valid: false, error: `Value must be at least ${min}` };
  }
  
  if (value > max) {
    return { valid: false, error: `Value must be no more than ${max}` };
  }
  
  return { valid: true };
};