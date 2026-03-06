const express = require('express');
const ChallengeController = require('../controllers/ChallengeController');

const router = express.Router();

router.get('/', ChallengeController.getAllChallenges);
router.get('/:id', ChallengeController.getChallengeById);
router.post('/:id/submit', ChallengeController.submitAttempt);

module.exports = router;
