import { Redis } from '@upstash/redis';
import logger from '../../utils/logger.js';

let redisClient;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  logger.info('Redis store client initialized');
} else {
  logger.warn('Using in-memory mock Redis store for development');
  const mockStore = new Map();
  redisClient = {
    get: async (key) => {
      logger.debug(`[Mock Redis] GET ${key}`);
      return mockStore.get(key);
    },
    set: async (key, value, options) => {
      logger.debug(`[Mock Redis] SET ${key}`, { options });
      mockStore.set(key, value);
      return 'OK';
    },
    del: async (...keys) => {
      logger.debug(`[Mock Redis] DEL ${keys.join(', ')}`);
      let count = 0;
      for (const key of keys) {
        if (mockStore.delete(key)) count++;
      }
      return count;
    },
    lpush: async (key, ...elements) => {
      logger.debug(`[Mock Redis] LPUSH ${key}`, elements);
      if (!mockStore.has(key)) mockStore.set(key, []);
      const list = mockStore.get(key);
      list.unshift(...elements);
      return list.length;
    },
    rpush: async (key, ...elements) => {
      logger.debug(`[Mock Redis] RPUSH ${key}`, elements);
      if (!mockStore.has(key)) mockStore.set(key, []);
      const list = mockStore.get(key);
      list.push(...elements);
      return list.length;
    },
    lpop: async (key, count = 1) => {
      logger.debug(`[Mock Redis] LPOP ${key} ${count}`);
      if (!mockStore.has(key)) return null;
      const list = mockStore.get(key);
      if (list.length === 0) return null;
      if (count === 1) return list.shift();
      return list.splice(0, Math.min(count, list.length));
    },
    rpop: async (key, count = 1) => {
      logger.debug(`[Mock Redis] RPOP ${key} ${count}`);
      if (!mockStore.has(key)) return null;
      const list = mockStore.get(key);
      if (list.length === 0) return null;
      if (count === 1) return list.pop();
      return list.splice(-Math.min(count, list.length));
    },
    lrange: async (key, start, end) => {
      logger.debug(`[Mock Redis] LRANGE ${key} ${start} ${end}`);
      if (!mockStore.has(key)) return [];
      const list = mockStore.get(key);
      const actualStart = start < 0 ? list.length + start : start;
      const actualEnd = end < 0 ? list.length + end : end;
      return list.slice(actualStart, actualEnd + 1);
    },
    llen: async (key) => {
      logger.debug(`[Mock Redis] LLEN ${key}`);
      if (!mockStore.has(key)) return 0;
      const list = mockStore.get(key);
      return list.length;
    },
    expire: async (key, seconds) => {
      logger.debug(`[Mock Redis] EXPIRE ${key} ${seconds}`);
      if (!mockStore.has(key)) return 0;
      return 1;
    },
    exists: async (...keys) => {
      logger.debug(`[Mock Redis] EXISTS ${keys.join(', ')}`);
      let count = 0;
      for (const key of keys) {
        if (mockStore.has(key)) count++;
      }
      return count;
    },
    scan: async (cursor, options) => {
      logger.debug(`[Mock Redis] SCAN ${cursor}`, options);
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
        cursor: 0,
        keys: matchedKeys,
      };
    },
  };
}

const kvStore = {
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value;
    } catch (error) {
      logger.error(`Error getting key ${key}:`, error);
      throw error;
    }
  },
  async set(key, value, options = {}) {
    try {
      const result = await redisClient.set(key, value, options);
      return result;
    } catch (error) {
      logger.error(`Error setting key ${key}:`, error);
      throw error;
    }
  },
  async delete(...keys) {
    try {
      const count = await redisClient.del(...keys);
      return count;
    } catch (error) {
      logger.error(`Error deleting keys ${keys.join(', ')}:`, error);
      throw error;
    }
  },
  async pushToListStart(key, ...elements) {
    try {
      const length = await redisClient.lpush(key, ...elements);
      return length;
    } catch (error) {
      logger.error(`Error pushing to list start ${key}:`, error);
      throw error;
    }
  },
  async pushToListEnd(key, ...elements) {
    try {
      const length = await redisClient.rpush(key, ...elements);
      return length;
    } catch (error) {
      logger.error(`Error pushing to list end ${key}:`, error);
      throw error;
    }
  },
  async popFromListStart(key, count = 1) {
    try {
      const elements = await redisClient.lpop(key, count);
      return elements;
    } catch (error) {
      logger.error(`Error popping from list start ${key}:`, error);
      throw error;
    }
  },
  async popFromListEnd(key, count = 1) {
    try {
      const elements = await redisClient.rpop(key, count);
      return elements;
    } catch (error) {
      logger.error(`Error popping from list end ${key}:`, error);
      throw error;
    }
  },
  async getListRange(key, start, end) {
    try {
      const elements = await redisClient.lrange(key, start, end);
      return elements;
    } catch (error) {
      logger.error(`Error getting list range ${key}:`, error);
      throw error;
    }
  },
  async getListLength(key) {
    try {
      const length = await redisClient.llen(key);
      return length;
    } catch (error) {
      logger.error(`Error getting list length ${key}:`, error);
      throw error;
    }
  },
  async setExpiration(key, seconds) {
    try {
      const result = await redisClient.expire(key, seconds);
      return result;
    } catch (error) {
      logger.error(`Error setting expiration for key ${key}:`, error);
      throw error;
    }
  },
  async exists(...keys) {
    try {
      const count = await redisClient.exists(...keys);
      return count;
    } catch (error) {
      logger.error(`Error checking existence of keys ${keys.join(', ')}:`, error);
      throw error;
    }
  },
  async scanKeys(pattern = '*') {
    try {
      const results = [];
      let cursor = 0;
      do {
        const scan = await redisClient.scan(cursor, { match: pattern });
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