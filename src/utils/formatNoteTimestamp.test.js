import {
  formatNoteTimestamp,
  getNoteTimestampDetails,
} from './formatNoteTimestamp';

function runInTimezone(timeZone, callback) {
  const originalTimeZone = process.env.TZ;
  process.env.TZ = timeZone;

  try {
    callback();
  } finally {
    process.env.TZ = originalTimeZone;
  }
}

describe('formatNoteTimestamp', () => {
  test('formats a valid ISO timestamp into readable absolute text', () => {
    runInTimezone('America/New_York', () => {
      expect(formatNoteTimestamp('2026-04-01T12:00:00.000Z')).toBe(
        'Apr 1, 2026, 8:00 AM'
      );
    });
  });

  test('returns null for an invalid timestamp', () => {
    expect(formatNoteTimestamp('not-a-date')).toBeNull();
  });
});

describe('getNoteTimestampDetails', () => {
  test('uses createdAt when a note has never been edited', () => {
    runInTimezone('America/New_York', () => {
      expect(
        getNoteTimestampDetails({
          createdAt: '2026-04-01T12:00:00.000Z',
        })
      ).toEqual({
        label: 'Created',
        isoString: '2026-04-01T12:00:00.000Z',
        displayText: 'Apr 1, 2026, 8:00 AM',
        text: 'Created: Apr 1, 2026, 8:00 AM',
      });
    });
  });

  test('prefers updatedAt and last edited label when present', () => {
    runInTimezone('America/New_York', () => {
      expect(
        getNoteTimestampDetails({
          createdAt: '2026-04-01T12:00:00.000Z',
          updatedAt: '2026-04-29T14:00:00.000Z',
        })
      ).toEqual({
        label: 'Last edited',
        isoString: '2026-04-29T14:00:00.000Z',
        displayText: 'Apr 29, 2026, 10:00 AM',
        text: 'Last edited: Apr 29, 2026, 10:00 AM',
      });
    });
  });

  test('returns null when note has no usable timestamp metadata', () => {
    expect(getNoteTimestampDetails({})).toBeNull();
  });
});
