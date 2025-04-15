import { createClient } from '@vercel/kv';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';

// Initialize KV client
let kvClient;

try {
  kvClient = createClient({
    url: config.kv.url,
    token: config.kv.restApiToken,
  });
  
  logger.info('KV store client initialized');
} catch (error) {
  logger.error('Failed to initialize KV store client:', error);
  
  // Create a mock client for development if KV is not available
  if (config.server.env === 'development') {
    logger.warn('Using in-memory mock KV store for development');
    
    const mockStore = new Map();
    
    kvClient = {
      get: async (key) => {
        logger.debug(`[Mock KV] GET ${key}`);
        return mockStore.get(key);
      },
      set: async (key, value, options) => {
        logger.debug(`[Mock KV] SET ${key}`, { options });
        mockStore.set(key, value);
        return 'OK';
      },
      del: async (...keys) => {
        logger.debug(`[Mock KV] DEL ${keys.join(', ')}`);
        let count = 0;
        for (const key of keys) {
          if (mockStore.delete(key)) count++;
        }
        return count;
      },
      lpush: async (key, ...elements) => {
        logger.debug(`[Mock KV] LPUSH ${key}`, elements);
        if (!mockStore.has(key)) mockStore.set(key, []);
        const list = mockStore.get(key);
        list.unshift(...elements);
        return list.length;
      },
      rpush: async (key, ...elements) => {
        logger.debug(`[Mock KV] RPUSH ${key}`, elements);
        if (!mockStore.has(key)) mockStore.set(key, []);
        const list = mockStore.get(key);
        list.push(...elements);
        return list.length;
      },
      lpop: async (key, count = 1) => {
        logger.debug(`[Mock KV] LPOP ${key} ${count}`);
        if (!mockStore.has(key)) return null;
        const list = mockStore.get(key);
        if (list.length === 0) return null;
        if (count === 1) return list.shift();
        return list.splice(0, Math.min(count, list.length));
      },
      rpop: async (key, count = 1) => {
        logger.debug(`[Mock KV] RPOP ${key} ${count}`);
        if (!mockStore.has(key)) return null;
        const list = mockStore.get(key);
        if (list.length === 0) return null;
        if (count === 1) return list.pop();
        return list.splice(-Math.min(count, list.length));
      },
      lrange: async (key, start, end) => {
        logger.debug(`[Mock KV] LRANGE ${key} ${start} ${end}`);
        if (!mockStore.has(key)) return [];
        const list = mockStore.get(key);
        // Handle negative indices
        const actualStart = start < 0 ? list.length + start : start;
        const actualEnd = end < 0 ? list.length + end : end;
        return list.slice(actualStart, actualEnd + 1);
      },
      llen: async (key) => {
        logger.debug(`[Mock KV] LLEN ${key}`);
        if (!mockStore.has(key)) return 0;
        const list = mockStore.get(key);
        return list.length;
      },
      expire: async (key, seconds) => {
        logger.debug(`[Mock KV] EXPIRE ${key} ${seconds}`);
        if (!mockStore.has(key)) return 0;
        // We'll just pretend to set expiration in mock
        return 1;
      },
      exists: async (...keys) => {
        logger.debug(`[Mock KV] EXISTS ${keys.join(', ')}`);
        let count = 0;
        for (const key of keys) {
          if (mockStore.has(key)) count++;
        }
        return count;
      },
      scan: async (cursor, options) => {
        logger.debug(`[Mock KV] SCAN ${cursor}`, options);
        const pattern = options?.match || '*';
        const keys = Array.from(mockStore.keys());
        const matchedKeys = keys.filter(key => {
          if (pattern === '*') return true;
          const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
          return new RegExp(`^${regexPattern}$`).test(key);
        });
        return {
          cursor: 0, // Always complete in one pass for simplicity
          keys: matchedKeys,
        };
      },
    };
  }
}

/**
 * Storage service interface
 */
const kvStore = {
  /**
   * Get a value from the store
   * @param {string} key - The key to retrieve
   * @returns {Promise<any>} The stored value or null
   */
  async get(key) {
    try {
      const value = await kvClient.get(key);
      return value;
    } catch (error) {
      logger.error(`Error getting key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Set a value in the store
   * @param {string} key - The key to store
   * @param {any} value - The value to store
   * @param {Object} options - Optional configuration (expiration, etc.)
   * @returns {Promise<string>} Result of operation
   */
  async set(key, value, options = {}) {
    try {
      const result = await kvClient.set(key, value, options);
      return result;
    } catch (error) {
      logger.error(`Error setting key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Delete one or more keys from the store
   * @param {...string} keys - The keys to delete
   * @returns {Promise<number>} Number of keys deleted
   */
  async delete(...keys) {
    try {
      const count = await kvClient.del(...keys);
      return count;
    } catch (error) {
      logger.error(`Error deleting keys ${keys.join(', ')}:`, error);
      throw error;
    }
  },

  /**
   * Add elements to the start of a list
   * @param {string} key - The list key
   * @param {...any} elements - Elements to add
   * @returns {Promise<number>} The length of the list after operation
   */
  async pushToListStart(key, ...elements) {
    try {
      const length = await kvClient.lpush(key, ...elements);
      return length;
    } catch (error) {
      logger.error(`Error pushing to list start ${key}:`, error);
      throw error;
    }
  },

  /**
   * Add elements to the end of a list
   * @param {string} key - The list key
   * @param {...any} elements - Elements to add
   * @returns {Promise<number>} The length of the list after operation
   */
  async pushToListEnd(key, ...elements) {
    try {
      const length = await kvClient.rpush(key, ...elements);
      return length;
    } catch (error) {
      logger.error(`Error pushing to list end ${key}:`, error);
      throw error;
    }
  },

  /**
   * Remove and return the first element of a list
   * @param {string} key - The list key
   * @param {number} count - Number of elements to pop
   * @returns {Promise<any>} The popped element(s)
   */
  async popFromListStart(key, count = 1) {
    try {
      const elements = await kvClient.lpop(key, count);
      return elements;
    } catch (error) {
      logger.error(`Error popping from list start ${key}:`, error);
      throw error;
    }
  },

  /**
   * Remove and return the last element of a list
   * @param {string} key - The list key
   * @param {number} count - Number of elements to pop
   * @returns {Promise<any>} The popped element(s)
   */
  async popFromListEnd(key, count = 1) {
    try {
      const elements = await kvClient.rpop(key, count);
      return elements;
    } catch (error) {
      logger.error(`Error popping from list end ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get a range of elements from a list
   * @param {string} key - The list key
   * @param {number} start - Start index
   * @param {number} end - End index
   * @returns {Promise<Array>} Array of elements
   */
  async getListRange(key, start, end) {
    try {
      const elements = await kvClient.lrange(key, start, end);
      return elements;
    } catch (error) {
      logger.error(`Error getting list range ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get the length of a list
   * @param {string} key - The list key
   * @returns {Promise<number>} The length of the list
   */
  async getListLength(key) {
    try {
      const length = await kvClient.llen(key);
      return length;
    } catch (error) {
      logger.error(`Error getting list length ${key}:`, error);
      throw error;
    }
  },

  /**
   * Set an expiration time on a key
   * @param {string} key - The key to set expiration on
   * @param {number} seconds - Seconds until expiration
   * @returns {Promise<number>} 1 if successful, 0 otherwise
   */
  async setExpiration(key, seconds) {
    try {
      const result = await kvClient.expire(key, seconds);
      return result;
    } catch (error) {
      logger.error(`Error setting expiration for key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Check if keys exist
   * @param {...string} keys - Keys to check
   * @returns {Promise<number>} Number of existing keys
   */
  async exists(...keys) {
    try {
      const count = await kvClient.exists(...keys);
      return count;
    } catch (error) {
      logger.error(`Error checking existence of keys ${keys.join(', ')}:`, error);
      throw error;
    }
  },

  /**
   * Scan for keys matching a pattern
   * @param {string} pattern - Pattern to match
   * @returns {Promise<Array<string>>} Array of matching keys
   */
  async scanKeys(pattern = '*') {
    try {
      const results = [];
      let cursor = 0;
      
      do {
        const scan = await kvClient.scan(cursor, { match: pattern });
        cursor = scan.cursor;
        results.push(...scan.keys);
      } while (cursor !== 0);
      
      return results;
    } catch (error) {
      logger.error(`Error scanning keys with pattern ${pattern}:`, error);
      throw error;
    }
  },
};

export default kvStore;
