const express = require('express'),
    app = express(),
    passport = require('passport'),
    auth = require('./auth'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session');

const User = require('../nearmedb');

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/nearme', {useNewUrlParser: true}, function(err, db) {
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    }
});
const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
}); 

auth(passport);
app.use(passport.initialize());

app.set('view engine', 'ejs');


app.get('/login',
  function(req, res){
    res.render('../login');
  });

  app.get('/homepage',
  function(req, res){
    res.render('../homepage');
  });

app.use(cookieSession({
    name: 'session',
    keys: ['fuh4t87yrhfu4'],
    maxAge: 24 * 60 * 60 * 1000
}));
app.use(cookieParser());



app.get('/', (req, res) => {
    let name = req.body.searchField
    console.log(name);
    if (req.session) {
       res.redirect('./homepage');
    } else {
        res.redirect('./login');
        };
});

app.get('/logout', (req, res) => {
    req.logout();
    req.session = null;
    res.redirect('/login');
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
}));

app.get('/auth/google/redirect',
    passport.authenticate('google', {
        failureRedirect: 'login'}),
    (req, res) => {
        req.session.token = req.user.token;
        console.log('hi look below')
        console.log(req.user.token);
        res.redirect('/homepage');
    }
);

//HOMEPAGE.JS 

//let bodyParser = require('body-parser');
let path = require('path');
let request = require('request');
let util = require('util');
let Twitter = require('twitter');

//for reading config file
const fs = require('fs');
const configPath = (path.join(__dirname , '../config' ,'config.json'));
const rawdata = fs.readFileSync(configPath);
const api_json = JSON.parse(rawdata);

//for news api
const news_api_key = api_json['api-keys']['News-Api-Key'];

//for using the ayien api
const AYLIENTextAPI = require('aylien_textapi');
const aylien_id = api_json['api-keys']['Aylien-Id'];
const aylien_key = api_json['api-keys']['Aylien-key'];
const textapi = new AYLIENTextAPI({
    application_id: aylien_id,
    application_key: aylien_key 
})

//for twitter api
let twitterClient = new Twitter({
    consumer_key: api_json['api-keys']['Twitter-Api-Key'],
    consumer_secret: api_json['api-keys']['Twitter-Secret-Key'],
    access_token_key: api_json['api-keys']['Twitter-Access-Token'],
    access_token_secret: api_json['api-keys']['Twitter-Secret-Access-Token']
});




//app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs')

//for turning on/off printing easily
const debug = true;
function db_print(text) {
    if(debug) {
        console.log(text);
    }
}

function listToString(array) {
    let returnString = "";
    for(let item in array) {
        returnString+= array[item] + "\n\n";
    }
    return returnString;
}

//for displaying homepage
app.get('/', function (req, res) {
  const homepagePath = (path.join(__dirname , '../views' ,'homepage.ejs'));
  res.render(homepagePath);
})

//for responding to query, calls news api and puts callback into query.ejs
app.post('/', function async(req, res) {
  //get user input
  const newsSearch = req.body.searchField;

  //get date
  const date = new Date();
  const year = date.getFullYear();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  db_print("Today is " + year + "-" + month  + "-" + day);

  let newsURL = 'https://newsapi.org/v2/everything?q=' + newsSearch +
      '&from='  + year + '-' + month  + '-' + day +  '&apiKey=' + news_api_key;

  let threeApiResults = {
      articleName: String,
      articleDescription: String,
      tweetResults: String
  }


    //we will store the articles/tweets here:
  let allArticleResults = {
      article: {

      }
  }; //of type threeApiResults

  let articles = [];

  const getNewsAPICall = util.promisify(request);

  getNewsAPICall(newsURL).then(data => {

      // Json parse article content
      let content = JSON.parse(data.body);

      //now we use the aylien api to get keywords
      db_print("Using aylien api now...");

      // NUMBER OF ARTICLES DISPLAYED
      const DISPLAY_ARTICLE_COUNT = 5;

      // Create a promise, for after loop ends.
      var promises = [];

      // For each article, get Twitter results
      for(let articleCount = 0; articleCount < DISPLAY_ARTICLE_COUNT; articleCount ++) {
          if(articleCount < content.articles.length - 1) {
            promises.push(getTwitterResults(articleCount));
          }
      }

      // Helper function getTwitterResults, wrapped around return Promise
      function getTwitterResults(articleCount) {
          return new Promise(function (resolve, reject) {
              textapi.entities({ url: content.articles[articleCount].url}, function async(error, response) {
                  if (error === null) {
                      const foundKeyWords = response.entities['keyword'];
                      let keywordsString = "";
                      if (foundKeyWords != undefined) {
                          const arrayLength = foundKeyWords.length;
                          for (let i = 0; i < arrayLength; i++) {
                              if (i != arrayLength - 1) {
                                  keywordsString += foundKeyWords[i] + ", ";
                              } else {
                                  keywordsString += foundKeyWords[i];
                              }
                          }
                      } else {
                          keywordsString = "";
                      }

                      //now we create our own twitter search String
                      //it will be composed of the first response from each of the following sub-divisions
                      // 1) location 2) organization 3) person 4) keywords
                      let twitterQuery1 = "" + newsSearch + ", "; //we start with just the city
                      let twitterQuery2 = "" + newsSearch + ", "; //this one will not have any keywords
                      if (response.entities != undefined) {
                          if (response.entities['organization'] != undefined) {
                              twitterQuery1 += response.entities['organization'][0] + ", ";
                              twitterQuery2 += response.entities['organization'][0] + ", ";
                          }
                          if (response.entities['person'] != undefined) {
                              twitterQuery1 += response.entities['person'][0] + ", ";
                              twitterQuery2 += response.entities['person'][0];
                          }
                          if (response.entities['keyword'] != undefined) {
                              twitterQuery1 += response.entities['keyword'][0];
                          }
                          db_print("twitterQuery2 is: " + twitterQuery2);
                      }

                      //now we try to get a twitter call
                      twitterClient.get('search/tweets', {q: twitterQuery2}, function async(error, tweets, response) {
                          let tweetsList = tweets['statuses'];
                          let tweetResults = [];
                          let maxTweets = 3;
                          let tweetsGotten = 0;
                          for (let tweetIndex in tweetsList) {
                              let tweetText = tweetsList[tweetIndex]['text'];
                              tweetsGotten++;
                              if(tweetsGotten <= maxTweets) {
                                tweetResults.push(tweetText);
                              }
                          }

                          let curArticleResult = {
                              articleName: content.articles[articleCount].title,
                              articleDescription: content.articles[articleCount].description,
                              tweetResults: tweetResults
                          }
                          //db_print("The twitter results are: " + tweetResults);

                          articles.push(curArticleResult);

                          allArticleResults.article[articleCount] = curArticleResult;
                      });

                      return resolve(); // SUCCESS
                  } // end of if statement
              }); //end of aylien api

          }); // end of promise
      }

      // After all promises fulfilled, then send results.
      Promise.all(promises)
          .then(function(){
              db_print("Results are: " );
              db_print(articles);
              const queryPath = (path.join(__dirname , '../views' ,'query.ejs'));
              //res.send(allArticleResults);

              res.render(queryPath, {articles: articles});})
          .catch(function() { console.log("error")} );


  }).catch(err => console.log('error: ' , err));

}) //end of app.post


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
