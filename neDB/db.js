var Datastore = require('nedb');

let news = new Datastore({ filename: 'neDB/newsHeadlines', autoload: true });
let words = new Datastore({ filename: 'neDB/randomWords', autoload: true });

module.exports.news = news;
module.exports.words = words;
