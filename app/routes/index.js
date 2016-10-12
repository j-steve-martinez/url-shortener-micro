'use strict';

var ClickHandler = require(process.cwd() + '/app/controllers/clickHandler.server.js');

module.exports = function (app, db) {

   var clickHandler = new ClickHandler(db);
   var shorty = db.collection('shorty');

   app.route('/')
      .get(function (req, res) {
         res.sendFile(process.cwd() + '/public/index.html');
      });

  app.route('/t/*')
     .get(function (req, res) {

       // create default return object
       var retObj = {'error': 'The url is not valid!'};
       // find the last _id and increment by 1

      // var isShorty = false;
      // console.log('checking for shorty collection: ');
      db.collections(function(err, col){
        col.forEach(function(item, index, arr){
          // console.log(item.s.name);
          if (item.s.name === 'shorty') {
            // isShort = true;
            console.log('shorty found.');
            console.log('finding id... ');
            // shorty.drop();

            shorty.count({ urlid: { $gt : 0 }}, function(err, count){
              if (err) {
                console.log('FIND ERROR');
                throw err;
              }
              var newId = count + 1;
              // console.log('last id: ' +  data._id);
              console.log(' new id: ' +  newId);
              // create a db object
              var dbObj = {'urlid' : newId, 'url' : ''}
             //  var isUrl = false;
              // parse the url
              var start = req.url.indexOf('/', 1);
             //  console.log(start);
              var url = req.url.slice(start + 1);
             //  console.log(url);
              // test the protocol
             //  var protocol = url[1];
              var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
              if (url.match(regex)) {
                // console.log(req.headers.referer);
                dbObj.url = url;
                var tinyUrl = req.headers.referer + newId;
                // console.log(tinyUrl);
                retObj = {'original_url': url, 'tiny_url': tinyUrl};
                // add url to database and get id

                shorty.insert(dbObj, function(err, doc){
                  if (err) {
                    console.log('INSERT ERROR');
                    throw err
                  } else {
                    console.log('DBOBJ');
                    console.log(JSON.stringify(dbObj));
                  }
                  db.close();
                });
              }
              res.send(retObj);
            });
          }
        });
      });
     });


   app.route('/api/clicks')
      .get(clickHandler.getClicks)
      .post(clickHandler.addClick)
      .delete(clickHandler.resetClicks);
};
