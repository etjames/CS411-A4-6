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

//for using the ayien api
const AYLIENTextAPI = require('aylien_textapi');
const aylien_id = api_json['api-keys']['Aylien-Id'];
const aylien_key = api_json['api-keys']['Aylien-key'];
var textapi = new AYLIENTextAPI({
    application_id: aylien_id,
    application_key: aylien_key
})

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs')


//for turning on/off printing easily
const debug = true;
function db_print(text) {
    if(debug) {
        console.log(text);
    }
}


//for displaying homepage
app.get('/', function (req, res) {
  const homepagePath = (path.join(__dirname , '../views' ,'homepage.ejs'));
  res.render(homepagePath);
})

//for responding to query, calls news api and puts callback into query.ejs
app.post('/', function (req, res) {

  //get user input
  const newsSearch = req.body.searchField;

  //get date
  const date = new Date();
  const year = date.getFullYear();
  const day = date.getDate();
  const month = date.getMonth();
  db_print("Today is " + year + "-" + month  + "-" + day);

  let newsURL = 'https://newsapi.org/v2/everything?q=' + newsSearch +
      '&from='  + year + '-' + month  + '-' + day +  '&apiKey=' + news_api_key;
  const getNewsAPICall = util.promisify(request);

    getNewsAPICall(newsURL).then(data => {
        let content = JSON.parse(data.body);
        db_print(content.articles);

        const queryPath = (path.join(__dirname , '../views' ,'query.ejs'));
        res.render(queryPath, {
           name: 'News API Results' ,
            title1: content.articles[0].title,
            description1: content.articles[0].description,
            title2: content.articles[1].title,
            description2: content.articles[1].description,
            title3: content.articles[2].title,
            description3: content.articles[2].description
        });
        //now we use the aylien api to get keywords
        db_print("Using aylien api now...");

        textapi.entities({
            url: content.articles[0].url
        }, function(error, response) {
            if (error === null) {
                Object.keys(response.entities).forEach(function(e) {
                    const foundKeyWords = response.entities['keyword'];
                    db_print(foundKeyWords);
                });
            }
        });

  }).catch(err => console.log('error: ' , err))

})


app.listen(3000, () => console.log('Server ready'))

// module.exports = router;