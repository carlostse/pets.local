var fs = require('fs')
  , path = require('path')
  , yaml = require('js-yaml')
  , moment = require('moment')
  , winston = require('winston')
  , cfg = require('./common').Config;

// load config
var folder = null, file = null, logfile = null;
try {
  let _log = cfg.log;
  folder = _log['folder'];
  file = _log['file'] + '.log';
  logfile = path.join(folder, file);
} catch (e) {
  console.log('log', 'init', 'read config error: ', e);
  process.exit(1);
}

var formatter = function(options){
  var level = options.level.toUpperCase();
  while (level.length < 5) level = ' ' + level;
  return moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + level + ' ' +
    (options.message ? options.message : '');
};

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      formatter: formatter,
      level: 'debug'
    }),
    new (winston.transports.File)({
      formatter: formatter,
      json: false,
      level: 'info',
      filename: logfile
    })
  ]
});

var log = function(level, args){
  var m = args[0] + ' - [' + args[1] + '] ' + args[2];
  logger.log(level, m, args.slice(3));
};

exports.debug = function(){
  log('debug', Array.prototype.slice.call(arguments));
};

exports.warn = function(){
  log('warn', Array.prototype.slice.call(arguments));
};

exports.info = function(){
  log('info', Array.prototype.slice.call(arguments));
};

exports.error = function(){
  log('error', Array.prototype.slice.call(arguments));
};

// make the log folder
if (!fs.existsSync(folder)) fs.mkdirSync(folder);

// log ready
module.exports.debug('log', 'init', 'log file: ' + logfile);
