import { DownloadOperation } from "./download-operation";

export class ResourceLoader extends DownloadOperation {

  /**
   * Load & run script by resource url
   *
   * @param {string} resourceUrl
   * @return {Promise<any>}
   * @private
   */
  download (resourceUrl) {
    return new Promise((resolve, reject) => {
      const resourceLoader = document.createElement( 'script' );
      resourceLoader.type = 'text/javascript';

      if (resourceLoader.readyState) {
        // IE
        resourceLoader.onreadystatechange = () => {
          if (resourceLoader.readyState === 'loaded' || resourceLoader.readyState === 'complete') {
            resourceLoader.onreadystatechange = null;
            resolve( resourceLoader );
          }
        };
      } else {
        // other browsers
        resourceLoader.onload = () => resolve( resourceLoader );
        resourceLoader.onerror = () => reject( resourceLoader );
      }

      resourceLoader.src = resourceUrl;

      document.getElementsByTagName( 'head' )[0].appendChild( resourceLoader );
    });
  }
}
