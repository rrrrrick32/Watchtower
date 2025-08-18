import React from 'react';
import { Plus, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const AddRSSFeedForm = ({
  showAddFeed,
  onClose,
  newFeedUrl,
  setNewFeedUrl,
  newFeedName,
  setNewFeedName,
  onSubmit,
  addingFeed,
  feedAddStatus,
  validateFeedUrl
}) => {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleUrlChange = (e) => {
    setNewFeedUrl(e.target.value);
  };

  const handleNameChange = (e) => {
    setNewFeedName(e.target.value);
  };

  const urlValidation = newFeedUrl ? validateFeedUrl(newFeedUrl) : { valid: true };

  if (!showAddFeed) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#2a2a2a',
      border: '1px solid #444',
      borderRadius: '8px',
      padding: '20px',
      minWidth: '400px',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: 0,
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          Add RSS Feed
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            padding: '4px'
          }}
          disabled={addingFeed}
        >
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Feed URL Input */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            color: '#cccccc',
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Feed URL *
          </label>
          <input
            type="url"
            value={newFeedUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/feed.xml"
            disabled={addingFeed}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#1a1a1a',
              border: `1px solid ${!urlValidation.valid ? '#ef4444' : '#444'}`,
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none'
            }}
            required
          />
          {!urlValidation.valid && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px',
              color: '#ef4444',
              fontSize: '12px'
            }}>
              <AlertCircle size={12} />
              {urlValidation.error}
            </div>
          )}
        </div>

        {/* Feed Name Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            color: '#cccccc',
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Feed Name (Optional)
          </label>
          <input
            type="text"
            value={newFeedName}
            onChange={handleNameChange}
            placeholder="Custom RSS Feed"
            disabled={addingFeed}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* Status Message */}
        {feedAddStatus && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '4px',
            marginBottom: '16px',
            backgroundColor: feedAddStatus.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            fontSize: '14px'
          }}>
            {feedAddStatus.type === 'success' ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {feedAddStatus.message}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={addingFeed}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#cccccc',
              cursor: addingFeed ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: addingFeed ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addingFeed || !newFeedUrl.trim() || !urlValidation.valid}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#10b981',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: (addingFeed || !newFeedUrl.trim() || !urlValidation.valid) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: (addingFeed || !newFeedUrl.trim() || !urlValidation.valid) ? 0.5 : 1
            }}
          >
            {addingFeed ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Feed
              </>
            )}
          </button>
        </div>
      </form>

      {/* Overlay for form */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: -1
        }}
        onClick={onClose}
      />
    </div>
  );
};

export default AddRSSFeedForm;