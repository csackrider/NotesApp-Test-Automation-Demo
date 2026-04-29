import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteEditorFields from './NoteEditorFields';

describe('note editor character count', () => {
  test('shows 0 characters and updates with textarea changes', async () => {
    const handleTitleChange = jest.fn();
    const handleDescriptionChange = jest.fn();

    const { rerender } = render(
      <NoteEditorFields
        title=""
        description=""
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
        showCharacterCount
      />
    );

    const noteText = screen.getByLabelText('Note Text:');
    const characterCount = screen.getByText('0 characters');

    expect(characterCount).toBeInTheDocument();
    expect(noteText).toHaveAttribute('aria-describedby', 'notetext-character-count');

    await userEvent.type(noteText, 'Hello\nworld');
    expect(handleDescriptionChange).toHaveBeenCalled();
    const typedValue = noteText.value;

    rerender(
      <NoteEditorFields
        title=""
        description={typedValue}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
        showCharacterCount
      />
    );
    expect(screen.getByText(`${typedValue.length} characters`)).toBeInTheDocument();
  });

  test('can hide count until edit data loads and then wire helper text', () => {
    const { rerender } = render(
      <NoteEditorFields
        title=""
        description=""
        onTitleChange={jest.fn()}
        onDescriptionChange={jest.fn()}
        showCharacterCount={false}
      />
    );

    const hiddenStateTextArea = screen.getByLabelText('Note Text:');

    expect(screen.queryByText(/characters$/)).not.toBeInTheDocument();
    expect(hiddenStateTextArea).not.toHaveAttribute('aria-describedby');

    rerender(
      <NoteEditorFields
        title="Loaded title"
        description="Existing note"
        onTitleChange={jest.fn()}
        onDescriptionChange={jest.fn()}
        showCharacterCount
      />
    );

    expect(screen.getByText('13 characters')).toBeInTheDocument();
    const noteText = screen.getByLabelText('Note Text:');
    expect(noteText).toHaveValue('Existing note');
    expect(noteText).toHaveAttribute('aria-describedby', 'notetext-character-count');
  });
});
