var express = require('express')
  , cache = require('../app/cache')
  , log = require('../app/log')
  , common = require('../app/common');

var router = express.Router()
  , RedisClient = cache.RedisClient
  , cst = common.Constant;

var findCustomerById = function(id, callback) {
  RedisClient.get(cst.CustKeyInit + id, (err, reply) => {
    if (callback) callback(reply);
  });
};

var populateAge = function(age, com, callback) {
  var length = age? age.length: 0
    , keys = [];
  if (length < 1) {
    callback();
    return;
  }
  age.forEach(v => {
    keys.push(cst.petKeyInit + 'age-' + v);
  });
  RedisClient.mget(keys, (err, r) => {
    r.forEach(k => {
      if (k) com.age = com.age.concat(JSON.parse(k));
    });
    callback();
  });
};

var populateSpecies = function(species, com, callback) {
  var length = species? species.length: 0
    , keys = [];
  if (length < 1) {
    callback();
    return;
  }
  species.forEach(v => {
    keys.push(cst.petKeyInit + 'species-' + v);
  });
  RedisClient.mget(keys, (err, r) => {
    r.forEach(k => {
      if (k) com.species = com.species.concat(JSON.parse(k));
    });
    callback();
  });
};

var populateBreed = function(breed, com, callback) {
  var length = breed? breed.length: 0
    , keys = [];
  if (length < 1) {
    callback();
    return;
  }
  breed.forEach(v => {
    keys.push(cst.petKeyInit + 'breed-' + v);
  });
  RedisClient.mget(keys, (err, r) => {
    r.forEach(k => {
      if (k) com.breed = com.breed.concat(JSON.parse(k));
    });
    callback();
  });
};

var findIntersection = function(com) {
  var inter = com.age;
  if (inter && inter.length > 0) {
    if (com.species && com.species.length > 0)
      inter = common.intersection(inter, com.species);
    // else inter remains com.age
  } else {
    inter = com.species;
  }

  if (com.breed && com.breed.length > 0)
    inter = common.intersection(inter, com.breed);
  // else inter remains

  return inter;
};

router.get('/:id/matches', (req, res, next) => {
  var id = req.params.id;
  findCustomerById(id, reply => {
    if (!reply){
      res.json({ error: 1, reason: 'customer not found' });
      return;
    }

    log.debug('customers', 'GET', 'load ' + id + ' from redis');
    var customer = JSON.parse(reply)
      , p = customer.preference
      , age = p.age.split('-')
      , species = p.species
      , breed = p.breed;

    // parse age
    var ageFr = parseInt(age[0])
      , ageTo = parseInt(age[1])
      , age = [];
    for (let i = ageFr; i < ageTo; i++) {
      age.push(i);
    }

    // find all combinations
    var com = {
      age: [],
      species: [],
      breed: []
    }
    , i = 0
    , total = age.length;

    // find matched ages
    populateAge(age, com, () => {
      populateSpecies(species, com, () => {
        populateBreed(breed, com, () => {
          // find intersection
          var petIds = findIntersection(com);
          // get the pets by ID
          RedisClient.mget(petIds, (err, pets) => {
            var arr = [];
            (pets || []).forEach(pet => {
              arr.push(JSON.parse(pet));
            });
            res.json(arr);
          });
        });
      });
    });
  });
});

router.get('/:id', (req, res, next) => {
  var id = req.params.id;
  findCustomerById(id, reply => {
    if (reply){
      log.debug('customers', 'GET', 'load ' + id + ' from redis');
      res.send(reply);
    } else {
      res.json({ error: 1, reason: 'customer not found' });
    }
  });
});

router.post('/', (req, res, next) => {
  var customer = req.body
  if (!customer || !customer.id){
    res.json({ error: 1, reason: 'invalid customer' });
    return;
  }

  // save customer by ID
  var key = cst.CustKeyInit + customer.id;
  RedisClient.set(key, JSON.stringify(customer), (err, reply) => {
    log.debug('customers', 'POST', 'save ' + key + ' to redis');
  });

  // no need to wait for callback from redis
  res.json({ error: 0 });
});

module.exports = router;
