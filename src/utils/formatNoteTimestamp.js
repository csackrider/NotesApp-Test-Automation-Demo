const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
  timeZoneName: 'short',
});

export function formatNoteTimestamp(isoString) {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return timestampFormatter.format(date);
}

export function getNoteTimestampDetails(note) {
  const isoString = note.updatedAt ?? note.createdAt;

  if (!isoString) {
    return null;
  }

  const displayText = formatNoteTimestamp(isoString);

  if (!displayText) {
    return null;
  }

  const label = note.updatedAt ? 'Last edited' : 'Created';

  return {
    label,
    isoString,
    displayText,
    text: `${label}: ${displayText}`,
  };
}
