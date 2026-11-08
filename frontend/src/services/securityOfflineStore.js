/**
 * Campus Security Offline Synchronization Store
 * BPUT Hackathon 2026 - Problem Statement 07
 * 
 * Provides robust offline-first caching for gate pass scan operations.
 * When network connectivity fails or the device is offline:
 * - Scans are recorded locally as PROVISIONAL items with unique offlineSyncId
 * - Guard sees "Saved, will sync" status with active pending counter
 * - Scans are prevented from claiming confirmed authorization before server validates
 * - When online connectivity returns, auto-synchronizes queue to backend
 * - Backend enforces idempotency and authorization checks
 */

const STORAGE_KEY = 'apna_security_offline_queue_v1';
const LISTENERS = new Set();

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function notifyListeners(queue) {
  LISTENERS.forEach((cb) => {
    try {
      cb(queue);
    } catch (e) {
      console.error('[securityOfflineStore] listener error:', e);
    }
  });
  if (isBrowser()) {
    try {
      window.dispatchEvent(new CustomEvent('security_offline_queue_updated', { detail: { queue } }));
    } catch (_) {}
  }
}

export const securityOfflineStore = {
  /**
   * Check if client browser is currently online
   */
  isOnline() {
    if (!isBrowser() || typeof navigator === 'undefined') return true;
    return navigator.onLine !== false;
  },

  /**
   * Get all provisional scans currently queued in offline storage
   */
  getQueue() {
    if (!isBrowser()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('[securityOfflineStore] Failed to read queue:', err);
      return [];
    }
  },

  /**
   * Return number of movements awaiting server synchronization
   */
  getPendingCount() {
    return this.getQueue().length;
  },

  /**
   * Alias for getPendingCount
   */
  getQueueCount() {
    return this.getPendingCount();
  },

  /**
   * Save a provisional movement locally when network request fails
   * @param {Object} movement - Pass details, direction ('EXIT'|'ENTRY'), guard info, remarks
   * @returns {Object} Queued item with offlineSyncId and provisional status
   */
  enqueueMovement(movement) {
    const queue = this.getQueue();
    const offlineSyncId =
      movement.offlineSyncId ||
      `SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const provisionalItem = {
      ...movement,
      offlineSyncId,
      provisional: true,
      status: 'PROVISIONAL_PENDING_SYNC',
      queuedAt: new Date().toISOString(),
      displayStatus: 'Saved, will sync',
    };

    // Prevent duplicate syncId in queue
    const exists = queue.some((item) => item.offlineSyncId === offlineSyncId);
    if (!exists) {
      queue.push(provisionalItem);
      if (isBrowser()) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      }
      notifyListeners(queue);
    }

    return provisionalItem;
  },

  /**
   * Remove a successfully synced movement by its offlineSyncId
   */
  dequeueMovement(offlineSyncId) {
    let queue = this.getQueue();
    queue = queue.filter((item) => item.offlineSyncId !== offlineSyncId);
    if (isBrowser()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }
    notifyListeners(queue);
    return queue;
  },

  /**
   * Clear all queued offline movements
   */
  clearQueue() {
    if (isBrowser()) {
      localStorage.removeItem(STORAGE_KEY);
    }
    notifyListeners([]);
  },

  /**
   * Synchronize queued provisional movements with backend server
   * @param {Object} apiClient - Instance of api service containing syncSecurityOfflineQueue
   * @returns {Promise<Object>} Synchronization report
   */
  async syncQueue(apiClient) {
    const queue = this.getQueue();
    if (!queue || queue.length === 0) {
      return { success: true, syncedCount: 0, failedCount: 0, pending: 0 };
    }

    if (!this.isOnline()) {
      return {
        success: false,
        reason: 'DEVICE_OFFLINE',
        message: 'Device is offline. Movements remain saved locally.',
        pending: queue.length,
      };
    }

    try {
      const response = await apiClient.syncSecurityOfflineQueue({ movements: queue });

      if (response && response.success) {
        // Find which items succeeded and remove them from queue
        if (response.results && Array.isArray(response.results)) {
          const successIds = new Set(
            response.results.filter((r) => r.success).map((r) => r.syncId)
          );
          const remaining = queue.filter((item) => !successIds.has(item.offlineSyncId));
          if (isBrowser()) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
          }
          notifyListeners(remaining);
        } else {
          // If server reported bulk success without detailed array, clear all
          this.clearQueue();
        }

        return {
          success: true,
          syncedCount: response.syncedCount || 0,
          failedCount: response.failedCount || 0,
          pending: this.getPendingCount(),
          results: response.results || [],
        };
      } else {
        return {
          success: false,
          message: response?.message || 'Server returned non-success response',
          pending: queue.length,
        };
      }
    } catch (err) {
      console.warn('[securityOfflineStore] Sync network error:', err);
      return {
        success: false,
        error: err.message || 'Network error during synchronization',
        pending: queue.length,
      };
    }
  },

  /**
   * Subscribe to offline queue changes
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    LISTENERS.add(callback);
    callback(this.getQueue());
    return () => {
      LISTENERS.delete(callback);
    };
  },

  /**
   * Set up automatic synchronization listeners on window 'online' event
   * and periodic retry every 30 seconds when pending items exist.
   * @param {Object} apiClient
   * @param {Function} [onSyncCallback]
   * @returns {Function} Cleanup function
   */
  initAutoSync(apiClient, onSyncCallback) {
    if (!isBrowser()) return () => {};

    const handleOnline = async () => {
      const pending = this.getPendingCount();
      if (pending > 0) {
        console.log(`[securityOfflineStore] Network restored. Auto-syncing ${pending} provisional movements...`);
        const report = await this.syncQueue(apiClient);
        if (onSyncCallback) onSyncCallback(report);
      }
    };

    window.addEventListener('online', handleOnline);

    const intervalId = setInterval(async () => {
      if (this.isOnline() && this.getPendingCount() > 0) {
        const report = await this.syncQueue(apiClient);
        if (onSyncCallback) onSyncCallback(report);
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(intervalId);
    };
  },
};

export default securityOfflineStore;
