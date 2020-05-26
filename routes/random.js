const router = require('express').Router();
const got = require('got');

var { news, words } = require('../neDB/db');

const TestApiKey = process.env.NEWS_API_KEY;
const WordnikApiKey = process.env.WORDNIK_API_KEY;

function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

router.get('/', async (req, res) => {
  try {
    res.send('this one works');
  } catch {}
});

// Got
router.get('/data', async (req, res) => {
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
    res.send(articles);
  } catch (error) {
    console.log(error.response.body);
  }
});

// Got tester with unlimited free Api requests
router.get('/data2', async (req, res) => {
  try {
    let response = await got('https://jsonplaceholder.typicode.com/users', {
      responseType: 'json',
    });
    res.send(response.body.map(user => user.name));
  } catch (error) {
    console.log(error.response.body);
  }
});

// Got tester with save to db with unlimited free Api requests
router.get('/data3', async (req, res) => {
  try {
    let response = await got('https://jsonplaceholder.typicode.com/users', {
      responseType: 'json',
    });
    let userNames = await response.body.map(user => user.name);
    await news.remove({}, { multi: true }, function (err, numRemoved) {
      news.persistence.compactDatafile();
    });
    await news.insert({ userNames }, function (err, newDoc) {});
    res.send(userNames);
  } catch (error) {
    console.log(error.response.body);
  }
});

// Call wordnik to get 50 random words
router.get('/words', async (req, res) => {
  try {
    let response = await got(
      `https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=50&api_key=${WordnikApiKey}`,
      {
        responseType: 'json',
      }
    );
    let listOfWords = response.body.map(randWord => randWord.word);
    res.send(listOfWords);
  } catch (error) {
    console.log(error.response.body);
  }
});

// Query newsHeadlines neDB database, get length, randomly pick an index and return that headline
router.get('/headline', (req, res, next) => {
  news.find({}, function (err, docs) {
    const randomIdx = randomNum(0, docs[0].articles.length);
    const headlineToSend = docs[0].articles[randomIdx];
    if (!headlineToSend) return next(res.status(404).send('No headlines found except this one'));
    // res.send({ headlineToSend });
    res.send(headlineToSend);
  });
});

// Query randomWords neDB database, get length, randomly pick an index and return that word
router.get('/word', (req, res, next) => {
  words.find({}, function (err, docs) {
    const randomIdx = randomNum(0, docs[0].listOfWords.length);
    const wordToSend = docs[0].listOfWords[randomIdx];
    if (!wordToSend) return next(res.status(404).send('No words found except these six'));
    res.send(wordToSend);
  });
});

module.exports = router;
