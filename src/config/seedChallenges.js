const Challenge = require('../models/Challenge');
const challenges = require('./challenges');

async function seedChallenges() {
  try {
    const docs = challenges.map((c) => ({
      level: c.level,
      title: c.title,
      description: c.description,
      systemPrompt: c.systemPrompt,
      secretPassword: c.secretPassword,
      secret: c.secretPassword,
      technique: c.technique || 'unknown',
      explanation: c.explanation || c.description,
      nextTechniqueHint: c.nextTechniqueHint || null,
      order: c.level,
    }));

    // Upsert each challenge by level so local edits always take effect
    for (const doc of docs) {
      await Challenge.findOneAndUpdate({ level: doc.level }, doc, { upsert: true });
    }
    console.log(`Seeded ${docs.length} challenges.`);
  } catch (err) {
    console.error('Challenge seed error:', err.message);
  }
}

module.exports = seedChallenges;
