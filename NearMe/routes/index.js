var express = require('express');
let path = require('path');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  const homepagePath = (path.join(__dirname , '../views' ,'homepage.html'));
  res.sendFile(homepagePath);
});

module.exports = router;
