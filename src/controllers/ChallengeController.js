const challenges = require('../config/challenges');
const { generateResponse } = require('../services/llmAdapter');
const { containsSecretPassword } = require('../utils/passwordDetection');

class ChallengeController {
  static getAllChallenges(req, res) {
    res.json(challenges.map(({ secret_password, ...rest }) => rest));
  }

  static getChallengeById(req, res) {
    const id = Number(req.params.id);
    const challenge = challenges.find((item) => item.id === id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const { secret_password, ...safeChallenge } = challenge;
    return res.json(safeChallenge);
  }

  static async submitAttempt(req, res, next) {
    try {
      const id = Number(req.params.id);
      const { prompt } = req.body;
      const challenge = challenges.find((item) => item.id === id);

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'prompt is required' });
      }

      const llmResponse = await generateResponse(challenge.system_prompt, prompt);
      const success = containsSecretPassword(llmResponse, challenge.secret_password);

      return res.json({
        success,
        response: llmResponse,
        hint: success ? undefined : 'Try reframing your request and chaining transformations.',
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = ChallengeController;
