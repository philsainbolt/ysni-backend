const { generateResponse } = require('../services/llmAdapter');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const User = require('../models/User');

const SENSITIVE_FIELDS = '-systemPrompt -secretPassword -secret -system_prompt -secret_password';

class ChallengeController {
  static async getAllChallenges(req, res, next) {
    try {
      const challenges = await Challenge.find()
        .select(SENSITIVE_FIELDS)
        .sort({ level: 1 });
      res.json(challenges);
    } catch (err) {
      next(err);
    }
  }

  static async getChallengeById(req, res, next) {
    try {
      const challenge = await Challenge.findById(req.params.id)
        .select(SENSITIVE_FIELDS);

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      return res.json(challenge);
    } catch (err) {
      next(err);
    }
  }

  static async createChallenge(req, res, next) {
    try {
      const challenge = await Challenge.create(req.body);
      const safe = challenge.toObject();
      delete safe.systemPrompt;
      delete safe.secretPassword;
      delete safe.secret;
      delete safe.system_prompt;
      delete safe.secret_password;
      return res.status(201).json(safe);
    } catch (err) {
      next(err);
    }
  }

  static async updateChallenge(req, res, next) {
    try {
      const challenge = await Challenge.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      const safe = challenge.toObject();
      delete safe.systemPrompt;
      delete safe.secretPassword;
      delete safe.secret;
      delete safe.system_prompt;
      delete safe.secret_password;
      return res.json(safe);
    } catch (err) {
      next(err);
    }
  }

  static async deleteChallenge(req, res, next) {
    try {
      const challenge = await Challenge.findByIdAndDelete(req.params.id);

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async submitAttempt(req, res, next) {
    try {
      const { prompt, userPrompt } = req.body;
      const normalizedPrompt = userPrompt || prompt;
      const challenge = await Challenge.findById(req.params.id);

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      if (!normalizedPrompt || typeof normalizedPrompt !== 'string') {
        return res.status(400).json({ error: 'prompt or userPrompt is required' });
      }

      const systemPrompt = challenge.systemPrompt || challenge.system_prompt;

      const llmResponse = await generateResponse(systemPrompt, normalizedPrompt);

      const submission = await Submission.create({
        userId: req.userId,
        challengeId: challenge._id,
        userPrompt: normalizedPrompt,
        llmResponse,
        success: false,
      });

      return res.json({
        response: llmResponse,
        submissionId: submission._id,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async guessPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { password, submissionId } = req.body;

      const challenge = await Challenge.findById(id);
      if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

      const secretPassword = challenge.secretPassword || challenge.secret;
      const correct = password.trim().toUpperCase() === secretPassword.trim().toUpperCase();

      if (!correct) {
        return res.json({
          correct: false,
          hint: 'Incorrect password. Read the response more carefully.',
        });
      }

      if (submissionId) {
        await Submission.findByIdAndUpdate(submissionId, { success: true });
      }

      const user = await User.findById(req.userId);
      if (!user.beatenLevels.includes(challenge.level)) {
        user.beatenLevels.push(challenge.level);
        user.beatenLevels.sort((a, b) => a - b);
        user.progressLevel = Math.max(user.progressLevel, challenge.level);
        await user.save();
      }

      const nextChallenge = await Challenge.findOne({ level: challenge.level + 1 });
      const reveal = {
        systemPrompt: challenge.systemPrompt,
        explanation: challenge.explanation,
        technique: challenge.technique,
        nextTechniqueHint: challenge.nextTechniqueHint || null,
        nextChallengeId: nextChallenge?._id || null,
      };

      return res.json({
        correct: true,
        success: true,
        pass: true,
        progress: {
          beaten: user.beatenLevels,
          beatenLevels: user.beatenLevels,
          currentLevel: user.progressLevel,
        },
        reveal,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChallengeController;
