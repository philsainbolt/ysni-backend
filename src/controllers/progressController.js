const { getChallengeById, getProgress, markBeaten } = require('../store/gameStore');
const { updateUserProgress } = require('../store/userStore');

function getProgressHandler(req, res) {
  return res.json(getProgress(req.userId));
}

function beatChallengeHandler(req, res) {
  const id = Number(req.params.id);
  const challenge = getChallengeById(id);

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const progress = markBeaten(req.userId, challenge.level || challenge.id);
  updateUserProgress(req.userId, progress.beaten, progress.currentLevel);

  return res.json(progress);
}

module.exports = {
  getProgressHandler,
  beatChallengeHandler,
};
