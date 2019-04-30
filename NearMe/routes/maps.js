let express = require('express');
let path = require('path');
let app = express();

//for displaying maps search
app.get('/', function (req, res) {
    const map_page = (path.join(__dirname , '../views' ,'maps.ejs'));
    res.render(map_page);
})

module.exports = app;
