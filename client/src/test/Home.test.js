import React from 'react';
import { render } from '@testing-library/react';
import Home from '../components/Home';

test('renders Home component', () => {
  const { getByText } = render(<Home />);
  const headingElement = getByText(/Assignment 3/i);
  expect(headingElement).toBeInTheDocument();
});