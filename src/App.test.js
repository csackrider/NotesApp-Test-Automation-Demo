import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TopNav from './components/TopNav';

test('renders navigation links', () => {
  render(
    <MemoryRouter>
      <TopNav />
    </MemoryRouter>
  );

  expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Add Note' })).toBeInTheDocument();
});
