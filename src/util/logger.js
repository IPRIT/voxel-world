/**
 * @param {string} ns
 */
export function consoleWrap (ns = 'global') {
  const themes = {
    log: {
      primaryPanel: ['#ff5644', '#db00af'],
      secondaryPanel: ['#424b5c', '#001333'],
      borders: ['#ff270f', '#333a47']
    },
    error: {
      primaryPanel: ['#ff270f', '#ff5644'],
      secondaryPanel: ['#FBD91A', '#ff3d8d'],
      borders: ['#dd260f', '#cb4438']
    },
    warn: {
      primaryPanel: ['#FBD91A', '#e8c61a'],
      secondaryPanel: ['#424b5c', '#001333'],
      borders: ['#ffd91b', '#333a47']
    },
    info: {
      primaryPanel: ['#00bcd4', '#00deff'],
      secondaryPanel: ['#424b5c', '#001333'],
      borders: ['#00e0ff', '#333a47']
    }
  };

  /**
   * @param {object} colorTheme
   * @param {string} subNs
   * @param {*} args
   */
  function printMessage (colorTheme, subNs, ...args) {
    if (typeof window === 'undefined') {
      return console.log(subNs, ...args);
    }

    console.log(
      `%c${ns}%c${subNs}%c`,

      `background: linear-gradient(to right, ${colorTheme.primaryPanel[ 0 ]} 0%, ${colorTheme.primaryPanel[ 1 ]} 100%); ` +
      `border: 1px solid ${colorTheme.borders[ 0 ]}; border-right: 0; padding: 1px 7px; ` +
      `border-radius: 3px 0 0 3px; color: #fff`,

      `background: linear-gradient(to right, ${colorTheme.secondaryPanel[ 0 ]} 0%, ${colorTheme.secondaryPanel[ 1 ]} 100%); ` +
      `border: 1px solid ${colorTheme.borders[ 1 ]}; border-left: 0; padding: 1px 7px; ` +
      `border-radius: 0 3px 3px 0; color: #fff`,

      'background: transparent; padding: 2px;',
      ...args
    );
  }

  /**
   * @param {string} subNs
   * @param {string} message
   * @param {*} args
   */
  function log (subNs, message = '', ...args) {
    const colorTheme = themes[ 'log' ];
    printMessage(colorTheme, subNs, message, ...args);
  }

  /**
   * @param {string} subNs
   * @param {string} message
   * @param {*} args
   */
  function error (subNs, message = '', ...args) {
    const colorTheme = themes[ 'error' ];
    printMessage(colorTheme, subNs, message, ...args);
  }

  /**
   * @param {string} subNs
   * @param {string} message
   * @param {*} args
   */
  function warn (subNs, message = '', ...args) {
    const colorTheme = themes[ 'warn' ];
    printMessage(colorTheme, subNs, message, ...args);
  }

  /**
   * @param {string} subNs
   * @param {string} message
   * @param {*} args
   */
  function info (subNs, message = '', ...args) {
    const colorTheme = themes[ 'info' ];
    printMessage(colorTheme, subNs, message, ...args);
  }

  return {
    log, error,
    warn, info
  };
}
