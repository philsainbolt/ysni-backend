const express = require('express');
const ChallengeController = require('../controllers/ChallengeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, ChallengeController.getAllChallenges);
router.get('/:id', authMiddleware, ChallengeController.getChallengeById);
router.post('/', authMiddleware, ChallengeController.createChallenge);
router.put('/:id', authMiddleware, ChallengeController.updateChallenge);
router.delete('/:id', authMiddleware, ChallengeController.deleteChallenge);
router.post('/:id/submit', authMiddleware, ChallengeController.submitAttempt);

module.exports = router;
