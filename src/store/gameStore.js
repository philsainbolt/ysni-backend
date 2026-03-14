const baseChallenges = require('../config/challenges');

let nextChallengeId = baseChallenges.length + 1;
let challenges = baseChallenges.map((challenge) => ({ ...challenge }));
let progressByUser = new Map();
let submissions = [];
let nextSubmissionId = 1;

function stripSecrets(challenge) {
  const { secretPassword, secret_password, ...safe } = challenge;
  return safe;
}

function getAllChallenges() {
  return challenges.map(stripSecrets).sort((a, b) => (a.level || a.id) - (b.level || b.id));
}

function getChallengeById(id) {
  return challenges.find((c) => c.id === Number(id)) || null;
}

function createChallenge(payload) {
  const id = nextChallengeId++;
  const level = payload.level || id;
  const created = {
    id,
    level,
    title: payload.title || `Level ${level}`,
    description: payload.description || '',
    systemPrompt: payload.systemPrompt || payload.system_prompt || '',
    secretPassword: payload.secretPassword || payload.secret_password || 'PLACEHOLDER_SECRET',
    system_prompt: payload.systemPrompt || payload.system_prompt || '',
    user_description: payload.description || '',
    secret_password: payload.secretPassword || payload.secret_password || 'PLACEHOLDER_SECRET',
    difficulty_level: level,
  };

  challenges.push(created);
  return stripSecrets(created);
}

function updateChallenge(id, payload) {
  const challenge = getChallengeById(id);
  if (!challenge) return null;

  if (payload.title !== undefined) challenge.title = payload.title;
  if (payload.description !== undefined) {
    challenge.description = payload.description;
    challenge.user_description = payload.description;
  }
  if (payload.systemPrompt !== undefined || payload.system_prompt !== undefined) {
    challenge.systemPrompt = payload.systemPrompt || payload.system_prompt;
    challenge.system_prompt = challenge.systemPrompt;
  }
  if (payload.secretPassword !== undefined || payload.secret_password !== undefined) {
    challenge.secretPassword = payload.secretPassword || payload.secret_password;
    challenge.secret_password = challenge.secretPassword;
  }
  if (payload.level !== undefined) {
    challenge.level = payload.level;
    challenge.difficulty_level = payload.level;
  }

  return stripSecrets(challenge);
}

function deleteChallenge(id) {
  const initial = challenges.length;
  challenges = challenges.filter((c) => c.id !== Number(id));
  return challenges.length !== initial;
}

function ensureProgress(userId) {
  if (!progressByUser.has(userId)) {
    progressByUser.set(userId, { beaten: [] });
  }
  return progressByUser.get(userId);
}

function getProgress(userId) {
  const beaten = [...ensureProgress(userId).beaten].sort((a, b) => a - b);
  const sorted = challenges.slice().sort((a, b) => (a.level || a.id) - (b.level || b.id));

  let currentLevel = sorted.length + 1;
  for (const challenge of sorted) {
    const lvl = challenge.level || challenge.id;
    if (!beaten.includes(lvl)) {
      currentLevel = lvl;
      break;
    }
  }

  return { beaten, beatenLevels: beaten, currentLevel, progressLevel: currentLevel };
}

function markBeaten(userId, level) {
  const progress = ensureProgress(userId);
  const normalized = Number(level);
  if (!progress.beaten.includes(normalized)) {
    progress.beaten.push(normalized);
  }
  return getProgress(userId);
}

function saveSubmission(userId, challengeId, prompt, response, success) {
  const submission = {
    id: String(nextSubmissionId++),
    userId: String(userId),
    challengeId: Number(challengeId),
    prompt,
    response,
    success: Boolean(success),
    createdAt: new Date().toISOString(),
  };
  submissions.push(submission);
  return submission;
}

function getSubmissionsByUser(userId) {
  return submissions.filter((s) => s.userId === String(userId));
}

function getSubmissionById(id) {
  return submissions.find((s) => s.id === String(id)) || null;
}

function resetStore() {
  challenges = baseChallenges.map((challenge) => ({ ...challenge }));
  nextChallengeId = challenges.length + 1;
  progressByUser = new Map();
  submissions = [];
  nextSubmissionId = 1;
}

module.exports = {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getProgress,
  markBeaten,
  saveSubmission,
  getSubmissionsByUser,
  getSubmissionById,
  resetStore,
};
