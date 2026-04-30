function createTimestampFormatter() {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatNoteTimestamp(isoString) {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return createTimestampFormatter().format(date);
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
