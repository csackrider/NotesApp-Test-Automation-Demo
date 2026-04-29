import {
  formatNoteTimestamp,
  getNoteTimestampDetails,
} from './formatNoteTimestamp';

describe('formatNoteTimestamp', () => {
  test('formats a valid ISO timestamp into readable absolute text', () => {
    expect(formatNoteTimestamp('2026-04-01T12:00:00.000Z')).toBe(
      'Apr 1, 2026, 12:00 PM UTC'
    );
  });

  test('returns null for an invalid timestamp', () => {
    expect(formatNoteTimestamp('not-a-date')).toBeNull();
  });
});

describe('getNoteTimestampDetails', () => {
  test('uses createdAt when a note has never been edited', () => {
    expect(
      getNoteTimestampDetails({
        createdAt: '2026-04-01T12:00:00.000Z',
      })
    ).toEqual({
      label: 'Created',
      isoString: '2026-04-01T12:00:00.000Z',
      displayText: 'Apr 1, 2026, 12:00 PM UTC',
      text: 'Created: Apr 1, 2026, 12:00 PM UTC',
    });
  });

  test('prefers updatedAt and last edited label when present', () => {
    expect(
      getNoteTimestampDetails({
        createdAt: '2026-04-01T12:00:00.000Z',
        updatedAt: '2026-04-29T14:00:00.000Z',
      })
    ).toEqual({
      label: 'Last edited',
      isoString: '2026-04-29T14:00:00.000Z',
      displayText: 'Apr 29, 2026, 2:00 PM UTC',
      text: 'Last edited: Apr 29, 2026, 2:00 PM UTC',
    });
  });

  test('returns null when note has no usable timestamp metadata', () => {
    expect(getNoteTimestampDetails({})).toBeNull();
  });
});
