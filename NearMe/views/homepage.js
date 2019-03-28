let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let request = require('request');
const util = require('util');

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
  let news = req.body.searchField;
  let url = 'https://newsapi.org/v2/everything?q=' + news + '&from=2019-02-28' +  '&apiKey=70edd79e9171414db7e92ceef59dab1b';

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