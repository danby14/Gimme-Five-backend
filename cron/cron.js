var cron = require('node-cron');
const got = require('got');
var { news, words } = require('../neDB/db');

const WordnikApiKey = process.env.WORDNIK_API_KEY;
const TestApiKey = process.env.NEWS_API_KEY;

// runs every 6 hours at the top of the hour.
let headlines = cron.schedule('0 */6 * * *', async () => {
  // let headlines = cron.schedule('0 * * * *', async () => {
  try {
    let response = await got(
      `http://newsapi.org/v2/top-headlines?country=us&apiKey=${TestApiKey}`,
      { responseType: 'json' }
    );
    let articles = response.body.articles.map(article => article.title);
    news.remove({}, { multi: true }, function (err, numRemoved) {
      news.persistence.compactDatafile();
    });
    news.insert({ articles }, function (err, newDoc) {});
    console.log('updated news headliens', Date.now());
  } catch (error) {
    console.log(error.response.body);
  }
});

// get 50 random words from api at the top of every hour
let randWords = cron.schedule('0 * * * *', async () => {
  try {
    let response = await got(
      `https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=50&api_key=${WordnikApiKey}`,
      {
        responseType: 'json',
      }
    );
    let listOfWords = response.body.map(randWord => randWord.word);
    words.remove({}, { multi: true }, function (err, numRemoved) {
      words.persistence.compactDatafile();
    });
    words.insert({ listOfWords }, function (err, newDoc) {});
    console.log('old words replaced by new ones');
  } catch (error) {
    console.log(error.response.body);
  }
});

//test - Runs At 00 minutes past 0:00 on the 1st day of Jan
let test2 = cron.schedule('0 0 1 1 *', async () => {
  console.log('Happy New Year');
});

module.exports.headlines = headlines;
module.exports.randWords = randWords;
module.exports.test2 = test2;
