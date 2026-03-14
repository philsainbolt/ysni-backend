const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getSubmissionsByUser, getSubmissionById } = require('../store/gameStore');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  res.json(getSubmissionsByUser(req.userId));
});

router.get('/:id', authMiddleware, (req, res) => {
  const submission = getSubmissionById(req.params.id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  if (submission.userId !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  return res.json(submission);
});

module.exports = router;
