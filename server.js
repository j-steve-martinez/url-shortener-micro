'use strict';

var express = require('express');
var mongo = require('mongodb').MongoClient;
var routes = require('./app/routes/index.js');
var app = express();
var test = require('assert');

// get the port and url from the environment
var port = process.env.PORT;
var url = process.env.SHORTY;

// if not set use 3000 as the default
if (port === undefined) {
  port = 3000;
}

// url = 'mongodb://localhost:27017/url-shorty'

if (url !== undefined) {
  mongo.connect(url, function (err, db) {
     if (err) {
        throw new Error('Database failed to connect!');
     } else {
        // console.log('connected to db: ' + url);
        console.log('connected to db...');
        // ******************* SEEDING ********************************
         // Check for collection and add a record if none exists
         var clickProjection = { 'urlid': "", url: "" };
         var dbObj = {'urlid' : 1, 'url' : 'http://www.mlb.com'};
         var shorty = db.collection('shorty');
         // shorty.drop()
         if (shorty) {
           console.log('shorty found');
           shorty.findOne({'urlid': 1}, clickProjection, function(err, result){
             if (err) {
               throw err;
             }
             if (result) {
               console.log('Default record found: ');
               console.log(result);
             } else {
               console.log('no data in shorty...');
               console.log('adding default record...');
               // add dummy record
               shorty.insert(dbObj, function(err, data){
                 if (err) {
                   throw err;
                 }
                 console.log('inserted data: ');
                 console.log(data);
               });
             }
           });
         }
         // ******************* END SEED ********************************
     }

     app.use('/public', express.static(process.cwd() + '/public'));
     app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
     app.get("/:id", function(req, res) {
              var id = req.params.id;
              // res.send('Get Id: ' + id);
              var shorty = db.collection('shorty');
              console.log('Searching mongodb...');
              shorty.find({'urlid' : +id}).toArray( function(err, docs){
                if (err) {
                  console.log('FIND ERROR');
                  throw err;
                }
                console.log('checking docs length');
                console.log(docs.length);
                if (docs.length <= 0) {
                  res.send('error: id ' + id + ' not found')
                } else {
                  console.log('FINDING: ' + id);
                  console.log(docs);
                  var shortURL = docs[0].url;
                  console.log('id url: ' + shortURL);
                  res.redirect(shortURL);
                }
                // res.end();
              });
            // db.close();
     });

     routes(app, db);

     app.listen(port, function () {
        console.log('Node.js listening on port 3000...');
     });

  });
}
