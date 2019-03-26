let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');
let app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('homepage');
})

app.post('/', function (req, res) {
  let tweet = req.body.title;
  let url = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=' + article;
  
  request(url,{json:true},(err,res,body)=>{
    if(err){
        return console.log(err);
    } else {
        return console.log(body.parse.title);
        
        //let wikipage = JSON.parse(body)
        //res.render('index');
     // let message = `I love ${wikipage} which is why I looked it up!`;
    //console.log(message);
    }
    //console.log(body)
    console.log("this is working!");
});
  
})





app.listen(3000, () => console.log('Server ready'))

module.exports = router;