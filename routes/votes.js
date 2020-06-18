const router = require('express').Router();
const db = require('../data/db.js');

// get all votes
router.get('/', async (req, res) => {
  const vote1 = await db('votes');
  res.status(201).json(vote1);
});

// get all votes for a specific list
router.get('/:listid', async (req, res) => {
  const { listid } = req.params;

  const vote1 = await db('votes').where('list_id', '=', listid);
  res.status(201).json(vote1);
});
// vote
router.post('/post/:listid', async (req, res) => {
  const { listid } = req.params;
  const { voter_id, vote } = req.body;

  // maybe upsert so users can change vote, instead of getting error on voting 2x
  try {
    const vote1 = await db('votes').returning('*').insert({ voter_id, list_id: listid, vote });
    res.status(201).json(vote1[0]);
  } catch (err) {
    res
      .status(404)
      .json({
        message: 'Error submitting vote 🥓 Have you alredy voted on this five?',
        error: err.detail,
      });
  }
});

module.exports = router;
