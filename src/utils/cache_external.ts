import * as r from 'redis';

import config from '@exmpl/config';
import logger from '@exmpl/utils/logger';


const redis: typeof r = config.redisUrl === 'redis-mock' ? require('redis-mock') : require('redis');


class Cache {
    private static _instance: Cache;

    private _client? = redis.createClient();

    private _initialConnection: boolean;
 
    private constructor(){
        this._initialConnection = true;
    }

    public static getInstance(): Cache {
        if (!Cache._instance) {
          Cache._instance = new Cache()
        }
        return Cache._instance
      }
      public async open(): Promise<void> {

        this._client = redis.createClient({url: config.redisUrl});
        const client = this._client!;
        await client.connect();

        client.on('connect', () => {
            logger.info('Redis: connected')
          })
          client.on('ready', () => {
            if (this._initialConnection) {
              this._initialConnection = false;
            }
            logger.info('Redis: ready')
          })
          client.on('reconnecting', () => {
            logger.info('Redis: reconnecting')
          })
          client.on('end', () => {
            logger.info('Redis: end')
          })
          client.on('disconnected', () => {
            logger.error('Redis: disconnected')
          })
          client.on('error', function(err) {
            logger.error(`Redis: error: ${err}`)
          })

      }
    
      public async close(): Promise<void> {
          await this._client!.quit();
      }
}

export default Cache.getInstance();