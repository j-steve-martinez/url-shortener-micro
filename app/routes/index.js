'use strict';

var ClickHandler = require(process.cwd() + '/app/controllers/clickHandler.server.js');

module.exports = function (app, db) {

   var clickHandler = new ClickHandler(db);
   var shorty = db.collection('shorty');

   app.route('/')
      .get(function (req, res) {
         console.log('getting index.html');
         res.sendFile(process.cwd() + '/public/index.html');
      });

  app.route('/t/*')
     .get(function (req, res) {
       console.log('getting shorty...');
       var proto = '';
       var start = req.url.indexOf('/', 1);
       var url = req.url.slice(start + 1);

       // create default return object
       var retObj = {};
       var dbObj = {'urlid' : "", 'url' : ''};

       // find the collection count and increment by 1
       var shorty = db.collection('shorty');
       shorty.count({ urlid: { $gt : 0 }}, function(err, count){
         if (err) {
           throw err;
         }
         count++;
         console.log('new count: ');
         console.log(count);
         // validate url or show error
         var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
         if (url.match(regex)) {
           // good url
           console.log('start url: ');
           console.log(req.headers.host);
           console.log('destination url: ' + url);
           retObj.url = url;
           console.log('isSecure');
           console.log(req.secure);
           req.secure ? proto = 'https://' : proto = 'http://';
           retObj.tiny = proto + req.headers.host + '/' + count;
           // insert the data into the db;
           dbObj.urlid = count;
           dbObj.url = url;
           shorty.insert(dbObj, function(err, data){
             if (err) {
               throw err;
             }
             console.log('inserted data: ');
             console.log(data);
           });
         } else {
           // bad url
           retObj.error = 'The url is not valid!';
         }
         // send the response
         res.send(retObj);
       });
     });

   app.route('/api/clicks')
      .get(clickHandler.getClicks)
      .post(clickHandler.addClick)
      .delete(clickHandler.resetClicks);
};
