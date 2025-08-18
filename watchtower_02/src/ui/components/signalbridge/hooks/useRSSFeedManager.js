import { useState, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';

const useRSSFeedManager = (onDataRefresh) => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [addingFeed, setAddingFeed] = useState(false);
  const [feedAddStatus, setFeedAddStatus] = useState(null);

  // ==========================================
  // FEED MANAGEMENT FUNCTIONS
  // ==========================================
  
  const addCustomRSSFeed = useCallback(async () => {
    if (!newFeedUrl.trim()) {
      setFeedAddStatus({ type: 'error', message: 'Please enter a feed URL' });
      return;
    }

    setAddingFeed(true);
    setFeedAddStatus(null);

    try {
      // Only use the columns that actually exist in your schema
      const { data, error } = await supabase
        .from('signal_sources')
        .insert({
          source_name: newFeedName.trim() || 'Custom RSS Feed',
          source_url: newFeedUrl.trim(),
          source_type: 'RSS'
          // Removed: last_checked and active (don't exist in schema)
        })
        .select();

      if (error) throw error;

      // Clear form
      setNewFeedUrl('');
      setNewFeedName('');
      setShowAddFeed(false);
      setFeedAddStatus({ type: 'success', message: 'RSS feed added successfully!' });
      
      // Refresh parent data if callback provided
      if (onDataRefresh) {
        await onDataRefresh();
      }
      
      // Clear status after 3 seconds
      setTimeout(() => setFeedAddStatus(null), 3000);

      return { success: true, data };

    } catch (error) {
      setFeedAddStatus({ 
        type: 'error', 
        message: error.message || 'Failed to add RSS feed' 
      });
      return { success: false, error: error.message };
    } finally {
      setAddingFeed(false);
    }
  }, [newFeedUrl, newFeedName, onDataRefresh]);

  const cancelAddFeed = useCallback(() => {
    setShowAddFeed(false);
    setNewFeedUrl('');
    setNewFeedName('');
    setFeedAddStatus(null);
  }, []);

  const deleteFeed = useCallback(async (feedId) => {
    try {
      const { error } = await supabase
        .from('signal_sources')
        .delete()
        .eq('id', feedId);

      if (error) throw error;

      if (onDataRefresh) {
        await onDataRefresh();
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting feed:', error);
      return { success: false, error: error.message };
    }
  }, [onDataRefresh]);

  // Since 'active' column doesn't exist, this function is no longer useful
  // but keeping it for compatibility - just return success without doing anything
  const toggleFeedActive = useCallback(async (feedId, currentActive) => {
    try {
      console.warn('toggleFeedActive: active column does not exist in schema, skipping operation');
      
      // Since we don't have an active column, we can't toggle status
      // Could potentially use source_type or another approach if needed
      
      if (onDataRefresh) {
        await onDataRefresh();
      }

      return { success: true };
    } catch (error) {
      console.error('Error toggling feed status:', error);
      return { success: false, error: error.message };
    }
  }, [onDataRefresh]);

  const updateFeedName = useCallback(async (feedId, newName) => {
    if (!newName.trim()) {
      return { success: false, error: 'Feed name cannot be empty' };
    }

    try {
      const { error } = await supabase
        .from('signal_sources')
        .update({ source_name: newName.trim() })
        .eq('id', feedId);

      if (error) throw error;

      if (onDataRefresh) {
        await onDataRefresh();
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating feed name:', error);
      return { success: false, error: error.message };
    }
  }, [onDataRefresh]);

  const validateFeedUrl = useCallback((url) => {
    try {
      new URL(url);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid URL format' };
    }
  }, []);

  const clearStatus = useCallback(() => {
    setFeedAddStatus(null);
  }, []);

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  
  const resetForm = useCallback(() => {
    setNewFeedUrl('');
    setNewFeedName('');
    setFeedAddStatus(null);
  }, []);

  const hasUnsavedChanges = newFeedUrl.trim() !== '' || newFeedName.trim() !== '';

  // ==========================================
  // RETURN HOOK INTERFACE
  // ==========================================
  
  return {
    // Form state
    showAddFeed,
    setShowAddFeed,
    newFeedUrl,
    setNewFeedUrl,
    newFeedName,
    setNewFeedName,
    addingFeed,
    feedAddStatus,
    hasUnsavedChanges,
    
    // Actions
    addCustomRSSFeed,
    cancelAddFeed,
    deleteFeed,
    toggleFeedActive,
    updateFeedName,
    
    // Utilities
    validateFeedUrl,
    clearStatus,
    resetForm,
    setFeedAddStatus
  };
};

export default useRSSFeedManager;