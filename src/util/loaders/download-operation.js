const delay = delayMs => new Promise(resolve => setTimeout( resolve, delayMs ));

export class DownloadOperation {

  /**
   * @abstract
   * @param {string} resourceUrl
   * @return {Promise<*>}
   * @private
   */
  async download (resourceUrl) {
    return Promise.resolve();
  }

  /**
   * @param {string} resourceUrl
   * @param {number} attemptsNumber
   * @returns {Promise<*>}
   */
  async load (resourceUrl, attemptsNumber = 15) {
    return this.tryLoad( resourceUrl, attemptsNumber );
  }

  /**
   * @param {string} resourceUrl
   * @param {number} attemptsNumber
   * @returns {Promise<*>}
   * @private
   */
  tryLoad (resourceUrl, attemptsNumber) {
    return this.tryUntil(attemptNumber => {
      return this.download( resourceUrl );
    }, attemptsNumber);
  }

  /**
   * @param {function} asyncAction
   * @param {number} maxAttemptsNumber
   * @returns {Promise<*>}
   * @private
   */
  async tryUntil (asyncAction, maxAttemptsNumber) {
    let attempts = 0;

    while (attempts < maxAttemptsNumber) {
      try {
        const result = await asyncAction( attempts ); // split by variable to prevent unhandled errors
        return result;
      } catch (e) {
        attempts++;
        await delay( 125 * Math.min(10, attempts) ** 2 + 500 );
      }
    }
  }
}
