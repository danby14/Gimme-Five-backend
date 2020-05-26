const express = require('express');
const app = express();
require('dotenv/config');
const cors = require('cors');
const { headlines, randWords, test2 } = require('./cron/cron');
const port = 5000;

// cron jobs
headlines;
randWords;
test2;

//Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// app.use(
//   cors({
//     origin: 'http://localhost:3000',
//     // origin: 'http://192.168.1.126:3000', for testing site from network devices
//     credentials: true,
//   })
// );

//Import Routes
const randomRoute = require('./routes/random');

//Route Middlewares
// app.use('/user', authRoute);
app.use('/random', randomRoute);
app.use('/test', (req, res) => {
  res.send('got to test 1');
});

//ROUTES
app.get('/', (req, res) => {
  res.send('we are on home');
});

//Where we listen for server
app.listen(port, () => console.log(`server listening on port ${port}!`));
