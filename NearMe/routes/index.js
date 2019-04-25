var express = require('express');
let path = require('path');
var router = express.Router();
var bodyParser = require('body-parser');
var app     = express();

//Note that in version 4 of express, express.bodyParser() was
//deprecated in favor of a separate 'body-parser' module.
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(express.bodyParser());

app.post('/query', function(req, res) {
  console.log("got the query!");
  //res.send('You sent the query "' + req.body.searchParameter + '".');
});


/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  const homepagePath = (path.join(__dirname , '../views' ,'homepage.html'));
  res.sendFile(homepagePath);
});

module.exports = router;
