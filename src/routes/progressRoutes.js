const express = require('express');
const { getProgressHandler, beatChallengeHandler } = require('../controllers/progressController');

const router = express.Router();

router.get('/', getProgressHandler);
router.post('/beat/:id', beatChallengeHandler);

module.exports = router;
