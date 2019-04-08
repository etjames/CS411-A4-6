let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let request = require('request');
const util = require('util');

//for reading config file
const fs = require('fs');
const configPath = (path.join(__dirname , '../config' ,'config.json'));
const rawdata = fs.readFileSync(configPath);
const api_json = JSON.parse(rawdata);
const news_api_key = api_json['api-keys']['News-Api-Key'];

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs')

//for displaying homepage
app.get('/', function (req, res) {
  const homepagePath = (path.join(__dirname , '../views' ,'homepage.ejs'));
  res.render(homepagePath);
})

//for responding to query, calls news api and puts callback into query.ejs
app.post('/', function (req, res) {

  //get user input
  const news = req.body.searchField;

  //get date
  const date = new Date();
  const year = date.getFullYear();
  const day = date.getDate();
  const month = date.getMonth();
  //console.log("Today is " + year + "-" + month  + "-" + day);

  let url = 'https://newsapi.org/v2/everything?q=' + news +
      '&from='  + year + '-' + month  + '-' + day +  '&apiKey=' + news_api_key;
  console.log(global.gConfig);
    const getAPICall = util.promisify(request);

    getAPICall(url).then(data => {
        let content = JSON.parse(data.body);
        //console.log(("joke: ", content.articles));
        //res.render(content.articles);
        const queryPath = (path.join(__dirname , '../views' ,'query.ejs'));
        console.log(content.articles);
        res.render(queryPath, {
           name: 'News API Results' ,
            title1: content.articles[0].title,
            description1: content.articles[0].description,
            title2: content.articles[1].title,
            description2: content.articles[1].description,
            title3: content.articles[2].title,
            description3: content.articles[2].description
        });

    }).catch(err => console.log('error: ' , err))

})


app.listen(3000, () => console.log('Server ready'))

// module.exports = router;