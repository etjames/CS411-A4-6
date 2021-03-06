//essential imports
let express = require('express');
let path = require('path');
let app = express();
let request = require('request');
let util = require('util');
const User = require('../database/nearmedb');


//for turning on/off printing easily
const debug = false;
function db_print(text) {
    if(debug) {
        console.log(text);
    }
}


//api call imports
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

app.set('view engine', 'ejs')

//for responding to query, calls news api and puts callback into query.ejs
app.post('/', function async(req, res) {
    //get user input
    let id =req.user.id;
    const newsSearch = req.body.searchField;
    let favorite = req.body.favorite;
    if (favorite === "on") {
        User.findOneAndUpdate({id: id}, { $push: { favorites: newsSearch  } },
            function (error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(success);
                }
            }
        )
    }; 

    //get date
    const date = new Date();
    const year = date.getFullYear();
    const day = date.getDate();
    const month = date.getMonth() + 1; //starts at 0 for january

    let newsURL = 'https://newsapi.org/v2/everything?q=' + newsSearch +
        '&from='  + year + '-' + month  + '-' + day +  '&apiKey=' + news_api_key;


    let articles = [];

    const getNewsAPICall = util.promisify(request);

    getNewsAPICall(newsURL).then(data => {

        // Json parse article content
        let content = JSON.parse(data.body);

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
                        let twitterQuery = "" + newsSearch + ", "; //this one will not have any keywords
                        if (response.entities != undefined) {
                            if (response.entities['organization'] != undefined) {
                                twitterQuery += response.entities['organization'][0] + ", ";
                            }
                            if (response.entities['person'] != undefined) {
                                twitterQuery += response.entities['person'][0];
                            }
                            if (response.entities['keyword'] != undefined) {
                            }
                            db_print("twitterQuery2 is: " + twitterQuery);
                        }

                        //now we try to get a twitter call
                        twitterClient.get('search/tweets', {q: twitterQuery}, function async(error, tweets, response) {
                            let tweetsList = tweets['statuses'];
                            let maxTweets = 3;
                            let tweetResults = [];
                            let tweetsGotten = 0;
                            for (let tweetIndex in tweetsList) {
                                let userTweet = { screenName: tweetsList[tweetIndex].user.screen_name,
                                    name: tweetsList[tweetIndex].user.name,
                                    text: tweetsList[tweetIndex].text,
                                    profileImage: tweetsList[tweetIndex].user.profile_image_url,
                                    tweetURL: tweetsList[tweetIndex].user.url
                                };
                                if(tweetsGotten <= maxTweets) {
                                    tweetResults.push(userTweet);
                                }
                                tweetsGotten++;
                            }

                            if (tweetResults.length == 0) {
                                tweetResults.push("No tweets found.");
                            }

                            let curArticleResult = {
                                articleName: content.articles[articleCount].title,
                                articleTagline: content.articles[articleCount].description,
                                articleDescription: content.articles[articleCount].content,
                                articlePicture: content.articles[articleCount].urlToImage,
                                articleURL: content.articles[articleCount].url,
                                tweets: tweetResults,
                                numTweets: tweetsGotten

                            }

                            articles.push(curArticleResult);

                            // timeout to await results
                            let wait = setTimeout(() => {
                                clearTimeout(wait);
                                return resolve(); // SUCCESS after timeout
                            }, 200)
                        });
                    } // end of if statement
                }); //end of aylien api
            }); // end of promise
        }

        // After all promises fulfilled, then send results.
        Promise.all(promises)
            .then(function(){
                const queryPath = (path.join(__dirname , '../views' ,'query.ejs'));
                res.render(queryPath, {articles: articles, cityQuery: newsSearch});})
            .catch(function() { console.log("error")} );


    }).catch(err => console.log('error: ' , err));

}) // end of app.post

module.exports = app;
