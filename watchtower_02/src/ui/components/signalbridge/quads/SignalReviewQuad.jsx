import React from 'react';
import { Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import QuadCard from '../shared/QuadCard';

const SignalReviewQuad = ({
  signalsData,
  markSignal,
  apiStatus
}) => {
  
  // Helper function to get the actual signal content
  const getSignalContent = (signal) => {
    // Try multiple possible fields for the actual article content
    return signal.article_content || 
           signal.content || 
           signal.signal_text || 
           signal.raw_signal_text || 
           signal.description ||
           'No content available';
  };

  // Helper function to get the signal headline/title
  const getSignalHeadline = (signal) => {
    // Priority order for getting the actual article headline
    // 1. Try article-specific title fields first
    if (signal.article_title && signal.article_title.trim()) {
      return signal.article_title;
    }
    
    if (signal.title && signal.title.trim()) {
      return signal.title;
    }
    
    if (signal.source_title && signal.source_title.trim()) {
      return signal.source_title;
    }
    
    // 2. If no direct title, try to extract from article content (not AI reasoning)
    const content = signal.article_content || signal.content;
    if (content && content.length > 50 && !content.includes('ai_reasoning')) {
      return content.substring(0, 50) + '...';
    }
    
    // 3. Fallback to signal text only if it's not AI reasoning
    const signalText = signal.signal_text || signal.raw_signal_text;
    if (signalText && !signalText.includes('ai_reasoning') && signalText.length > 50) {
      return signalText.substring(0, 50) + '...';
    }
    
    return 'Signal detected';
  };

  // Helper function to get AI reasoning separately
  const getAIReasoning = (signal) => {
    // Look for AI reasoning in various possible fields
    if (signal.ai_reasoning) {
      return signal.ai_reasoning;
    }
    
    // Check if signal_text contains AI reasoning
    if (signal.signal_text && signal.signal_text.includes('ai_reasoning')) {
      return signal.signal_text;
    }
    
    // Check if there's a reasoning field in the raw data
    if (signal.reasoning) {
      return signal.reasoning;
    }
    
    return null;
  };

  // Helper function to get confidence score
  const getConfidenceScore = (signal) => {
    return signal.match_score || 
           signal.confidence_score || 
           signal.confidence_level || 
           signal.relevance_score ||
           0;
  };

  // Helper function to get formatted time
  const getFormattedTime = (signal) => {
    const date = signal.observed_at || 
                 signal.created_at || 
                 signal.updated_at ||
                 signal.published_at ||
                 signal.article_date;
    
    if (!date) return 'Unknown time';
    
    try {
      return new Date(date).toLocaleTimeString();
    } catch (error) {
      return 'Invalid time';
    }
  };

  // Helper function to get source information
  const getSourceInfo = (signal) => {
    return signal.source_name || 
           signal.source || 
           signal.publisher ||
           'Unknown source';
  };

  // Helper function to safely handle button clicks
  const handleViewSource = (signal) => {
    const url = signal.source_url || 
                signal.url || 
                signal.article_url ||
                signal.link;
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      console.warn('No source URL available for signal:', signal.id);
    }
  };

  const handleMarkRelevant = (signal) => {
    if (markSignal && typeof markSignal === 'function') {
      markSignal(signal.id, true);
    } else {
      console.warn('markSignal function not available');
    }
  };

  const handleMarkFalsePositive = (signal) => {
    if (markSignal && typeof markSignal === 'function') {
      markSignal(signal.id, false);
    } else {
      console.warn('markSignal function not available');
    }
  };

  const signals = signalsData?.signals || [];

  return (
    <QuadCard 
      title="Signal Review Interface"
      apiConnected={apiStatus?.connected}
    >
      <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
        {signals.slice(0, 8).map((signal, index) => {
          const headline = getSignalHeadline(signal);
          const content = getSignalContent(signal);
          const aiReasoning = getAIReasoning(signal);
          const confidence = getConfidenceScore(signal);
          const time = getFormattedTime(signal);
          const source = getSourceInfo(signal);
          const hasSourceUrl = !!(signal.source_url || signal.url || signal.article_url || signal.link);

          return (
            <div
              key={signal.id || index}
              style={{
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: '#1e1e1e',
                border: '1px solid #3e3e42',
                borderRadius: '4px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                <div style={{ flex: 1 }}>
                  {/* Article Headline */}
                  <div style={{ 
                    color: 'white', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    marginBottom: '2px',
                    lineHeight: '1.3'
                  }}>
                    {headline}
                  </div>
                  
                  {/* Source, Confidence and Time */}
                  <div style={{ 
                    color: '#888888', 
                    fontSize: '10px', 
                    marginBottom: '4px' 
                  }}>
                    {source} • Confidence: {(confidence * 100).toFixed(1)}% • {time}
                  </div>
                  
                  {/* AI Reasoning - show if available and different from headline */}
                  {aiReasoning && aiReasoning !== headline && (
                    <div style={{ 
                      color: '#a3a3a3', 
                      fontSize: '10px', 
                      lineHeight: '1.3',
                      fontStyle: 'italic',
                      marginBottom: '2px'
                    }}>
                      AI: {aiReasoning.length > 60 ? aiReasoning.substring(0, 60) + '...' : aiReasoning}
                    </div>
                  )}
                  
                  {/* Article Content Preview - show if different from headline and AI reasoning */}
                  {content && content !== headline && content !== aiReasoning && (
                    <div style={{ 
                      color: '#cccccc', 
                      fontSize: '11px', 
                      lineHeight: '1.3' 
                    }}>
                      {content.length > 80 ? content.substring(0, 80) + '...' : content}
                    </div>
                  )}
                  
                  {/* Debug info in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div style={{ 
                      color: '#666', 
                      fontSize: '9px', 
                      marginTop: '2px',
                      fontFamily: 'monospace'
                    }}>
                      ID: {signal.id} | PIR: {signal.pir_id?.substring(0, 8) || 'Unknown'}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                  {/* View Source Button */}
                  <button
                    onClick={() => handleViewSource(signal)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #6b7280',
                      color: hasSourceUrl ? '#cccccc' : '#666',
                      borderRadius: '3px',
                      padding: '2px',
                      cursor: hasSourceUrl ? 'pointer' : 'not-allowed',
                      opacity: hasSourceUrl ? 1 : 0.5,
                      transition: 'all 0.2s ease'
                    }}
                    disabled={!hasSourceUrl}
                    title={hasSourceUrl ? "View source article" : "No source URL available"}
                    onMouseEnter={(e) => {
                      if (hasSourceUrl) {
                        e.target.style.backgroundColor = '#374151';
                        e.target.style.borderColor = '#9ca3af';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = '#6b7280';
                    }}
                  >
                    <Eye size={10} />
                  </button>
                  
                  {/* Mark as Relevant Button */}
                  <button
                    onClick={() => handleMarkRelevant(signal)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #10b981',
                      color: '#10b981',
                      borderRadius: '3px',
                      padding: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title="Mark as relevant signal"
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#10b981';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#10b981';
                    }}
                  >
                    <ThumbsUp size={10} />
                  </button>
                  
                  {/* Mark as False Positive Button */}
                  <button
                    onClick={() => handleMarkFalsePositive(signal)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #dc2626',
                      color: '#dc2626',
                      borderRadius: '3px',
                      padding: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title="Mark as false positive"
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc2626';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#dc2626';
                    }}
                  >
                    <ThumbsDown size={10} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Empty State */}
        {signals.length === 0 && (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#888888', 
            fontSize: '12px' 
          }}>
            No signals detected yet
          </div>
        )}
        
        {/* Show count if more signals available */}
        {signals.length > 8 && (
          <div style={{ 
            padding: '8px', 
            textAlign: 'center', 
            color: '#888888', 
            fontSize: '11px', 
            fontStyle: 'italic' 
          }}>
            Showing 8 of {signals.length} signals
          </div>
        )}
      </div>
    </QuadCard>
  );
};

export default SignalReviewQuad;