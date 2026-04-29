import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import AddNote from './AddNote';
import EditNote from './EditNote';
import ListNotes from './ListNotes';

jest.mock('axios');

describe('note timestamp integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('list shows created timestamp for seeded notes', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          title: 'Seeded note',
          description: 'Existing note',
          createdAt: '2026-04-01T12:00:00.000Z',
        },
      ],
    });

    render(
      <MemoryRouter>
        <ListNotes />
      </MemoryRouter>
    );

    expect(await screen.findByText('Seeded note')).toBeInTheDocument();

    const timestamp = screen.getByText(/Created:/);
    expect(timestamp).toHaveAttribute('id', 'notetimestamp_1');
    expect(timestamp.tagName).toBe('TIME');
    expect(timestamp).toHaveAttribute('datetime', '2026-04-01T12:00:00.000Z');
  });

  test('add note posts createdAt and returns to list with created label', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-29T14:00:00.000Z'));

    axios.post.mockResolvedValueOnce({});
    axios.get.mockResolvedValueOnce({
      data: [
        {
          id: '7',
          title: 'New note',
          description: 'Fresh text',
          createdAt: '2026-04-29T14:00:00.000Z',
        },
      ],
    });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <MemoryRouter initialEntries={['/add']}>
        <Routes>
          <Route path="/add" element={<AddNote />} />
          <Route path="/" element={<ListNotes />} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Title:'), 'New note');
    await user.type(screen.getByLabelText('Note Text:'), 'Fresh text');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith('http://localhost:3004/notes', {
        title: 'New note',
        description: 'Fresh text',
        createdAt: '2026-04-29T14:00:00.000Z',
      })
    );

    expect(await screen.findByText('New note')).toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();

    jest.useRealTimers();
  });

  test('edit note patches updatedAt and list switches to last edited label', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-29T15:30:00.000Z'));

    axios.get.mockResolvedValueOnce({
      data: {
        id: '1',
        title: 'Seeded note',
        description: 'Existing note',
        createdAt: '2026-04-01T12:00:00.000Z',
      },
    });
    axios.patch.mockResolvedValueOnce({});
    axios.get.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          title: 'Seeded note',
          description: 'Updated note text',
          createdAt: '2026-04-01T12:00:00.000Z',
          updatedAt: '2026-04-29T15:30:00.000Z',
        },
      ],
    });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <MemoryRouter initialEntries={['/edit/1']}>
        <Routes>
          <Route path="/edit/:id" element={<EditNote />} />
          <Route path="/" element={<ListNotes />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue('Seeded note')).toBeInTheDocument();

    const noteText = screen.getByLabelText('Note Text:');
    await user.clear(noteText);
    await user.type(noteText, 'Updated note text');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith('http://localhost:3004/notes/1', {
        title: 'Seeded note',
        description: 'Updated note text',
        updatedAt: '2026-04-29T15:30:00.000Z',
      })
    );

    expect(await screen.findByText('Seeded note')).toBeInTheDocument();
    const timestamp = screen.getByText(/Last edited:/);
    expect(timestamp).toBeInTheDocument();
    expect(timestamp).toHaveAttribute('datetime', '2026-04-29T15:30:00.000Z');

    jest.useRealTimers();
  });
});
