import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
const mockNavigate = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ children, to, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  }),
  { virtual: true }
);

import AddNote from './AddNote';
import EditNote from './EditNote';
import ListNotes from './ListNotes';

const mockedAxios = axios;

describe('note timestamp integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('list shows created timestamp for seeded notes', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          title: 'Seeded note',
          description: 'Existing note',
          createdAt: '2026-04-01T12:00:00.000Z',
        },
      ],
    });

    render(<ListNotes />);

    expect(await screen.findByText('Seeded note')).toBeInTheDocument();

    const timestamp = screen.getByText(/Created:/);
    expect(timestamp).toHaveAttribute('id', 'notetimestamp_1');
    expect(timestamp.tagName).toBe('TIME');
    expect(timestamp).toHaveAttribute('datetime', '2026-04-01T12:00:00.000Z');
  });

  test('list shows last edited timestamp when updatedAt is present', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          title: 'Edited note',
          description: 'Existing note',
          createdAt: '2026-04-01T12:00:00.000Z',
          updatedAt: '2026-04-29T15:30:00.000Z',
        },
      ],
    });

    render(<ListNotes />);

    expect(await screen.findByText('Edited note')).toBeInTheDocument();

    const timestamp = screen.getByText(/Last edited:/);
    expect(timestamp).toHaveAttribute('id', 'notetimestamp_1');
    expect(timestamp).toHaveAttribute('datetime', '2026-04-29T15:30:00.000Z');
  });

  test('add note posts createdAt and navigates back to the list', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-29T14:00:00.000Z'));

    mockedAxios.post.mockResolvedValueOnce({});

    render(<AddNote />);

    fireEvent.change(screen.getByLabelText('Title:'), {
      target: { value: 'New note' },
    });
    fireEvent.change(screen.getByLabelText('Note Text:'), {
      target: { value: 'Fresh text' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3004/notes', {
        title: 'New note',
        description: 'Fresh text',
        createdAt: '2026-04-29T14:00:00.000Z',
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('edit note patches updatedAt and navigates back to the list', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-29T15:30:00.000Z'));

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        id: '1',
        title: 'Seeded note',
        description: 'Existing note',
        createdAt: '2026-04-01T12:00:00.000Z',
      },
    });
    mockedAxios.patch.mockResolvedValueOnce({});

    render(<EditNote />);

    expect(await screen.findByDisplayValue('Seeded note')).toBeInTheDocument();

    const noteText = screen.getByLabelText('Note Text:');
    fireEvent.change(noteText, { target: { value: 'Updated note text' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        'http://localhost:3004/notes/1',
        expect.objectContaining({
          title: 'Seeded note',
          description: 'Updated note text',
          updatedAt: expect.stringMatching(/^2026-04-29T15:30:00\.\d{3}Z$/),
        })
      )
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
