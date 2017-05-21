var fs = require('fs')
  , yaml = require('js-yaml')
  , redis = require('redis')
  , log = require('./log')
  , cfg = require('./common').Config;

// load config
var host = null, port = null, enable = 1;
try {
  let _redis = cfg.redis;
  host = _redis['ip'];
  port = _redis['port'];
  enable = _redis['enable'];
} catch (e) {
  log.error('cache', 'init', 'read config error: ', e);
  process.exit(1);
}

// redis client
log.debug('cache', 'init', 'connect redis: ' + host + ':' + port);
var client = enable? redis.createClient(port, host): null;
if (client){
  client.on('connect', function() {
    log.info('cache', 'init', 'redis connected');
  });
} else {
  log.info('cache', 'init', 'redis disabled');
}

exports.RedisClient = client;
