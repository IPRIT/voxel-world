var path = require('path');

module.exports = {

  /** Main frontend pm2 config */
  "apps" : [{
    "name"        : "game-client",
    "script"      : "node_modules/nuxt/bin/nuxt-start",
    "watch"       : false,
    "env"         : {
      "NODE_ENV"  : "development",
      "PORT"      : 8091,
      "HOST"      : "0.0.0.0"
    },
    "env_production" : {
      "NODE_ENV"  : "production",
      "PORT"      : 8081,
      "HOST"      : "0.0.0.0"
    },
    "instances"   : 1,
    "exec_mode"   : "cluster",
    "log_file":   "/var/log/pm2/combined.log",
    "out_file":   "/var/log/pm2/out.log",
    "error_file": "/var/log/pm2/err.log"
  },

  /** Frontend SPA pm2 config */
  {
    "name"        : "spa",
    "script"      : "node_modules/nuxt/bin/nuxt-start",
    "args"        : "--spa",
    "watch"       : false,
    "env"         : {
      "NODE_ENV"  : "development",
      "PORT"      : 8093,
      "HOST"      : "0.0.0.0"
    },
    "env_production" : {
      "NODE_ENV"  : "production",
      "PORT"      : 8083,
      "HOST"      : "0.0.0.0"
    },
    "instances"   : 1,
    "exec_mode"   : "cluster"
  }]
};
