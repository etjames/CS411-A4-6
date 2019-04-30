let express = require('express');
let path = require('path');
let router = express.Router();

/* GET homepage. */
router.get('/', function(req, res, next) {
  const homepagePath = (path.join(__dirname , '../views' ,'homepage.ejs'));
  res.render(homepagePath);
});

/* GET homepage (same thing) */
router.get('/homepage', function(req, res, next) {
  const homepagePath = (path.join(__dirname , '../views' ,'homepage.ejs'));
  res.render(homepagePath);
});

module.exports = router;
