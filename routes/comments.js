const router = require('express').Router();
const db = require('../data/db.js');

// get all comments
router.get('/', async (req, res) => {
  const comments = await db('comments');
  res.status(201).json(comments);
});

// get all comments for a specific list
router.get('/:listid', async (req, res) => {
  const { listid } = req.params;

  const comments = await db('comments').where('list_id', '=', listid);
  res.status(201).json(comments);
});

// comment
router.post('/post/:listid', async (req, res) => {
  const { listid } = req.params;
  const { comment, commentor_id } = req.body;

  try {
    const comment1 = await db('comments')
      .returning('*')
      .insert({ comment, commentor_id, list_id: listid });
    res.status(201).json(comment1);
  } catch (err) {
    res.status(404).json({ message: 'Error submitting vote', error: err.detail });
  }
});

module.exports = router;
