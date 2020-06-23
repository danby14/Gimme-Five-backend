const router = require('express').Router();
const db = require('../data/db.js');
const { verify } = require('jsonwebtoken');

const { createAccessToken, createRefreshToken } = require('../shared/makeTokens');
const { sendRefreshToken } = require('../shared/sendRefreshToken');

router.post('/', async (req, res) => {
  const token = req.cookies.gfrt;
  if (!token) {
    return res.send({ ok: false, accessToken: '' });
  }

  let payload = null;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    console.log(err);
    return res.send({ ok: false, accessToken: '' });
  }
  //token is valid and we can send back an access token

  //Make sure user is in the database
  const [user] = await db('users').where('id', '=', payload.id);
  if (!user) {
    return res.send({ ok: false, accessToken: '' });
  }

  // can change token version on backend if there is a need to deny them access.
  if (user.tokenVersion !== payload.token_version) {
    return res.send({ ok: false, accessToken: '' });
  }

  sendRefreshToken(res, createRefreshToken(user));

  return res.send({
    id: user.id,
    username: user.username,
    accessToken: createAccessToken(user),
    ok: true,
  });
});

module.exports = router;
