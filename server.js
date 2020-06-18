const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv/config');

const app = express();

const { headlines, randWords, test2 } = require('./cron/cron');
const port = process.env.PORT || 5000;

// cron jobs
headlines;
randWords;
test2;

//Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan('common'));

//Import Routes
const randomRoute = require('./routes/random');
const usersRoute = require('./routes/users');
const listsRoute = require('./routes/lists');
const votesRoute = require('./routes/votes');
const commentsRoute = require('./routes/comments');

//Route Middlewares
app.use('/random', randomRoute);
app.use('/user', usersRoute);
app.use('/lists', listsRoute);
app.use('/votes', votesRoute);
app.use('/comments', commentsRoute);
app.use('/test', (req, res) => {
  res.send('got to test 1');
});

//ROUTES
app.get('/', (req, res) => {
  res.send('we are on home, gimme five');
});

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
  });
});

//Where we listen for server
app.listen(port, () => console.log(`server listening on port ${port}!`));
