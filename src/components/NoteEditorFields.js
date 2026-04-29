import { formatCharacterCount } from '../utils/formatCharacterCount';

export default function NoteEditorFields({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  showCharacterCount = true,
}) {
  const characterCountId = 'notetext-character-count';

  return (
    <>
      <label htmlFor="notetitle">Title:</label>
      <input
        id="notetitle"
        type="text"
        aria-required="true"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        required
        className="form-control"
      />
      <br />
      <label htmlFor="notetext">Note Text:</label>
      <textarea
        id="notetext"
        rows="10"
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        aria-describedby={showCharacterCount ? characterCountId : undefined}
        required
        className="form-control"
      />
      {showCharacterCount ? (
        <>
          <p id={characterCountId}>{formatCharacterCount(description)}</p>
          <br />
        </>
      ) : (
        <br />
      )}
    </>
  );
}
