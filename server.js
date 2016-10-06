'use strict';

var express = require('express');
var mongo = require('mongodb').MongoClient;
var routes = require('./app/routes/index.js');
var app = express();

// get the port and url from the environment
var port = process.env.PORT;
var url = process.env.SHORTY;

// if not set use 3000 as the default
if (port === undefined) {
  port = 3000;
}

// 'mongodb://localhost:27017/clementinejs'

if (url !== undefined) {
  mongo.connect(url, function (err, db) {

     if (err) {
        throw new Error('Database failed to connect!');
     } else {
        console.log('connected to db: ' + url);
     }

     app.use('/public', express.static(process.cwd() + '/public'));
     app.use('/controllers', express.static(process.cwd() + '/app/controllers'));

     routes(app, db);

     app.listen(port, function () {
        console.log('Node.js listening on port 3000...');
     });

  });
}
