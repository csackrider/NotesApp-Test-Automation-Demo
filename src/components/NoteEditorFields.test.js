import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import AddNote from './AddNote';
import EditNote from './EditNote';

jest.mock('axios');

function renderWithRouter(ui, initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/add" element={<AddNote />} />
        <Route path="/edit/:id" element={<EditNote />} />
      </Routes>
      {ui}
    </MemoryRouter>
  );
}

describe('note editor character count', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows 0 characters on add note and updates with textarea changes', async () => {
    renderWithRouter(null, ['/add']);

    const noteText = screen.getByLabelText('Note Text:');
    const characterCount = screen.getByText('0 characters');

    expect(characterCount).toBeInTheDocument();
    expect(noteText).toHaveAttribute('aria-describedby', 'notetext-character-count');

    await userEvent.type(noteText, 'Hello\nworld');

    expect(screen.getByText('11 characters')).toBeInTheDocument();
  });

  test('hides count on edit until note data loads, then updates live', async () => {
    axios.get.mockResolvedValue({
      data: {
        title: 'Loaded title',
        description: 'Existing note',
      },
    });

    renderWithRouter(null, ['/edit/123']);

    expect(screen.queryByText(/characters$/)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('13 characters')).toBeInTheDocument();
    });

    const noteText = screen.getByLabelText('Note Text:');
    expect(noteText).toHaveValue('Existing note');
    expect(noteText).toHaveAttribute('aria-describedby', 'notetext-character-count');

    await userEvent.type(noteText, '!');

    expect(screen.getByText('14 characters')).toBeInTheDocument();
  });
});
