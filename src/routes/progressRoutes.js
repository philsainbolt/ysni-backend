const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getProgressHandler, beatChallengeHandler } = require('../controllers/progressController');

const router = express.Router();

router.get('/', authMiddleware, getProgressHandler);
router.post('/beat/:id', authMiddleware, beatChallengeHandler);

module.exports = router;
