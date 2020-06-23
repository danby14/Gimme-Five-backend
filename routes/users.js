const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../data/db.js');
const { createAccessToken, createRefreshToken } = require('../shared/makeTokens');
const { sendRefreshToken } = require('../shared/sendRefreshToken');

router.post('/register', async (req, res) => {
  const { username, email, password, opt_in } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'Must complete all fields' });

  if (password.length < 6) return res.status(400).json('Password must be at least 6 characters');

  const hash = await bcrypt.hashSync(password, 10);

  try {
    const userinfo = await db('users')
      .returning(['id', 'email', 'username', 'token_version', 'created_at'])
      .insert({ username, email, password: hash, opt_in });

    //Create and assign a jwt as access token
    let accessToken = createAccessToken(userinfo);

    userinfo[0].token = accessToken;

    //Create and assign a jwt as refresh token
    let refreshToken = createRefreshToken(userinfo);

    sendRefreshToken(res, refreshToken);

    res.status(201).json(userinfo[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error creating new user', error: err.detail });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Must complete all fields' });
  }

  const [user] = await db('users').where('email', '=', email);
  if (!user) return res.status(500).json({ message: 'Incorrect username or password' });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(500).json({ message: 'Incorrect username or password' });

  //Create and assign a jwt as access token
  let accessToken = createAccessToken(user);

  //Create and assign a jwt as refresh token
  let refreshToken = createRefreshToken(user);

  sendRefreshToken(res, refreshToken);

  // res.status(200).json(user);
  res.status(200).json({
    id: user.id,
    email: user.email,
    username: user.username,
    token: accessToken,
  });
});

//Logout
router.get('/logout', async (req, res) => {
  res.clearCookie('gfrt', { path: '/refresh_token' });
  res.status(201).json('logged out');
});

module.exports = router;
