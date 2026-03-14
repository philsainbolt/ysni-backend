const express = require('express');
const ChallengeController = require('../controllers/ChallengeController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, ChallengeController.getAllChallenges);
router.get('/:id', authMiddleware, ChallengeController.getChallengeById);
router.post('/', authMiddleware, adminMiddleware, ChallengeController.createChallenge);
router.put('/:id', authMiddleware, adminMiddleware, ChallengeController.updateChallenge);
router.delete('/:id', authMiddleware, adminMiddleware, ChallengeController.deleteChallenge);
router.post('/:id/submit', authMiddleware, ChallengeController.submitAttempt);

module.exports = router;
