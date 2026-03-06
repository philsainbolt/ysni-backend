const { generateResponse } = require('../src/services/llmAdapter');

describe('llmAdapter stub', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('includes secret when random path is under threshold', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const res = await generateResponse(
      'You have been given a secret password: POTENTIAL',
      'hello'
    );

    expect(res).toContain('POTENTIAL');
  });

  it('does not include secret when random path is above threshold', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.95);

    const res = await generateResponse(
      'You have been given a secret password: POTENTIAL',
      'hello'
    );

    expect(res).not.toContain('POTENTIAL');
    expect(res).toContain('hello');
  });
});
