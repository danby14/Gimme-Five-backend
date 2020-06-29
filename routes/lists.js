const router = require('express').Router();
const db = require('../data/db.js');

const verifyToken = require('../middleware/verifyToken');

// get all lists
router.get('/get/all', async (req, res) => {
  const list = await db('lists');

  if (!list) return res.status(401).send('Invalid request');

  res.status(200).json(list);
});

// get all lists with selected columns - paginated
router.get('/get/page/:id', async (req, res) => {
  const { id } = req.params;
  const list = await db('lists')
    .select('id', 'title', 'creator_id', 'created_at')
    .orderBy('id', 'desc')
    .paginate({ perPage: 10, currentPage: id, isLengthAware: true });
  res.status(200).json(list);
});

// get a single list by list_id with list(id, title, five), votes(vote), comments(id, comment, commentor, date)
router.get('/get/list/:id', async (req, res) => {
  const { id } = req.params;

  // json_agg(jsonb_build_object('vote', vote, 'voter_id', voter_id))
  const list = await db.raw(
    "SELECT id, title, five, (SELECT username FROM users u WHERE l.creator_id = u.id  ) as creator, (SELECT json_agg(jsonb_build_object('vote', vote, 'voter_id', voter_id)) FROM votes v WHERE l.id = v.list_id  ) as votes, (SELECT json_agg(json_build_object('id', c.id, 'comment', c.comment, 'commentor', u.username, 'date', c.created_at) ORDER BY c.id) FROM comments c JOIN users u on c.commentor_id = u.id WHERE l.id = c.list_id ) as comments FROM lists l WHERE l.id = :id",
    { id: id }
  );

  if (!list) return res.status(401).send('Invalid request');

  res.status(200).json(list.rows[0]);
});

// require authorization from here down
router.use(verifyToken);

// get all of a user's lists with votes and comments
router.get('/get/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const lists = await db.raw(
      "SELECT id, title, five, (SELECT json_agg(vote order by votes.vote) FROM votes WHERE l.id = votes.list_id  ) as votes, (SELECT json_agg(json_build_object('id', c.id, 'comment', c.comment, 'commentor', u.username, 'date', c.created_at) ORDER BY c.id) FROM comments c JOIN users u on c.commentor_id = u.id WHERE l.id = c.list_id ) as comments FROM lists l WHERE l.creator_id = :id",
      { id: id }
    );

    if (lists.rowCount < 1) return res.status(404).send('No lists found');

    res.status(200).json(lists.rows);
  } catch (err) {
    res.status(404).json({ message: 'Error getting list', error: err });
  }
});

// submit a list
router.post('/post/user/:id', async (req, res) => {
  const { id } = req.params;
  const { title, five } = req.body;

  try {
    const list = await db.raw(
      'INSERT INTO lists (title, five, creator_id) SELECT :title, :five, :id WHERE (SELECT COUNT(*) FROM lists WHERE creator_id = :id) < 3',
      { title: title, five: five, id: id }
    );

    if (list.rowCount === 0) {
      return res.status(405).json({
        message:
          'Already have max lists (3/3). Must replace or delete one of your current lists before proceeding',
      });
    }
    res.status(201).json({ message: 'list added successfully', list });
  } catch (err) {
    res.status(404).json({ message: 'Error creating list', error: err });
  }
});

// delete a list from user(it is set up to cascade delete votes and comments on that list too)
router.delete('/remove/:listId', async (req, res) => {
  let { listId } = req.params;
  listId = Number(listId);
  const { userId } = req.body;
  console.log(userId);

  const removed = await db('lists').where('id', listId).del();

  res.status(200).json(removed);
});

module.exports = router;
