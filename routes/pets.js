var express = require('express')
  , cache = require('../app/cache')
  , log = require('../app/log')
  , common = require('../app/common');

var router = express.Router()
  , RedisClient = cache.RedisClient
  , cst = common.Constant;

var findPetById = function(id, callback){
  RedisClient.get(cst.petKeyInit + id, function(err, reply){
    if (callback) callback(reply);
  });
};

router.get('/:id/matches', function(req, res, next) {
  res.json({ error: 1, reason: 'TODO' });
});

router.get('/:id', function(req, res, next) {
  var id = req.params.id;
  findPetById(id, function(reply){
    if (reply){
      log.debug('pets', 'GET', 'load ' + id + ' from redis');
      res.send(reply);
    } else {
      res.json({ error: 1, reason: 'pet not found' });
    }
  });
});

router.post('/', function(req, res, next) {
  var pet = req.body;
  if (!pet){
    res.json({ error: 1, reason: 'invalid pet' });
    return;
  }

  if (!pet.id || !pet.age || !pet.species || (pet.species == 'dog' && !pet.breed)) {
    res.json({ error: 2, reason: 'missing field' });
    return;
  }

  // save the pet by ID
  var key = cst.petKeyInit + pet.id;
  RedisClient.set(key, JSON.stringify(pet), function(err, reply) {
    log.debug('pets', 'POST', 'save ' + key + ' to redis');
  });

  // save the pet by preferences
  var breed = pet.species == 'dog'? pet.breed: ''
    , keys = [
      cst.petKeyInit + 'age-' + pet.age,
      cst.petKeyInit + 'species-' + pet.species
    ];

  if (breed.length > 0)
    keys.push(cst.petKeyInit + 'breed-' + breed);

  keys.forEach(function(k) {
    RedisClient.get(k, function(err, reply) {
      var arr = reply? JSON.parse(reply): [];
      arr.push(key);
      RedisClient.set(k, JSON.stringify(arr));
    });
  });

  // no need to wait for callback from redis
  res.json({ error: 0 });
});

module.exports = router;
