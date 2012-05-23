var express = require('express');
var configurations = module.exports;
var app = express.createServer();

var redis = require('redis');
var client = redis.createClient();

var assert = require('assert');
var settings = require('../settings')(app, configurations, express);

var marketplace = require('../lib/marketplace');
var fakeRecommendations = require('../lib/fakedata').apps;

client.select(settings.app.set('newnewtab-redis-test'));


describe('Recommendations', function() {

  describe('from redis', function() {

    beforeEach(function(){
      // add fake data to the cache
      marketplace.cacheRecommendations(client, fakeRecommendations, function(){});
    });

    it('should contain Business', function() {
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