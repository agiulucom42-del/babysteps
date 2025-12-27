import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app', () => {
  render(<App />);
  const loadingElement = screen.getByText(/Yükleniyor.../i);
  expect(loadingElement).toBeInTheDocument();
});
