import { QueueManager } from "./queue/queue-manager";
import { QueueEvents } from "./queue/queue-events";

export class MatchMaking {

  /**
   * @type {QueueManager}
   * @private
   */
  _queue = null;

  /**
   * @type {MatchMaking}
   * @private
   */
  static _instance = null;

  /**
   * @return {MatchMaking}
   */
  static getInstance () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new MatchMaking() );
  }

  /**
   * @param {Object} params
   * @return {Promise<Object>}
   */
  findServer (params = {}) {
    return this._joinQueue( params ).then(queue => {
      console.log('[MatchMaking] joined the queue', queue);
      return this._observeServer( queue );
    });
  }

  /**
   * @return {QueueManager}
   */
  get queue () {
    return this._queue;
  }

  /**
   * @param params
   * @return {Promise<QueueManager>}
   * @private
   */
  _joinQueue (params) {
    const queue = new QueueManager();
    this._queue = queue;
    return queue.joinQueue( params )
      .then(_ => queue);
  }

  /**
   * @param {QueueManager} queue
   * @return {Promise<Object>}
   * @private
   */
  _observeServer (queue) {
    return new Promise(resolve => {
      queue.on( QueueEvents.SERVER_FOUND, resolve );
    });
  }
}
