const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../data/db.js');

router.post('/register', async (req, res) => {
  const { username, email, password, opt_in } = req.body;
  if (!username || !email || !password || !opt_in)
    return res.status(400).json('Must complete all fields');

  if (password.length < 6) return res.status(400).json('Password must be at least 6 characters');

  const hash = await bcrypt.hashSync(password, 10);

  try {
    const userinfo = await db('users')
      .returning(['id', 'email', 'username', 'created_at'])
      .insert({ username, email, password: hash, opt_in });
    res.status(201).json(userinfo[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error creating new user', error: err.detail });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json('Must complete all fields');
  }

  const [user] = await db('users').where('email', '=', email);
  if (!user) return res.status(500).json({ message: 'Incorrect username or password' });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(500).json({ message: 'Incorrect username or password' });

  // res.status(200).json({ user });
  res.status(200).json({ id: user.id, email: user.email, username: user.username });
});

module.exports = router;
