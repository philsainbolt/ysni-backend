const { generateResponse } = require('../services/llmAdapter');
const { containsSecretPassword } = require('../utils/passwordDetection');
const {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  markBeaten,
  saveSubmission,
} = require('../store/gameStore');
const { updateUserProgress } = require('../store/userStore');

class ChallengeController {
  static getAllChallenges(req, res) {
    res.json(getAllChallenges());
  }

  static getChallengeById(req, res) {
    const challenge = getChallengeById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const {
      secretPassword,
      secret_password,
      systemPrompt,
      system_prompt,
      ...safeChallenge
    } = challenge;

    return res.json(safeChallenge);
  }

  static createChallenge(req, res) {
    const created = createChallenge(req.body || {});
    return res.status(201).json(created);
  }

  static updateChallenge(req, res) {
    const updated = updateChallenge(req.params.id, req.body || {});
    if (!updated) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    return res.json(updated);
  }

  static deleteChallenge(req, res) {
    const deleted = deleteChallenge(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    return res.status(204).send();
  }

  static async submitAttempt(req, res, next) {
    try {
      const { prompt, userPrompt } = req.body;
      const normalizedPrompt = userPrompt || prompt;
      const challenge = getChallengeById(req.params.id);

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      if (!normalizedPrompt || typeof normalizedPrompt !== 'string') {
        return res.status(400).json({ error: 'prompt or userPrompt is required' });
      }

      const systemPrompt = challenge.systemPrompt || challenge.system_prompt;
      const secretPassword = challenge.secretPassword || challenge.secret_password;

      const llmResponse = await generateResponse(systemPrompt, normalizedPrompt);
      const success = containsSecretPassword(llmResponse, secretPassword);

      const submission = saveSubmission(req.userId, challenge.id, normalizedPrompt, llmResponse, success);

      let progress = null;
      if (success) {
        progress = markBeaten(req.userId, challenge.level || challenge.id);
        updateUserProgress(req.userId, progress.beaten, progress.currentLevel);
      }

      return res.json({
        success,
        pass: success,
        response: llmResponse,
        hint: success ? undefined : 'Try reframing your request and chaining transformations.',
        submissionId: submission.id,
        progress,
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = ChallengeController;
