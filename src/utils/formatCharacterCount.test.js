import { formatCharacterCount } from './formatCharacterCount';

describe('formatCharacterCount', () => {
  test('formats an empty string', () => {
    expect(formatCharacterCount('')).toBe('0 characters');
  });

  test('counts spaces and line breaks exactly as entered', () => {
    expect(formatCharacterCount('A B\nC')).toBe('5 characters');
  });
});
