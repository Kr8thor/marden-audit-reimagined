import { Redis } from '@upstash/redis';
import config from '../../config/index.mjs';
import logger from '../../utils/logger.mjs';

const { upstash } = config;

const redis = new Redis({
  url: upstash.url,
  token: upstash.token,
});

const kvStore = {
  /**
   * Get a value by key
   * @param {string} key - Key to get
   * @returns {Promise<any>} Value or null
   */
  async get(key) {
    try {
      const value = await redis.get(key);
      logger.debug(`Got key ${key}`, { key, value });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Error getting key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Set a value by key
   * @param {string} key - Key to set
   * @param {any} value - Value to set
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttl) {
    try {
      const stringifiedValue = JSON.stringify(value);
      if (ttl) {
        await redis.set(key, stringifiedValue, { ex: ttl });
      } else {
        await redis.set(key, stringifiedValue);
      }
      logger.debug(`Set key ${key}`, { key, value });
    } catch (error) {
      logger.error(`Error setting key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Delete a key
   * @param {string} key - Key to delete
   * @returns {Promise<void>}
   */
  async delete(key) {
    try {
      await redis.del(key);
      logger.debug(`Deleted key ${key}`, { key });
    } catch (error) {
      logger.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Scan keys matching a pattern
   * @param {string} pattern - Key pattern
   * @returns {Promise<Array<string>>} Array of matching keys
   */
  async scanKeys(pattern) {
    try {
      const keys = [];
      let cursor = 0;

      do {
        const result = await redis.scan(cursor, { match: pattern });
        cursor = result.cursor;
        keys.push(...result.keys);
      } while (cursor !== 0);

      logger.debug(`Scanned keys matching ${pattern}`, { pattern, keys });
      return keys;
    } catch (error) {
      logger.error(`Error scanning keys matching ${pattern}:`, error);
      throw error;
    }
  },

  /**
   * Push an element to the end of a list
   * @param {string} key - List key
   * @param {string} element - Element to push
   * @returns {Promise<void>}
   */
  async pushToListEnd(key, element) {
    try {
      await redis.rpush(key, element);
      logger.debug(`Pushed element to list end ${key}`, { key, element });
    } catch (error) {
      logger.error(`Error pushing to list end ${key}:`, error);
      throw error;
    }
  },

  /**
   * Pop an element from the start of a list
   * @param {string} key - List key
   * @returns {Promise<string|null>} Popped element or null
   */
  async popFromListStart(key) {
    try {
      const element = await redis.lpop(key);
      logger.debug(`Popped element from list start ${key}`, { key, element });
      return element;
    } catch (error) {
      logger.error(`Error popping from list start ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get the length of a list
   * @param {string} key - List key
   * @returns {Promise<number>} List length
   */
  async getListLength(key) {
    try {
      const length = await redis.llen(key);
      logger.debug(`Got list length ${key}`, { key, length });
      return length;
    } catch (error) {
      logger.error(`Error getting list length ${key}:`, error);
      throw error;
    }
  },

  /**
  * Get a range of elements from a list.
  * @param {string} key - List key
  * @param {number} start - Start index (inclusive)
  * @param {number} stop - Stop index (inclusive)
  * @returns {Promise<string[]>} List of elements
  */
  async getListRange(key, start, stop) {
    try {
        const elements = await redis.lrange(key, start, stop);
        logger.debug(`Got list range ${key} [${start}, ${stop}]`, { key, start, stop, elements });
        return elements;
    } catch (error) {
        logger.error(`Error getting list range ${key} [${start}, ${stop}]:`, error);
        throw error;
    }
  }
};

export default kvStore;