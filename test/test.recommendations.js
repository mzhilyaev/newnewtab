var conf = require('nconf');
var fs = require('fs');
var path = require('path');
var redis = require('redis');
var client = redis.createClient();

var assert = require('assert');

var marketplace = require('../lib/marketplace');
var fakeRecommendations = require('../lib/fakedata').apps;

var current_env = process.env['DEV_ENV'] || 'development';
require('../lib/conf').loadDefaultConf(
    path.join(__dirname, './config-test.json'));

client.select(conf.get('redis:testDbId'));

describe('Recommendations', function() {

  describe('from redis', function() {

    beforeEach(function(){
      // clean database
      // this doesn't happen at the right time
      // TODO: find a way to make it happen before beforEach returns
      client.keys('recommendation:*', function(err, recommendations) {
        if (err) throw err;
        client.del(recommendations, function(err) {});
        if (err) throw err;
        // add fake data to the cache
        marketplace.cacheRecommendations(client, fakeRecommendations);
      });
    });

    it('should contain Business', function itShouldContainBusiness() {
      marketplace.getRecommendations(client, ['Business'], function(apps) {
        // Business apps do exist
        assert(apps['Business']);
        // There are 3 recommended Business apps
        assert(apps['Business'].length === 3);
        // name of the first Business app is the same as in
        // fakedata
        assert(apps['Business'][0].name === fakeRecommendations['Business'][0].name)
      });
    });
  });
});
