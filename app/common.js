var fs = require('fs')
  , path = require('path')
  , moment = require('moment')
  , yaml = require('js-yaml')

// constants
exports.Constant = {
  Active: 1
, Inactive: -1
, petKeyInit: 'p-'
, CustKeyInit: 'c-'
};

exports.intersection = function(a, b){
  var result = [];
  while (a.length > 0 && b.length > 0){
     if      (a[0] < b[0]){ a.shift() }
     else if (a[0] > b[0]){ b.shift() }
     else { /* a and b are equal */
       result.push(a.shift());
       b.shift();
     }
  }
  return result;
}

// load config (log is not ready)
try {
  let config_yaml = 'config.yaml'
    , etcPath = path.join('/', 'etc', config_yaml)
    , relPath = path.join('.', config_yaml)
    , yf =  process.env.TS_CONFIG || (fs.existsSync(etcPath)? etcPath: null) || relPath;
  console.log('common', 'init', 'read config from ' + yf);
  exports.Config = yaml.safeLoad(fs.readFileSync(yf, 'utf8'));
} catch (e) {
  console.log('common', 'init', 'read config error: ', e);
  process.exit(1);
}
