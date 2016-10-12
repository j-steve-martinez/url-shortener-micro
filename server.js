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

// url = 'mongodb://localhost:27017/clementinejs'

if (url !== undefined) {
  mongo.connect(url, function (err, db) {

    // console.log(collectionNames);
     if (err) {
        throw new Error('Database failed to connect!');
     } else {
        // console.log('connected to db: ' + url);
        console.log('connected to db...');
     }

     app.use('/public', express.static(process.cwd() + '/public'));
     app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
     app.get("/:id", function(req, res) {
              var id = req.params.id;
              var shorty = db.collection('shorty');
              shorty.find({'urlid' : +id}).toArray( function(err, docs){
                if (err) {
                  console.log('FIND ERROR');
                  throw err;
                }
                console.log('FINDING: ' + id);
                console.log(docs);
                var shortURL = docs[0].url;
                console.log('id url: ' + shortURL);
                res.redirect(shortURL);
                res.end();
              });
            db.close();
     });

     routes(app, db);

     app.listen(port, function () {
        console.log('Node.js listening on port 3000...');
     });

  });
}
